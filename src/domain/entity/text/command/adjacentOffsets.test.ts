import {Point, INSContent, TextNode} from "@/domain/entity"
import {adjacentOffsets} from "./adjacentOffsets"

describe("@entity.command.adjacentOffsets", () => {
  let subject!: TextNode

  describe("single point", () => {
    describe("single node", () => {
      beforeAll(() => {
        subject = TextNode.decode([
          [[[5, 5, 5]], INSContent.from("foobar").encode()],
        ])!
      })

      it("should work lowerPoint", () => {
        const result = adjacentOffsets(
          subject,
          subject.span.lowerPoint.clone()
        )
        expect(result.lower).toBe(undefined)
        expect(result.upper).toBe(1)
      })

      it("should work upperPoint", () => {
        const result = adjacentOffsets(
          subject,
          subject.span.upperPoint.clone()
        )
        expect(result.lower).toBe(4)
        expect(result.upper).toBe(undefined)
      })

      it("should work with midPoint", () => {
        const result = adjacentOffsets(subject, Point.decode([[5, 5, 7]]))
        expect(result.lower).toBe(1)
        expect(result.upper).toBe(3)
      })
    })

    describe("single tag", () => {
      beforeAll(() => {
        subject = TextNode.decode([
          [[[5, 4, 5]], INSContent.from("a").encode()],
          [[[5, 5, 5]], INSContent.from("foobar").encode()],
          [[[5, 6, 5]], INSContent.from("bc").encode()],
        ])!
      })

      it("should work min", () => {
        const result = adjacentOffsets(subject, Point.decode([[5, 3, 5]]))
        expect(result.lower).toBe(undefined)
        expect(result.upper).toBe(0)
      })

      it("should work max", () => {
        const result = adjacentOffsets(subject, Point.decode([[5, 7, 5]]))
        expect(result.lower).toBe(8)
        expect(result.upper).toBe(undefined)
      })

      it("should work upperPoint of left with single character", () => {
        const result = adjacentOffsets(
          subject,
          subject.left!.span.lowerPoint.clone()
        )
        expect(result.lower).toBe(undefined)
        expect(result.upper).toBe(1)
      })

      it("should work lowerPoint of right", () => {
        const result = adjacentOffsets(
          subject,
          subject.right!.span.lowerPoint.clone()
        )
        expect(result.lower).toBe(6)
        expect(result.upper).toBe(8)
      })

      it("should work lowerPoint", () => {
        const result = adjacentOffsets(
          subject,
          subject.span.lowerPoint.clone()
        )
        expect(result.lower).toBe(0)
        expect(result.upper).toBe(2)
      })

      it("should work upperPoint", () => {
        const result = adjacentOffsets(
          subject,
          subject.span.upperPoint.clone()
        )
        expect(result.lower).toBe(5)
        expect(result.upper).toBe(7)
      })

      it("should work with midPoint", () => {
        const result = adjacentOffsets(subject, Point.decode([[5, 5, 7]]))
        expect(result.lower).toBe(2)
        expect(result.upper).toBe(4)
      })
    })

    describe("multi tags", () => {
      beforeAll(() => {
        subject = TextNode.decode([
          [
            [
              [3, 3, 3],
              [5, 5, 5],
            ],
            INSContent.from("foobar").encode(),
          ],
        ])!
      })

      it("should work with tagged point", () => {
        const result = adjacentOffsets(subject, Point.decode([[3, 3, 3]]))
        expect(result.lower).toBe(undefined)
        expect(result.upper).toBe(0)
      })

      it("should work with tagging point", () => {
        const result = adjacentOffsets(
          subject,
          Point.decode([
            [3, 3, 3],
            [5, 5, 7],
            [7, 7, 7],
          ])
        )
        expect(result.lower).toBe(1)
        expect(result.upper).toBe(3)
      })
    })
  })
})
