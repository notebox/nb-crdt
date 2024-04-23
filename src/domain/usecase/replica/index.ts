import type {
  uint32,
  BlockID,
  Blocks,
  BlockChildren,
  BlockData,
  Stamp,
  INSSpan,
  OP,
  Identifier,
} from "@/domain/entity"

import {
  Point,
  Order,
  Contributor,
  Block,
  Spans,
  INSContent,
  genPointBetween,
} from "@/domain/entity"

class Replica {
  contributor: Contributor
  private blocks: Blocks
  private blockChildren: BlockChildren

  constructor(contributor: Contributor, blocks: Blocks) {
    this.contributor = contributor
    this.blocks = blocks
    this.blockChildren = genBlockChildren(blocks)
  }

  /* getter */
  get replicaID(): uint32 {
    return this.contributor.replicaID
  }

  block(blockID: BlockID): Block {
    return this.blocks[blockID]
  }

  childBlocks(blockID: BlockID, withDeleted: boolean): Block[] {
    const result = this.blockChildren[blockID] || []
    return withDeleted ? result : result.filter(block => !block.isDeleted)
  }

  findBlock(
    predicate: (
      this: void,
      value: Block,
      index: number,
      obj: Block[]
    ) => boolean
  ): Block | undefined {
    return Object.values(this.blocks).find(predicate)
  }

  prevSiblingBlock(
    blockID: BlockID,
    withDeleted: boolean = false
  ): Block | null {
    const sibling = this.siblingBlocks(blockID, withDeleted)
    if (!sibling) return null
    const [siblingBlocks, index] = sibling

    return index < 1 ? null : siblingBlocks[index - 1]
  }

  nextSiblingBlock(
    blockID: BlockID,
    withDeleted: boolean = false
  ): Block | null {
    const sibling = this.siblingBlocks(blockID, withDeleted)
    if (!sibling) return null
    const [siblingBlocks, index] = sibling

    return index === siblingBlocks.length - 1 ? null : siblingBlocks[index + 1]
  }

  prevBlock(blockID: BlockID, withDeleted: boolean = false): Block | null {
    let prev = this.prevSiblingBlock(blockID, withDeleted)
    if (!prev) {
      const block = this.blocks[blockID]
      return (block.parentBlockID && this.blocks[block.parentBlockID]) || null
    }

    let blockChildren = this.childBlocks(prev.blockID, withDeleted)
    while (blockChildren?.length) {
      prev = blockChildren[blockChildren.length - 1]
      blockChildren = this.childBlocks(prev.blockID, withDeleted)
    }

    return prev
  }

  nextBlock(blockID: BlockID, withDeleted: boolean = false): Block | null {
    const firstChild = this.childBlocks(blockID, withDeleted)[0]
    if (firstChild) return firstChild
    const nextSibling = this.nextSiblingBlock(blockID, withDeleted)
    if (nextSibling) return nextSibling

    let curBlockID: BlockID | undefined = blockID
    let result: Block | null = null

    while (!result) {
      curBlockID = this.block(curBlockID).parentBlockID
      if (!curBlockID) return null
      result = this.nextSiblingBlock(curBlockID)
    }

    return result
  }

  /* remote changes */
  genNewStamp(): Stamp {
    // TODO: Incorrect browser time can break the integrity.
    return [this.replicaID, Math.floor(Date.now())]
  }

  replaceBlock(block: Block): void {
    if (this.blocks[block.blockID]?.parentBlockID) {
      this.removeFromParentBlock(this.block(block.blockID))
    }
    this.blocks[block.blockID] = block
    this.addToParentBlock(block)
  }

  private addToParentBlock(block: Block): void {
    if (!block.parentBlockID) return
    let children = this.blockChildren[block.parentBlockID]
    if (!children) {
      children = []
      this.blockChildren[block.parentBlockID!] = children
    }
    if (children.find(child => child.blockID === block.blockID)) return

    let index = children.findIndex(
      child => child.point.compare(block.point) === Order.Greater
    )
    if (index < 0) {
      index = children.length
    }
    children.splice(index, 0, block)
  }

  private removeFromParentBlock(
    block: Block,
    parentBlockID: BlockID | undefined = undefined
  ): void {
    const parent = this.blocks[parentBlockID ?? block.parentBlockID!]
    const children = this.blockChildren[parent.blockID]
    this.blockChildren[parent.blockID] = children.filter(
      child => !child.point.equals(block.point)
    )
  }

  private siblingBlocks(
    blockID: BlockID,
    withDeleted: boolean
  ): [siblingBlocks: Block[], index: number] | null {
    const block = this.blocks[blockID]
    if (!block.parentBlockID) return null
    const siblingBlocks = this.childBlocks(block.parentBlockID, withDeleted)
    const index = siblingBlocks.findIndex(b => b.blockID === block.blockID)
    return [siblingBlocks, index]
  }

  genIdentifier(nonce: uint32): Identifier {
    return `${this.replicaID}-${nonce}` as Identifier
  }

