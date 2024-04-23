import type {uint32, INSSpan, SpanData, INSContentData} from "@/domain/entity"

import {Order, Point, INSContent, Span, Spans} from "@/domain/entity"

class TextNode {
  /* general avl */
  left?: TextNode
  right?: TextNode
  rank: number
  /* case specific */
  span: INSSpan
  length: number
  shouldBeDeleted: boolean

  constructor(span: INSSpan, left?: TextNode, right?: TextNode) {
    this.span = span
    this.left = left
    this.right = right
    this.rank = 0
    this.length = 0
    this.shouldBeDeleted = false
    this.update()
  }

  /* getter */
  leftLength(): uint32 {
    return lengthOf(this.left)
  }

  minSpan(): INSSpan {
    return this.left ? this.left.minSpan() : this.span
  }

  maxSpan(): INSSpan {
    return this.right ? this.right.maxSpan() : this.span
  }

  predecessorSpan(): INSSpan | undefined {
    return this.left ? this.left.maxSpan() : undefined
  }

  successorSpan(): INSSpan | undefined {
    return this.right ? this.right.minSpan() : undefined
  }

  spans(): Spans {
    let spans: Spans = new Spans()

    if (this.left) {
      spans = spans.concat(this.left.spans())
    }

    spans.push(this.span)

    if (this.right) {
      spans = spans.concat(this.right.spans())
    }

    return spans
  }

  /* setter */
  setLeft(left?: TextNode): void {
    this.left = left
    this.update()
  }

  setRight(right?: TextNode): void {
    this.right = right
    this.update()
  }

  setSpan(span: INSSpan): void {
    const delta = span.length - this.span.length
    this.span = span
    this.length += delta
  }

  /* balance */
  balance(): TextNode | undefined {
    if (this.shouldBeDeleted) return undefined

    // eslint-disable-next-line @typescript-eslint/no-this-alias
    let textNode: TextNode = this
    while (textNode.isRightUnbalanced()) {
      textNode = textNode.rotateLeft()
    }
    while (textNode.isLeftUnbalanced()) {
      if (textNode.left!.isRightOriented()) {
        textNode.setLeft(textNode.left!.rotateLeft())
      }
      textNode = textNode.rotateRight()
    }
    return textNode
  }

  /* insert */
  insertPredecessor(span: INSSpan): void {
    const left = this.left ? this.left.insertMAX(span) : new TextNode(span)

    this.setLeft(left)
  }

  insertSuccessor(span: INSSpan): void {
    const right = this.right ? this.right.insertMIN(span) : new TextNode(span)

    this.setRight(right)
  }

  insertMIN(span: INSSpan): TextNode {
    const left = this.left ? this.left.insertMIN(span) : new TextNode(span)
    this.setLeft(left)

    return this.balance()!
  }

  insertMAX(span: INSSpan): TextNode {
    const right = this.right ? this.right.insertMAX(span) : new TextNode(span)
    this.setRight(right)

    return this.balance()!
  }

  /* delete */
  deletePredecessor(): void {
    if (this.left) {
      this.setLeft(this.left.deleteMAX())
    }
  }

  deleteSuccessor(): void {
    if (this.right) {
      this.setRight(this.right.deleteMIN())
    }
  }

  deleteMIN(): TextNode | undefined {
    if (this.left) {
      this.setLeft(this.left.deleteMIN())
      return this.balance()
    }

    return this.right
  }

  deleteMAX(): TextNode | undefined {
    if (this.right) {
      this.setRight(this.right.deleteMAX())
      return this.balance()
    }

    return this.left
  }

  deleteSelf(): void {
    const succ = this.successorSpan()
    if (succ) {
      this.deleteSuccessor()
      this.setSpan(succ)
      this.mergeLeft()

      return
    }

    const prev = this.predecessorSpan()
    if (prev) {
      this.deletePredecessor()
      this.setSpan(prev)

      return
    }

    this.shouldBeDeleted = true
  }

  /* merge */
  mergeLeft(): void {
    const curr = this.span
    if (curr.content.isMeta()) return

    const prev = this.predecessorSpan()
    if (
      prev &&
      !prev.content.isMeta() &&
      prev.compare(curr) === Order.Prependable
    ) {
      this.deletePredecessor()
      this.setSpan(prev.append(curr))
    }
  }

  mergeRight(): void {
    const curr = this.span
    if (curr.content.isMeta()) return

    const succ = this.successorSpan()
    if (
      succ &&
      !succ.content.isMeta() &&
      succ.compare(curr) === Order.Appendable
    ) {
      this.deleteSuccessor()
      this.setSpan(curr.append(succ))
    }
  }

  encode(): Data {
    return this.spans().map(span => span.encode())
  }

  static decode(data?: Data): TextNode | undefined {
    if (!data) return undefined

    return TextNode.fromSpans(
      data.map(
        d =>
          new Span(
            Point.decode(d[0]),
            INSContent.decode(d[1] as INSContentData)
          )
      )
    )
  }

  static fromSpans(spans: INSSpan[]): TextNode | undefined {
    if (spans.length === 0) return undefined

    const count = spans.length
    const midIndex = Math.floor(count / 2)

    let left, right: TextNode | undefined
    if (midIndex > 0) {
      left = TextNode.fromSpans(spans.slice(0, midIndex))
    }
    const span = spans[midIndex]
    if (midIndex < count - 1) {
      right = TextNode.fromSpans(spans.slice(midIndex + 1))
    }

    return new TextNode(span, left, right)
  }

  /* setter */
  private update(): void {
    this.rank = 1 + Math.max(rankOf(this.left), rankOf(this.right))
    this.length = lengthOf(this.left) + this.span.length + lengthOf(this.right)
  }

  /* balancer */
  private balanceFactor(): number {
    return rankOf(this.right) - rankOf(this.left)
  }

  private isRightUnbalanced(): boolean {
    return this.balanceFactor() > 1
  }

  private isRightOriented(): boolean {
    return this.balanceFactor() === 1
  }

  private isLeftUnbalanced(): boolean {
    return this.balanceFactor() < -1
  }

  private rotateLeft(): TextNode {
    const r = this.right!
    this.setRight(r.left)
    r.setLeft(this)
    return r
  }

  private rotateRight(): TextNode {
    const l = this.left!
    this.setLeft(l.right)
    l.setRight(this)
    return l
  }
}

const rankOf = (textNode?: TextNode): number => (textNode ? textNode.rank : 0)
const lengthOf = (textNode?: TextNode): number =>
  textNode ? textNode.length : 0

export type Data = SpanData[];

export {TextNode}
