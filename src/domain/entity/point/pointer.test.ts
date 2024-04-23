import {genPointBetween} from "./pointer"
import {Point, tagMIN, tagMAX} from "@/domain/entity"

describe("@entity.pointer.genPointBetween", () => {
  describe("should handle edge cases", () => {
    describe("MIN", () => {
      const taggedPoint = [
        [0, 0, 1],
        [2147483647, 5, 2],
      ]
      it("MIN MIN (should not happened)", () => {
        const lPoint = Point.decode([
          [tagMIN.priority, tagMIN.replicaID, tagMIN.nonce],
        ])
        const uPoint = Point.decode([
          [tagMIN.priority, tagMIN.replicaID, tagMIN.nonce + 1],
        ])
        const appendable = genPointBetween(5, 1, lPoint, uPoint, true)
        const notAppendable = genPointBetween(5, 1, lPoint, uPoint, false)
        expect(appendable).toStrictEqual(notAppendable)
        expect(appendable.encode()).toStrictEqual(taggedPoint)
      })

      it("MIN MIN+1", () => {
        const lPoint = Point.decode([
          [tagMIN.priority, tagMIN.replicaID, tagMIN.nonce],
        ])
        const uPoint = Point.decode([
          [tagMIN.priority + 1, tagMIN.replicaID, tagMIN.nonce + 1],
        ])
        const appendable = genPointBetween(5, 1, lPoint, uPoint, true)
        const notAppendable = genPointBetween(5, 1, lPoint, uPoint, false)
        expect(appendable).toStrictEqual(notAppendable)
        expect(appendable.encode()).toStrictEqual(taggedPoint)
      })

      it("MIN MIN+2", () => {
        const lPoint = Point.decode([
          [tagMIN.priority, tagMIN.replicaID, tagMIN.nonce],
        ])
        const uPoint = Point.decode([
          [tagMIN.priority + 2, tagMIN.replicaID, tagMIN.nonce + 1],
        ])
        const appendable = genPointBetween(5, 1, lPoint, uPoint, true)
        const notAppendable = genPointBetween(5, 1, lPoint, uPoint, false)
        expect(appendable).toStrictEqual(notAppendable)
        expect(appendable.encode()).toStrictEqual([
          [tagMIN.priority + 1, 5, 2],
        ])
      })
    })

    describe("MAX", () => {
      it("MAX MAX (should not happened)", () => {
        const lPoint = Point.decode([
          [tagMAX.priority, tagMAX.replicaID, tagMAX.nonce],
        ])
        const uPoint = Point.decode([
          [tagMAX.priority, tagMAX.replicaID, tagMAX.nonce + 1],
        ])
        const appendable = genPointBetween(5, 1, lPoint, uPoint, true)
        const notAppendable = genPointBetween(5, 1, lPoint, uPoint, false)
        expect(appendable).toStrictEqual(notAppendable)
        expect(appendable.encode()).toStrictEqual([
          [4294967295, 0, 2],
          [2147483647, 5, 2],
        ])
      })

      it("MAX-1 MAX", () => {
        const lPoint = Point.decode([
          [tagMAX.priority - 1, tagMAX.replicaID, tagMAX.nonce],
        ])
        const uPoint = Point.decode([
          [tagMAX.priority, tagMAX.replicaID, tagMAX.nonce + 1],
        ])
        const appendable = genPointBetween(5, 1, lPoint, uPoint, true)
        const notAppendable = genPointBetween(5, 1, lPoint, uPoint, false)
        expect(appendable).toStrictEqual(notAppendable)
        expect(appendable.encode()).toStrictEqual([
          [4294967294, 0, 2],
          [2147483647, 5, 2],
        ])
      })

      it("MAX-2 MAX", () => {
        const lPoint = Point.decode([
          [tagMAX.priority - 2, tagMAX.replicaID, tagMAX.nonce],
        ])
        const uPoint = Point.decode([
          [tagMAX.priority, tagMAX.replicaID, tagMAX.nonce + 1],
        ])
        const appendable = genPointBetween(5, 1, lPoint, uPoint, true)
        const notAppendable = genPointBetween(5, 1, lPoint, uPoint, false)
        expect(appendable).toStrictEqual(notAppendable)
        expect(appendable.encode()).toStrictEqual([
          [tagMAX.priority - 1, 5, 2],
        ])
      })
    })
  })
})
