import {Order, ClosedRange, MODContent, Span, TextNode} from "@/domain/entity"
import {cases, makeMODSpan} from "./test.table"
import {modAt} from "./modAt"

describe("@entity.command.modAt", () => {
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("Less", () => {
    const data = cases[Order.Less]
    const span = Span.decodeText(cases[Order.Prependable])
    const expected = [makeMODSpan(data[0], "x")]
    subject.setRight(new TextNode(span))
    const result = modAt(
      subject,
      new ClosedRange(4, 1),
      new MODContent("x"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("7x9")
  })

  it("Prependable", () => {
    const data = cases[Order.Prependable]
    const span = Span.decodeText(data)
    const expected = [makeMODSpan(data[0], "xyz")]
    subject.setRight(new TextNode(span))
    const result = modAt(
      subject,
      new ClosedRange(3, 3),
      new MODContent("xyz"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("Greater", () => {
    const data = cases[Order.Greater]
    const span = Span.decodeText(data)
    const expected = [makeMODSpan(data[0], "x")]
    subject.setLeft(new TextNode(span))
    const result = modAt(
      subject,
      new ClosedRange(0, 1),
      new MODContent("x"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("x12")
  })

  it("Appendable", () => {
    const data = cases[Order.Appendable]
    const span = Span.decodeText(data)
    const expected = [makeMODSpan(data[0], "xyz")]
    subject.setLeft(new TextNode(span))
    const result = modAt(
      subject,
      new ClosedRange(0, 3),
      new MODContent("xyz"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("IncludingLeft", () => {
    const data = cases[Order.IncludingLeft]
    const expected = [makeMODSpan(data[0], "x")]
    const result = modAt(
      subject,
      new ClosedRange(0, 1),
      new MODContent("x"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("x56")
  })

  it("IncludingRight", () => {
    const data = cases[Order.IncludingRight]
    const expected = [makeMODSpan(data[0], "x")]
    const result = modAt(
      subject,
      new ClosedRange(2, 1),
      new MODContent("x"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("45x")
  })

  it("IncludingMiddle", () => {
    const data = cases[Order.IncludingMiddle]
    const expected = [makeMODSpan(data[0], "x")]
    const result = modAt(
      subject,
      new ClosedRange(1, 1),
      new MODContent("x"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("4x6")
  })

  it("RightOverlap", () => {
    const data = cases[Order.RightOverlap]
    const expected = [makeMODSpan(data[0], "x")]
    const result = modAt(
      subject,
      new ClosedRange(2, 3),
      new MODContent("xyz"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("45x")
  })

  it("LeftOverlap", () => {
    const data = cases[Order.LeftOverlap]
    const expected = [
      makeMODSpan(data[0], "x"),
      makeMODSpan(cases[Order.Equal][0], "y"),
    ]
    subject.setLeft(new TextNode(Span.decodeText(cases[Order.Greater])))
    const result = modAt(
      subject,
      new ClosedRange(2, 2),
      new MODContent("xy"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("y56")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("01x")
  })

  it("Equal", () => {
    const data = cases[Order.Equal]
    const expected = [makeMODSpan(data[0], "xyz")]
    const result = modAt(
      subject,
      new ClosedRange(0, 3),
      new MODContent("xyz"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("IncludedLeft", () => {
    const data = cases[Order.IncludedLeft]
    const expected = [
      makeMODSpan(cases[Order.Equal][0], "wxy"),
      makeMODSpan(data[0], "z"),
    ]
    subject.setRight(new TextNode(Span.decodeText([data[0], "7"])))
    const result = modAt(
      subject,
      new ClosedRange(0, 4),
      new MODContent("wxyz"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("wxy")
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("z")
  })

  it("IncludedMiddle", () => {
    const data = cases[Order.IncludedMiddle]
    const expected = [
      makeMODSpan(data[0], "v"),
      makeMODSpan(cases[Order.Equal][0], "wxy"),
      makeMODSpan(
        [
          [1, 1, 1],
          [5, 5, 8],
        ],
        "z"
      ),
    ]
    subject.setLeft(new TextNode(Span.decodeText([data[0], "3"])))
    subject.setRight(
      new TextNode(
        Span.decodeText([
          [
            [1, 1, 1],
            [5, 5, 8],
          ],
          "7",
        ])
      )
    )
    const result = modAt(
      subject,
      new ClosedRange(0, 5),
      new MODContent("vwxyz"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("wxy")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("v")
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("z")
  })

  it("IncludedRight", () => {
    const data = cases[Order.IncludedRight]
    const expected = [
      makeMODSpan(data[0], "w"),
      makeMODSpan(cases[Order.Equal][0], "xyz"),
    ]
    subject.setLeft(new TextNode(Span.decodeText([data[0], "3"])))
    const result = modAt(
      subject,
      new ClosedRange(0, 4),
      new MODContent("wxyz"),
      0
    )

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("w")
  })
})
