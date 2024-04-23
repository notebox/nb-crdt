import type {uint32, BasicOrder, PointOrder} from "@/domain/entity"
import type {Data} from "./point"

import {uint32MIN, uint32MID, uint32MAX, Order} from "@/domain/entity"
import {Point, pointMIN, pointMID, pointMAX} from "./point"

describe("@entity.point", () => {
  describe("constants", () => {
    it("should work", () => {
      expect(pointMIN).toStrictEqual(Point.decode([[uint32MIN, 0, 1]]))
      expect(pointMID).toStrictEqual(Point.decode([[uint32MID, 0, 3]]))
      expect(pointMAX).toStrictEqual(Point.decode([[uint32MAX, 0, 2]]))
    })
  })

  describe("getters", () => {
    it("should work", () => {
      const subject = Point.decode([
        [3, 30, 300],
        [5, 50, 500],
      ])
      expect(subject.replicaID).toBe(50)
      expect(subject.nonce).toBe(500)
      expect(subject.identifier).toBe("50-500")
    })
  })

  describe("clone", () => {
    it("should work", () => {
      const subject = Point.decode([
        [3, 30, 300],
        [5, 50, 500],
      ])
      const cloned = subject.clone()

      expect(cloned).toStrictEqual(subject)
      for (let i = 0; i < subject.tags.length; i++) {
        expect(subject.tags[i] === cloned.tags[i]).toBe(false)
      }
    })
  })

  describe("withNonce", () => {
    it("should work", () => {
      const subject = Point.decode([
        [3, 30, 300],
        [5, 50, 500],
      ])
      const result = subject.withNonce(9)
      const expected = Point.decode([
        [3, 30, 300],
        [5, 50, 9],
      ])

      expect(result).toStrictEqual(expected)
      expect(subject.nonce).toBe(500)
    })
  })

  describe("offset", () => {
    it("should work", () => {
      const subject = Point.decode([
        [3, 30, 300],
        [5, 50, 500],
      ])
      const result = subject.offset(9)
      const expected = Point.decode([
        [3, 30, 300],
        [5, 50, 509],
      ])

      expect(result).toStrictEqual(expected)
      expect(subject.nonce).toBe(500)
    })
  })

  describe("equals", () => {
    it("should check only replicaID and nonce of last tags", () => {
      const subject = Point.decode([
        [3, 30, 300],
        [5, 50, 500],
      ])

      equalsTestTables.forEach(table => {
        expect(subject.equals(Point.decode(table[1]))).toBe(table[0])
      })
    })
  })

  describe("compare", () => {
    it("should work", () => {
      const subject = Point.decode([
        [3, 30, 300],
        [5, 50, 500],
      ])
      compareTestTables.forEach(table => {
        expect(subject.compare(Point.decode(table[1]))).toBe(table[0])
      })
    })
  })

  describe("compareBase", () => {
    it("should work", () => {
      const subject = Point.decode([
        [3, 30, 300],
        [5, 50, 500],
      ])
      compareBaseTestTables.forEach(table => {
        expect(subject.compareBase(Point.decode(table[1]))).toBe(table[0])
      })
    })
  })

  describe("distanceFrom", () => {
    const subject = Point.decode([[5, 50, 500]])

    it("should throw if the argument has not the same base", () => {
      expect(() =>
        subject.distanceFrom(Point.decode([[5, 49, 500]]))
      ).toThrowError()
    })

    it("should work", () => {
      distanceFromTestTables.forEach(table => {
        const result = subject.distanceFrom(Point.decode(table[2]))
        expect(result[0]).toBe(table[0])
        expect(result[1]).toBe(table[1])
      })
    })
  })

  describe("encoding", () => {
    it("should work", () => {
      const data: Data = [[1, 3, 5]]
      const subject = Point.decode(data)

      expect(subject.encode()).toStrictEqual(data)
    })
  })
})

const distanceFromTestTables: [uint32, BasicOrder, Data][] = [
  [9, Order.Less, [[5, 50, 509]]],
  [0, Order.Equal, [[5, 50, 500]]],
  [9, Order.Greater, [[5, 50, 491]]],
]

const compareTestTables: [BasicOrder, Data][] = [
  [
    Order.Equal,
    [
      [3, 30, 300],
      [5, 50, 500],
    ],
  ],
  [
    Order.Less,
    [
      [3, 30, 300],
      [5, 50, 501],
    ],
  ],
  [
    Order.Greater,
    [
      [3, 30, 300],
      [5, 50, 499],
    ],
  ],
  [
    Order.Less,
    [
      [3, 30, 300],
      [5, 50, 500],
      [1, 10, 100],
    ],
  ],
  [Order.Greater, [[3, 30, 300]]],
]

const compareBaseTestTables: [PointOrder, Data][] = [
  [
    Order.Equal,
    [
      [3, 30, 300],
      [5, 50, 500],
    ],
  ],
  [
    Order.Equal,
    [
      [3, 30, 300],
      [5, 50, 501],
    ],
  ],
  [
    Order.Equal,
    [
      [3, 30, 300],
      [5, 50, 499],
    ],
  ],
  [Order.Less, [[3, 31, 300]]],
  [
    Order.Less,
    [
      [3, 31, 300],
      [5, 49, 500],
    ],
  ],
  [Order.Greater, [[3, 29, 300]]],
  [
    Order.Greater,
    [
      [3, 29, 300],
      [5, 51, 500],
    ],
  ],
  [
    Order.Tagged,
    [
      [3, 30, 300],
      [5, 50, 500],
      [7, 70, 700],
    ],
  ],
  [Order.Tagging, [[3, 30, 300]]],
]

const equalsTestTables: [boolean, Data][] = [
  [true, [[0, 50, 500]]],
  [
    true,
    [
      [9, 90, 900],
      [0, 50, 500],
    ],
  ],
  [
    false,
    [
      [3, 30, 300],
      [5, 51, 500],
    ],
  ],
  [
    false,
    [
      [3, 30, 300],
      [5, 50, 501],
    ],
  ],
]
