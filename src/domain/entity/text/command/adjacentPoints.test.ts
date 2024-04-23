import {Point, INSContent, TextNode} from "@/domain/entity"
import {adjacentPoints} from "./adjacentPoints"

describe("@entity.command.adjacentPoints", () => {
  let subject!: TextNode

  describe("single point", () => {
    describe("single tag", () => {
      beforeAll(() => {
        subject = TextNode.decode([
          [[[5, 4, 5]], INSContent.from("a").encode()],
          [[[5, 5, 5]], INSContent.from("foobar").encode()],
          [[[5, 6, 5]], INSContent.from("b").encode()],
        ])!
      })

      it("should work min", () => {
        const result = adjacentPoints(subject, Point.decode([[5, 3, 5]]))
        expect(result.lower).toBe(undefined)
        expect(result.upper).toStrictEqual(subject.left!.span.lowerPoint)
      })

      it("should work max", () => {
        const result = adjacentPoints(subject, Point.decode([[5, 7, 5]]))
        expect(result.lower).toStrictEqual(subject.right!.span.upperPoint)
        expect(result.upper).toBe(undefined)
      })

      it("should work upperPoint of left with single character", () => {
        const result = adjacentPoints(
          subject,
          subject.left!.span.lowerPoint.clone()
        )
        expect(result.lower).toBe(undefined)
        expect(result.upper).toStrictEqual(subject.span.lowerPoint)
      })

      it("should work lowerPoint of right with single character", () => {
        const result = adjacentPoints(
          subject,
          subject.right!.span.lowerPoint.clone()
        )
        expect(result.lower).toStrictEqual(subject.span.upperPoint)
        expect(result.upper).toBe(undefined)
      })

      it("should work lowerPoint", () => {
        const result = adjacentPoints(subject, subject.span.lowerPoint.clone())
        expect(result.lower).toStrictEqual(subject.left!.span.upperPoint)
        expect(result.upper).toStrictEqual(subject.span.lowerPoint.offset(1))
      })

      it("should work upperPoint", () => {
        const result = adjacentPoints(subject, subject.span.upperPoint.clone())
        expect(result.lower).toStrictEqual(subject.span.upperPoint.offset(-1))
        expect(result.upper).toStrictEqual(subject.right!.span.lowerPoint)
      })

      it("should work with midPoint", () => {
        const result = adjacentPoints(subject, Point.decode([[5, 5, 7]]))
        expect(result.lower).toStrictEqual(Point.decode([[5, 5, 6]]))
        expect(result.upper).toStrictEqual(Point.decode([[5, 5, 8]]))
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
        const result = adjacentPoints(subject, Point.decode([[3, 3, 3]]))
        expect(result.lower).toBe(undefined)
        expect(result.upper).toStrictEqual(subject.span.lowerPoint)
      })

      it("should work with tagging point", () => {
        const result = adjacentPoints(
          subject,
          Point.decode([
            [3, 3, 3],
            [5, 5, 7],
            [7, 7, 7],
          ])
        )
        expect(result.lower).toStrictEqual(
          Point.decode([
            [3, 3, 3],
            [5, 5, 7],
          ])
        )
        expect(result.upper).toStrictEqual(
          Point.decode([
            [3, 3, 3],
            [5, 5, 8],
          ])
        )
      })
    })
  })
})
