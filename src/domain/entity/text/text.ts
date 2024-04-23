import type {
  uint32,
  Point,
  Contributor,
  Block,
  Stamp,
  INSDelta,
  DELDelta,
  MODDelta,
  FMTDelta,
  TextPropsDelta,
} from "@/domain/entity"
import type {INSContent} from "./content"

import {ClosedRange} from "@/domain/entity"
import {Spans, INSSpan, DELSpan, FMTSpan, MODSpan} from "./span"
import {TextNode, TextNodeData} from "./tree"
import * as command from "./command"

class Text {
  private textNode: TextNode | undefined

  constructor(textNode: TextNode | undefined) {
    this.textNode = textNode
  }

  spans(): Spans {
    return this.textNode?.spans() || new Spans()
  }

  subSpans(start: uint32, end: uint32): Spans {
    const [temp] = this.spans().splitAt(end)
    const [, mid] = temp.splitAt(start)
    return mid
  }

  length(): number {
    return this.spans().textLength()
  }

  toString(): string {
    return this.spans().toString()
  }

  /* Contribution */
  ins(span: INSSpan): INSDelta[] {
    if (this.textNode) {
      const ins = command.ins(this.textNode, span, 0)
      this.textNode = this.textNode.balance()!
      return ins
    }
    this.textNode = new TextNode(span)
    return [{index: 0, content: span.content}]
  }

  del(span: DELSpan): DELDelta[] {
    if (this.textNode) {
      const dels = command.del(this.textNode, span, 0)
      this.textNode = this.textNode.balance()!
      return dels
    }
    return []
  }

  fmt(span: FMTSpan): FMTDelta[] {
    if (this.textNode) {
      return command.fmt(this.textNode, span, 0)
    }
    return []
  }

  mod(span: MODSpan): MODDelta[] {
    if (this.textNode) {
      return command.mod(this.textNode, span, 0)
    }
    return []
  }

  insAt(
    index: uint32,
    content: INSContent,
    contributor: Contributor,
    block: Block
  ): INSSpan {
    if (this.textNode) {
      const insSpan = command.insAt(
        this.textNode,
        index,
        content,
        contributor,
        block
      )
      this.textNode = this.textNode.balance()
      return insSpan
    }

    const insSpan = block.spanFor(contributor.replicaID, content)
    this.textNode = new TextNode(insSpan)

    return insSpan
  }

  fmtAt(
    index: uint32,
    length: uint32,
    props: TextPropsDelta,
    stamp: Stamp
  ): FMTSpan[] {
    if (this.textNode) {
      const range = new ClosedRange(index, length)
      return command.fmtAt(this.textNode, range, props, stamp, 0)
    }
    return []
  }

  delAt(index: uint32, length: uint32): Spans | undefined {
    if (this.textNode) {
      const range = new ClosedRange(index, length)
      const dels = command.delAt(this.textNode, range, 0)
      this.textNode = this.textNode.balance()!
      return dels.length > 0 ? dels : undefined
    }
    return undefined
  }

  pointAt(index: uint32): Point | undefined {
    if (this.textNode) {
      return command.pointAt(this.textNode, index)
    }
    return undefined
  }

  /* Encoding */
  encode(): TextNodeData {
    return this.textNode?.encode() || []
  }

  static decode(data: TextNodeData): Text {
    return new Text(data.length ? TextNode.decode(data) : undefined)
  }
}

export {Text}
