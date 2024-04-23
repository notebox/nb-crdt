import {Point, TextNode, INSContent, TextProps} from "@/domain/entity"
import {Span, Spans} from "./"

describe("@entity.spans", () => {
  describe("constructor", () => {
    it("should work for array", () => {
      const span = new Span(
        Point.decode([[999, 4, 2]]),
        INSContent.from("foobar")
      )

      const spans = new Spans(span)
      expect(spans[0]).toBe(span)
    })
  })

  describe("splitAt", () => {
    const text = TextNode.decode([
      [
        [[999, 4, 2]],
        [[[6], [5, {CODE: true} as TextProps], [1]], "hello world!"],
      ],
    ])!
    text.setRight(TextNode.decode([[[[9999, 44, 1]], [[[2]], ":)"]]]))
    const spans = text.spans()

    it("should work", () => {
      const [lSpans, rSpans] = spans.splitAt(8)
      expect(lSpans.toINSContent()!.toTextWithMetaPlaceholder()).toBe(
        "hello wo"
      )
      expect(rSpans.toINSContent()!.toTextWithMetaPlaceholder()).toBe("rld!:)")
    })

    it("should work with zero offset", () => {
      const [lSpans, rSpans] = spans.splitAt(0)
      expect(lSpans.length).toStrictEqual(0)
      expect(rSpans.toINSContent()!.toTextWithMetaPlaceholder()).toBe(
        "hello world!:)"
      )
    })

    it("should work with max offset", () => {
      const [lSpans, rSpans] = spans.splitAt(14)
      expect(lSpans.toINSContent()!.toTextWithMetaPlaceholder()).toBe(
        "hello world!:)"
      )
      expect(rSpans.length).toStrictEqual(0)
    })
  })

  describe("toINSContent", () => {
    it("should return undefined with empty spans", () => {
      expect(new Spans().toINSContent()).toBe(undefined)
    })
  })

  describe("textLength", () => {
    it("should work", () => {
      const spans = new Spans(
        new Span(Point.decode([[999, 4, 1]]), INSContent.from("a")),
        new Span(Point.decode([[999, 4, 2]]), INSContent.from("bcd")),
        new Span(Point.decode([[999, 4, 5]]), INSContent.from("efghi"))
      )
      expect(spans.textLength()).toBe(9)
    })
  })
})