  genPointBetween(
    nonce: uint32,
    lower?: Point,
    upper?: Point,
    isNotAppendable?: boolean
  ): Point {
    return genPointBetween(
      this.replicaID,
      nonce,
      lower,
      upper,
      isNotAppendable
    )
  }

  genBlockPoint(lower?: Point, upper?: Point): Point {
    return this.contributor.blockPointBetween(lower, upper)
  }

  genSpanFor(block: Block, content: INSContent): INSSpan {
    return block.spanFor(this.contributor.replicaID, content)
  }

  subSpans(blockID: BlockID, start: uint32, end: uint32): Spans {
    return this.blocks[blockID].text?.subSpans(start, end) || new Spans()
  }

  stringify(blockID: BlockID): string {
    return this.blocks[blockID].text?.toString() || ""
  }

  pointAt(blockID: BlockID, index: uint32): Point | undefined {
    return this.blocks[blockID].text?.pointAt(index)
  }

  insBlock(block: Block): true {
    let target: Block
    target = this.blocks[block.blockID]
    if (!target) {
      target = block
      this.blocks[target.blockID] = target
    }
    this.addToParentBlock(target)

    return true
  }

  delBlock(blockID: BlockID, op: OP.bDEL): OP.bDELReceipt | undefined {
    const block = this.blocks[blockID]
    const receipt = block.del(op)
    if (!receipt) return

    if (op.isDeleted) {
      this.removeFromParentBlock(block)
    } else {
      this.addToParentBlock(block)
    }

    return receipt
  }

  movBlock(blockID: BlockID, op: OP.bMOV): OP.bMOVReceipt | undefined {
    const block = this.blocks[blockID]
    const receipt = block.mov(op)
    if (!receipt) return

    this.removeFromParentBlock(block, receipt.from.parentBlockID)
    this.addToParentBlock(block)

    return receipt
  }

  setBlock(blockID: BlockID, op: OP.bSET): OP.bSETReceipt | undefined {
    return this.blocks[blockID].set(op)
  }

  insText(blockID: BlockID, op: OP.tINS): OP.tINSReceipt | undefined {
    return this.blocks[blockID].insText(op)
  }

  delText(blockID: BlockID, op: OP.tDEL): OP.tDELReceipt | undefined {
    return this.blocks[blockID].delText(op)
  }

  fmtText(blockID: BlockID, op: OP.tFMT): OP.tFMTReceipt | undefined {
    return this.blocks[blockID].fmtText(op)
  }

  modText(blockID: BlockID, op: OP.tMOD): OP.tMODReceipt | undefined {
    return this.blocks[blockID].modText(op)
  }

  insTextAt(blockID: BlockID, op: OP.tINSAt): OP.tINSAtReceipt | undefined {
    return this.blocks[blockID].insTextAt(op)
  }

  delTextAt(blockID: BlockID, op: OP.tDELAt): OP.tDELAtReceipt | undefined {
    return this.blocks[blockID].delTextAt(op)
  }

  fmtTextAt(blockID: BlockID, op: OP.tFMTAt): OP.tFMTAtReceipt | undefined {
    return this.blocks[blockID].fmtTextAt(op)
  }

  encode(): ReplicaData {
    return {
      replicaID: this.replicaID,
      blocks: Object.values(this.blocks).map(block => block.encode()),
    }
  }

  static decode(data: ReplicaData): Replica {
    const blocks: Blocks = {}
    const replicaID: uint32 = data.replicaID
    let blockNonce: uint32 = 0

    data.blocks.forEach(blockData => {
      const block = Block.decode(blockData)
      blocks[blockData[0]] = Block.decode(blockData)

      if (block.point.replicaID === replicaID) {
        const nonce = block.point.nonce
        if (nonce > blockNonce) {
          blockNonce = nonce
        }
      }
    })
    return new Replica(new Contributor(replicaID, blockNonce), blocks)
  }
}

const genBlockChildren = (blocks: Blocks): BlockChildren => {
  const result: BlockChildren = {}
  const blockIDs = Object.keys(blocks) as BlockID[]
  const parentBlockIDs: Set<BlockID> = new Set()

  blockIDs.forEach((blockID: BlockID) => {
    const block = blocks[blockID]
    const parentBlockID = block.parentBlockID
    if (!parentBlockID) return /** @verbose note has no parent */

    parentBlockIDs.add(parentBlockID)
    let children = result[parentBlockID]
    if (!children) {
      children = []
      result[parentBlockID] = children
    }
    children.push(block)
  })

  parentBlockIDs.forEach((blockID: BlockID) => {
    result[blockID].sort((a, b) => {
      switch (a.point.compare(b.point)) {
        case Order.Less:
          return -1
        case Order.Greater:
          return 1
        default:
          return 0
      }
    })
  })

  return result
}

export type ReplicaData = {
  replicaID: uint32;
  blocks: BlockData[];
};

export {Replica}
