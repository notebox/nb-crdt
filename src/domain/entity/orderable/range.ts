import {uint32} from "./uint32"
import {Order, RangeOrder} from "./order"

class ClosedRange {
  readonly lower: uint32
  readonly length: uint32

  constructor(lower: uint32, length: uint32) {
    this.lower = lower
    this.length = length
  }

  get upper(): uint32 {
    return this.lower + this.length - 1
  }

  intersection(other: ClosedRange): ClosedRange {
    if (this.upper < other.lower || other.upper < this.lower) {
      throw new Error("no-intersection")
    }

    const lower = Math.max(this.lower, other.lower)
    return new ClosedRange(
      lower,
      Math.min(this.upper, other.upper) - lower + 1
    )
  }

  compare(other: ClosedRange): RangeOrder {
    const thisUpper = this.upper

    if (thisUpper < other.lower) {
      if (thisUpper + 1 === other.lower) {
        return Order.Prependable
      }

      return Order.Less
    }

    const otherUpper = other.upper

    if (otherUpper < this.lower) {
      if (otherUpper + 1 === this.lower) {
        return Order.Appendable
      }

      return Order.Greater
    }

    if (this.lower === other.lower) {
      if (thisUpper === otherUpper) {
        return Order.Equal
      }

      if (thisUpper < otherUpper) {
        return Order.IncludedLeft
      }

      return Order.IncludingLeft
    }

    if (this.lower < other.lower) {
      if (otherUpper === thisUpper) {
        return Order.IncludingRight
      }

      if (otherUpper < thisUpper) {
        return Order.IncludingMiddle
      }

      return Order.RightOverlap
    }

    if (thisUpper === otherUpper) {
      return Order.IncludedRight
    }

    if (thisUpper < otherUpper) {
      return Order.IncludedMiddle
    }

    return Order.LeftOverlap
  }
}

export {ClosedRange}
