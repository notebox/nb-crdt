import type {
  uint32,
  SpanOrder,
  PointData,
  AbstractContent,
  ContentData,
} from "@/domain/entity"

import {
  Order,
  ClosedRange,
  Point,
  INSContent,
  DELContent,
} from "@/domain/entity"

export class Span<Type extends AbstractContent> {
  readonly lowerPoint: Point
  readonly content: Type

  constructor(lowerPoint: Point, content: Type) {
    if (content.length < 1) throw new Error("no-empty-content")
    this.lowerPoint = lowerPoint
    this.content = content
  }

  get length(): uint32 {
    return this.content.length
  }

  get replicaID(): uint32 {
    return this.lowerPoint.replicaID
  }

  /**
   * @returns new Point
   */
  get upperPoint(): Point {
    return this.nthPoint(this.length - 1)
  }

  /**
   * @returns new Point
   */
  nthPoint(nth: uint32): Point {
    return this.lowerPoint.offset(nth)
  }

  seqs(): ClosedRange {
    return new ClosedRange(this.lowerPoint.nonce, this.length)
  }

  compare(other: Span<AbstractContent>): SpanOrder {
    const baseComp = this.lowerPoint.compareBase(other.lowerPoint)
    switch (baseComp) {
      case Order.Less:
      case Order.Greater:
        return baseComp
      case Order.Equal:
        return this.seqs().compare(other.seqs())
      case Order.Tagged: {
        const [dist, order] = this.lowerPoint.distanceFrom(other.lowerPoint)
        if (order === Order.Greater) return order
        if (dist >= this.length - 1) return Order.Less
        return Order.Splitted
      }
      case Order.Tagging: {
        const [dist, order] = this.lowerPoint.distanceFrom(other.lowerPoint)
        if (order === Order.Less) return order
        if (dist >= other.length - 1) return Order.Greater
        return Order.Splitting
      }
    }
  }

  /**
   * @returns new Span<DELContent>
   */
  toDELSpan(): Span<DELContent> {
    return new Span(this.lowerPoint, new DELContent(this.length))
  }

  /**
   * @param other should be appendable to this span
   * @returns new Span<Type>
   */
  append(other: Span<Type>): Span<Type> {
    return new Span<Type>(
      this.lowerPoint,
      this.content.concat(other.content) as Type
    )
  }

  /**
   * @returns new Span
   */
  leftSplitAt(index: uint32): Span<Type> {
    const leftContents = this.content.slice(0, index)
    return new Span<Type>(this.lowerPoint, leftContents as Type)
  }

  /**
   * @returns new Span
   */
  rightSplitAt(index: uint32): Span<Type> {
    const rightContents = this.content.slice(index, this.length)
    const rightPoint = this.nthPoint(index)
    return new Span<Type>(rightPoint, rightContents as Type)
  }

  /**
   * @returns new Spans
   */
  splitAt(index: uint32): [left: Span<Type>, right: Span<Type>] {
    return [this.leftSplitAt(index), this.rightSplitAt(index)]
  }

  /**
   * @param other should be splitting this span
   * @returns new Spans
   */
  splitWith(other: Span<Type>): [left: Span<Type>, right: Span<Type>] {
    const [dist] = this.lowerPoint.distanceFrom(other.lowerPoint)

    return this.splitAt(dist + 1)
  }

  /**
   * @param other should have the prependable segment to the some segment of this
   * @returns new Span<Type>
   */
  getAppendableSegmentTo(other: Span<AbstractContent>): Span<Type> {
    const [dist, order] = this.lowerPoint.distanceFrom(other.lowerPoint)
    if (order === Order.Less) return this.rightSplitAt(other.length + dist)

    const index = other.length - dist
    if (index < 0) throw new Error("un-appendable")

    return this.rightSplitAt(index)
  }

  /**
   * @param other should have the appendable segment to the some segment of this
   * @returns new Span<Type>
   */
  getPrependableSegmentTo(other: Span<AbstractContent>): Span<Type> {
    const [dist, order] = this.lowerPoint.distanceFrom(other.lowerPoint)

    if (order !== Order.Less || dist > this.length)
      throw new Error("un-prependable")
    return this.leftSplitAt(dist)
  }

  /**
   * @param other should have intersection
   * @returns new Span<Type>
   */
  intersection(other: Span<Type>): Span<Type> {
    switch (this.compare(other)) {
      case Order.Splitted:
      case Order.Less:
      case Order.Prependable:
      case Order.Appendable:
      case Order.Greater:
      case Order.Splitting:
        throw new Error("no-intersection")
      default:
        break
    }

    const [dist, order] = this.lowerPoint.distanceFrom(other.lowerPoint)
    let lowerPoint: Point
    let content: Type
    if (order === Order.Less) {
      const length = Math.min(this.length - dist, other.length)
      content = this.content.slice(dist, dist + length) as Type
      lowerPoint = other.lowerPoint
    } else {
      const length = Math.min(other.length - dist, this.length)
      content = this.content.slice(0, length) as Type
      lowerPoint = this.lowerPoint
    }
    return new Span<Type>(lowerPoint, content)
  }

  clone(): Span<Type> {
    return new Span<Type>(
      this.lowerPoint.clone(),
      /* eslint-disable-next-line @typescript-eslint/no-explicit-any */
      (this.content as any).clone() as Type
    )
  }

  encode(): Data {
    return [this.lowerPoint.encode(), this.content.encode()]
  }

  static decodeText(data: TextINSSpanData): Span<INSContent> {
    return new Span<INSContent>(
      Point.decode(data[0]),
      INSContent.decode([[[data[1].length]], data[1]])
    )
  }
}

export type TextINSSpanData = [lowerPoint: PointData, text: string];
export type Data = [lowerPoint: PointData, content: ContentData];
