import type {
  uint32,
  PointData,
  TextNodeData,
  BlockType,
  BlockProps,
  OP,
  AdjacentPoints,
  INSContent,
  Stamp,
  Props,
  Identifier,
} from "@/domain/entity"

import {
  Point,
  genPointBetween,
  Text,
  Span,
  checkIfNewerStamp,
  checkIfNewerOrEqualStamp,
  isProps,
} from "@/domain/entity"

class BlockBase {
  blockID: BlockID
  version: BlockVersion
  point: Point
  props: BlockProps
  isDeleted: boolean
  text?: Text
  parentBlockID?: BlockID

  constructor(
    blockID: BlockID,
    version: BlockVersion,
    point: Point,
    props: BlockProps,
    isDeleted: boolean,
    text?: Text,
    parentBlockID?: BlockID
  ) {
    this.blockID = blockID
    this.version = version
    this.point = point
    this.props = props
    this.isDeleted = isDeleted
    this.text = text
    this.parentBlockID = parentBlockID
  }

  get type(): BlockType {
    return this.props.TYPE[1]
  }

  hasText(): this is TextBlock {
    return !!this.text
  }

  encode(): BlockData {
    return [
      this.blockID,
      this.version,
      this.point.encode(),
      this.props,
      this.isDeleted,
      this.text?.encode(),
      this.parentBlockID,
    ]
  }

  static decode(data: BlockData): Block {
    return new Block(
      data[0],
      data[1],
      data[2] && Point.decode(data[2]),
      data[3],
      data[4],
      data[5] && Text.decode(data[5]),
      data[6]
    )
  }
}

export class Block extends BlockBase {
  genIdentifier(replicaID: uint32, length: uint32): Identifier {
    const nonce = this.pointNonce(replicaID) + length
    const result = `${replicaID}-${nonce}` as Identifier
    this.increasePointNonce(replicaID, length)
    return result
  }

  genPoint(
    replicaID: uint32,
    length: uint32,
    lower?: Point,
    upper?: Point,
    isNotAppendable?: boolean
  ): Point {
    const point = genPointBetween(
      replicaID,
      this.pointNonce(replicaID),
      lower,
      upper,
      isNotAppendable
    )
    this.increasePointNonce(replicaID, length)
    return point
  }

  spanFor(
    replicaID: uint32,
    content: INSContent,
    adjPoints: AdjacentPoints | undefined = {}
  ): Span<INSContent> {
    if (content.length < 1) throw new Error("no-empty-content")

    const point = genPointBetween(
      replicaID,
      this.pointNonce(replicaID),
      adjPoints.lower,
      adjPoints.upper,
      content.isMeta()
    )

    this.increasePointNonce(replicaID, content.length)
    return new Span<INSContent>(point, content)
  }

  private pointNonce(replicaID: uint32): uint32 {
    return this.version[replicaID]?.[1] || 0
  }

  private increasePointNonce(replicaID: uint32, length: uint32) {
    const nonce = this.version[replicaID] || [0, 0]
    this.version[replicaID] = [nonce[0], nonce[1] + length] as ReplicaNonce
  }

  private updateVersion(op: OP.Base): OP.Version | undefined {
    if (op.contributor.nonce) {
      this.version[op.contributor.replicaID] = op.contributor.nonce
      return
    }

    const nonce = this.version[op.contributor.replicaID] || [0, 0]
    const version = {
      replicaID: op.contributor.replicaID,
      nonce: [nonce[0] + 1, nonce[1]] as ReplicaNonce,
    }
    this.version[version.replicaID] = version.nonce
    return version
  }

  mov(op: OP.bMOV): OP.bMOVReceipt | undefined {
    if (!checkIfNewerStamp(this.props.MOV?.[0], op.stamp)) return

    const from = {
      parentBlockID: this.parentBlockID!,
      point: this.point,
    }
    const to = {
      parentBlockID: op.parentBlockID,
      point: op.point,
    }
    this.parentBlockID = to.parentBlockID
    this.point = to.point
    this.props.MOV = [op.stamp]

    return {
      blockID: this.blockID,
      version: this.updateVersion(op),
      from,
      to,
    }
  }

