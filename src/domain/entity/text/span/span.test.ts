import type {INSContentData} from "@/domain/entity"

import {
  ClosedRange,
  Point,
  pointMID,
  pointMAX,
  INSContent,
  DELContent,
  MODContent,
} from "@/domain/entity"
import {Span} from "./span"
import * as testTable from "./span.test.table"

describe("@entity.span", () => {
  it("should throw with empty-content", () => {
    const emptyContent = new DELContent(0)
    expect(() => new Span<DELContent>(pointMID, emptyContent)).toThrowError()
  })

  describe("getters", () => {
    it("should work", () => {
      const subject = new Span<DELContent>(pointMID, new DELContent(5))
      expect(subject.length).toBe(5)
      expect(subject.replicaID).toBe(0)
      expect(subject.upperPoint).toStrictEqual(pointMID.offset(4))
      expect(subject.nthPoint(1)).toStrictEqual(pointMID.offset(1))
      expect(subject.seqs()).toStrictEqual(
        new ClosedRange(subject.lowerPoint.nonce, subject.length)
      )
    })
  })

  describe("append", () => {
    it("should work", () => {
      const subject = new Span<DELContent>(pointMID, new DELContent(5))
      const target = new Span<DELContent>(pointMAX, new DELContent(9))
      const result = subject.append(target)

      expect(result.lowerPoint).toBe(subject.lowerPoint)
      expect(result.content.length).toBe(14)
    })
  })

  describe("toDELSpan", () => {
    it("should work", () => {
      const subject = new Span<MODContent>(pointMID, new MODContent("foobar"))
      expect(subject.toDELSpan()).toStrictEqual(
        new Span<DELContent>(pointMID, new DELContent(6))
      )
    })
  })

  describe("splitWith", () => {
    it("should work", () => {
      const subject = new Span<DELContent>(
        Point.decode([[5, 5, 5]]),
        new DELContent(5)
      )
      const splitting = new Span<DELContent>(
        Point.decode([
          [5, 5, 7],
          [3, 3, 3],
        ]),
        new DELContent(5)
      )
      expect(subject.splitWith(splitting)).toStrictEqual([
        new Span<DELContent>(Point.decode([[5, 5, 5]]), new DELContent(3)),
        new Span<DELContent>(Point.decode([[5, 5, 8]]), new DELContent(2)),
      ])
    })
  })

  describe("getAppendableSegmentTo", () => {
    it("should work", () => {
      const subject = new Span<DELContent>(
        Point.decode([[5, 5, 5]]),
        new DELContent(5)
      )
      const prependable = new Span<DELContent>(
        Point.decode([[5, 5, 3]]),
        new DELContent(5)
      )
      expect(subject.getAppendableSegmentTo(prependable)).toStrictEqual(
        new Span<DELContent>(Point.decode([[5, 5, 8]]), new DELContent(2))
      )
    })

    it("should work even if including", () => {
      const subject = new Span<DELContent>(
        Point.decode([[5, 5, 5]]),
        new DELContent(5)
      )
      const prependable = new Span<DELContent>(
        Point.decode([[5, 5, 6]]),
        new DELContent(2)
      )
      expect(subject.getAppendableSegmentTo(prependable)).toStrictEqual(
        new Span<DELContent>(Point.decode([[5, 5, 8]]), new DELContent(2))
      )
    })

    it("should throw exception if they are not continuous", () => {
      const subject = new Span<DELContent>(
        Point.decode([[5, 5, 5]]),
        new DELContent(5)
      )
      const prependable = new Span<DELContent>(
        Point.decode([[5, 5, 3]]),
        new DELContent(1)
      )
      expect(() => subject.getAppendableSegmentTo(prependable)).toThrowError()
    })
  })

  describe("getPrependableSegmentTo", () => {
    it("should work", () => {
      const subject = new Span<DELContent>(
        Point.decode([[5, 5, 5]]),
        new DELContent(5)
      )
      const appendable = new Span<DELContent>(
        Point.decode([[5, 5, 8]]),
        new DELContent(5)
      )
      expect(subject.getPrependableSegmentTo(appendable)).toStrictEqual(
        new Span<DELContent>(Point.decode([[5, 5, 5]]), new DELContent(3))
      )
    })

    it("should throw exception if they are not continuous", () => {
      const subject = new Span<DELContent>(
        Point.decode([[5, 5, 5]]),
        new DELContent(5)
      )
      const appendable = new Span<DELContent>(
        Point.decode([[5, 5, 11]]),
        new DELContent(1)
      )
      expect(() => subject.getPrependableSegmentTo(appendable)).toThrowError()
    })
  })

  describe("compare", () => {
    it("should work", () => {
      const subject = testTable.spanFrom(testTable.subject)

      testTable.cases.forEach(([order, otherRaw]) => {
        expect(subject.compare(testTable.spanFrom(otherRaw))).toBe(order)
      })
    })
  })

  describe("intersection", () => {
    it("should work", () => {
      const subject = testTable.spanFrom(testTable.subject)

      testTable.cases.forEach(([, otherRaw, intersectionRaw]) => {
        if (intersectionRaw) {
          expect(
            subject.intersection(testTable.spanFrom(otherRaw))
          ).toStrictEqual(testTable.spanFrom(intersectionRaw!))
        } else {
          expect(() =>
            subject.intersection(testTable.spanFrom(otherRaw))
          ).toThrowError()
        }
      })
    })
  })

  describe("encoding", () => {
    it("should work", () => {
      const lowerPoint = Point.decode([[1, 3, 5]])
      const delContent = new DELContent(7)
      const subject = new Span(lowerPoint, delContent)
      const serialized = subject.encode()

      expect(serialized.length).toBe(2)
      expect(serialized[0]).toStrictEqual(lowerPoint.encode())
      expect(serialized[1]).toStrictEqual(delContent.encode())
    })

    it("should work", () => {
      const lowerPoint = Point.decode([[1, 3, 5]])
      const insContent = INSContent.from("foobar")
      const subject = new Span(lowerPoint, insContent)
      const serialized = subject.encode()
      const deserialized = Span.decodeText([
        serialized[0],
        (serialized[1] as INSContentData)[1] as string,
      ])

      expect(deserialized.lowerPoint).toStrictEqual(lowerPoint)
      expect(deserialized.content).toStrictEqual(insContent)
    })
  })

  describe("clone", () => {
    let subject!: Span<INSContent>
    let cloned!: Span<INSContent>

    beforeEach(() => {
      subject = new Span<INSContent>(
        Point.decode([[1, 3, 5]]),
        INSContent.from("foobar")
      )
      cloned = subject.clone()
    })

    it("should be equal", () => {
      expect(cloned).toStrictEqual(subject)
    })

    it("should be reference", () => {
      expect(cloned).not.toBe(subject)
    })
  })
})
