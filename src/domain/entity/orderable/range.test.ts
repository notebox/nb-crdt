import {Order} from "./order"
import {ClosedRange} from "./range"

describe("@entity.orderable.range", () => {
  describe("intersection", () => {
    it("should work", () => {
      const subject = new ClosedRange(5, 3)
      const target = new ClosedRange(6, 3)
      const expected = new ClosedRange(6, 2)

      expect(subject.intersection(target)).toStrictEqual(expected)
      expect(target.intersection(subject)).toStrictEqual(expected)
    })

    it("should throw if there is no intersection", () => {
      const subject = new ClosedRange(5, 3)
      const target = new ClosedRange(4, 1)

      expect(() => subject.intersection(target)).toThrowError()
      expect(() => target.intersection(subject)).toThrowError()
    })
  })

  describe("compare", () => {
    it("should work", () => {
      const subject = new ClosedRange(5, 3)
      const orders: [Order, ClosedRange][] = [
        [Order.Less, new ClosedRange(9, 2)],
        [Order.Prependable, new ClosedRange(8, 1)],
        [Order.RightOverlap, new ClosedRange(7, 2)],
        [Order.IncludingRight, new ClosedRange(7, 1)],
        [Order.IncludingMiddle, new ClosedRange(6, 1)],
        [Order.IncludingLeft, new ClosedRange(5, 1)],
        [Order.Equal, new ClosedRange(5, 3)],
        [Order.IncludedLeft, new ClosedRange(5, 5)],
        [Order.IncludedMiddle, new ClosedRange(4, 5)],
        [Order.IncludedRight, new ClosedRange(3, 5)],
        [Order.LeftOverlap, new ClosedRange(4, 2)],
        [Order.Appendable, new ClosedRange(4, 1)],
        [Order.Greater, new ClosedRange(2, 2)],
      ]
      orders.forEach(tuple => {
        expect(subject.compare(tuple[1])).toBe(tuple[0])
      })
    })
  })
})
