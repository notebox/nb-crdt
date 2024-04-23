import {Order, uint32MIN, uint32MAX} from "@/domain/entity"
import {Tag} from "./tag"

describe("@entity.point.tag", () => {
  describe("clone", () => {
    it("should work", () => {
      const subject = new Tag(5, 50, 500)
      const result = subject.clone()

      expect(result).toStrictEqual(subject)
    })
  })

  describe("withNonce", () => {
    const subject = new Tag(5, 50, 500)
    it("should work", () => {
      expect(subject.withNonce(3)).toStrictEqual(new Tag(5, 50, 3))
    })

    it("should throw when the nonce is not an uint32", () => {
      expect(() => subject.withNonce(uint32MIN - 1)).toThrowError()
      expect(() => subject.withNonce(uint32MAX + 1)).toThrowError()
    })
  })

  describe("offset", () => {
    it("should work", () => {
      expect(new Tag(5, 50, 500).offset(1)).toStrictEqual(new Tag(5, 50, 501))
    })

    it("should throw when the nonce is not an uint32", () => {
      expect(() => new Tag(5, 50, uint32MAX).offset(1)).toThrowError()
      expect(() => new Tag(5, 50, uint32MIN).offset(-1)).toThrowError()
    })
  })

  describe("compareBase", () => {
    it("should work", () => {
      const subject = new Tag(5, 50, 500)
      const tables: [Order, Tag[]][] = [
        [Order.Less, [new Tag(6, 50, 500), new Tag(5, 51, 500)]],
        [
          Order.Equal,
          [new Tag(5, 50, 499), new Tag(5, 50, 500), new Tag(5, 50, 501)],
        ],
        [Order.Greater, [new Tag(4, 50, 500), new Tag(5, 49, 500)]],
      ]

      tables.forEach(table => {
        table[1].forEach(target => {
          expect(subject.compareBase(target)).toBe(table[0])
        })
      })
    })
  })

  describe("compare", () => {
    it("should work", () => {
      const subject = new Tag(5, 50, 500)
      expect(subject.compare(new Tag(5, 50, 501))).toBe(Order.Less)
      expect(subject.compare(new Tag(5, 50, 500))).toBe(Order.Equal)
      expect(subject.compare(new Tag(5, 50, 499))).toBe(Order.Greater)

      expect(subject.compare(new Tag(5, 51, 500))).toBe(Order.Less)
      expect(subject.compare(new Tag(5, 49, 500))).toBe(Order.Greater)
    })
  })

  describe("encoding", () => {
    it("should work", () => {
      const subject = new Tag(1, 33, 555)
      const serialized = subject.encode()
      const deserialized = Tag.decode(serialized)

      expect(deserialized).toStrictEqual(subject)
    })
  })
})