  del(op: OP.bDEL): OP.bDELReceipt | undefined {
    if (!checkIfNewerStamp(this.props.DEL?.[0], op.stamp)) return

    const from = this.isDeleted
    this.isDeleted = op.isDeleted
    this.props.DEL = [op.stamp]

    return {
      blockID: this.blockID,
      version: this.updateVersion(op),
      from,
      to: op.isDeleted,
    }
  }

  set(op: OP.bSET): OP.bSETReceipt | undefined {
    const result = setProp(this.props, op.props as GeneralProps, op.stamp)
    if (!result) return

    return {
      blockID: this.blockID,
      version: this.updateVersion(op),
      from: result.from,
      to: result.to,
    }
  }

  insText(op: OP.tINS): OP.tINSReceipt | undefined {
    return {
      blockID: this.blockID,
      delta: this.text!.ins(op.span),
      version: this.updateVersion(op),
    }
  }

  delText(op: OP.tDEL): OP.tDELReceipt | undefined {
    return {
      blockID: this.blockID,
      delta: this.text!.del(op.span),
      version: this.updateVersion(op),
    }
  }

  fmtText(op: OP.tFMT): OP.tFMTReceipt | undefined {
    this.text!.fmt(op.span)
    return {
      blockID: this.blockID,
      version: this.updateVersion(op),
    }
  }

  modText(op: OP.tMOD): OP.tMODReceipt | undefined {
    this.text!.mod(op.span)
    return {
      blockID: this.blockID,
      version: this.updateVersion(op),
      span: op.span,
    }
  }

  insTextAt(op: OP.tINSAt): OP.tINSAtReceipt | undefined {
    return {
      blockID: this.blockID,
      span: this.text!.insAt(op.index, op.content, op.contributor, this),
      version: this.updateVersion(op),
    }
  }

  delTextAt(op: OP.tDELAt): OP.tDELAtReceipt | undefined {
    const spans = this.text!.delAt(op.index, op.length)
    return (
      spans && {
        blockID: this.blockID,
        spans,
        version: this.updateVersion(op),
      }
    )
  }

  fmtTextAt(op: OP.tFMTAt): OP.tFMTAtReceipt | undefined {
    const spans = this.text!.fmtAt(op.index, op.length, op.props, op.stamp)
    return (
      spans && {
        blockID: this.blockID,
        spans,
        version: this.updateVersion(op),
      }
    )
  }
}

export type UUID = string;
export type BlockID = UUID;
export type TextBlock = Block & {text: Text};
export type BlockPosition = {
  parentBlockID: BlockID;
  point: Point;
};
export type ReplicaNonce = [ctrbNonce: uint32, pointNonce: uint32];
export type BlockVersion = {
  [replicaID: number]: ReplicaNonce;
};

export type BlockData = [
  blockID: BlockID,
  version: BlockVersion,
  point: PointData,
  props: BlockProps,
  isDeleted: boolean,
  text?: TextNodeData,
  parentBlockID?: BlockID
];

export type Blocks = {[blockID: string]: Block};
export type BlockChildren = {[blockID: string]: Block[]};

/* eslint-disable-next-line @typescript-eslint/no-explicit-any */
type GeneralProps = Props & {[key: string]: any};

const setProp = (
  props: GeneralProps,
  delta: GeneralProps,
  stamp: Stamp,
  from: GeneralProps | undefined = {},
  to: GeneralProps | undefined = {}
) => {
  (Object.keys(delta) as string[]).forEach(key => {
    const toValue = delta[key]
    let fromProp = props[key]

    if (isProps(toValue)) {
      if (!fromProp) {
        fromProp = {}
        props[key] = fromProp
      }

      const result = setProp(fromProp, toValue, stamp, from[key], to[key])
      if (result) {
        from[key] = result.from
        to[key] = result.to
      }

      return
    }

    if (!checkIfNewerOrEqualStamp(fromProp?.[0], stamp)) return
    const fromValue = fromProp?.[1]
    if (fromValue == toValue) return
    from[key] = fromValue || null
    to[key] = toValue
    props[key] = toValue === null ? [stamp] : [stamp, toValue]
    return
  })

  if (Object.keys(to).length === 0) return
  return {from, to}
}
