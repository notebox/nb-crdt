import {Order} from "./order"
import {uint32MIN, uint32MID, uint32MAX, compare, validated} from "./uint32"

describe("@entity.orderable.uint32", () => {
  describe("compare", () => {
    it("should work", () => {
      expect(compare(4, 5)).toBe(Order.Less)
      expect(compare(5, 5)).toBe(Order.Equal)
      expect(compare(6, 5)).toBe(Order.Greater)
    })
  })

  describe("constants", () => {
    it("should be valid", () => {
      expect(uint32MIN).toBe(0)
      expect(uint32MID).toBe(2147483647)
      expect(uint32MAX).toBe(4294967295)
    })
  })

  describe("validated", () => {
    it("should work", () => {
      expect(() => validated(uint32MIN - 1)).toThrowError()
      expect(() => validated(uint32MIN)).not.toThrowError()
      expect(() => validated(uint32MAX)).not.toThrowError()
      expect(() => validated(uint32MAX + 1)).toThrowError()
    })
  })
})
