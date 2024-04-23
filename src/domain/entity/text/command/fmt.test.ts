import {Order, Span, TextNode, NewFMTDelta} from "@/domain/entity"
import {cases, makeAttributes, makeFMTSpan} from "./test.table"
import {fmt} from "./fmt"

describe("@entity.command.fmt", () => {
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("Less", () => {
    const data = cases[Order.Less]
    const span = Span.decodeText(data)
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(3, attrs)]
    subject.setRight(new TextNode(span))
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.attributes).toStrictEqual(attrs)
  })

  it("Prependable", () => {
    const data = cases[Order.Prependable]
    const span = Span.decodeText(data)
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(3, attrs)]
    subject.setRight(new TextNode(span))
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.attributes).toStrictEqual(attrs)
  })

  it("Greater", () => {
    const data = cases[Order.Greater]
    const span = Span.decodeText(data)
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(0, attrs)]
    subject.setLeft(new TextNode(span))
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.attributes).toStrictEqual(attrs)
  })

  it("Appendable", () => {
    const data = cases[Order.Appendable]
    const span = Span.decodeText(data)
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(0, attrs)]
    subject.setLeft(new TextNode(span))
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.attributes).toStrictEqual(attrs)
  })

  it("IncludingLeft", () => {
    const data = cases[Order.IncludingLeft]
    const attrs = makeAttributes(1)
    const expected = [NewFMTDelta(0, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 1), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[0]).toStrictEqual(
      attrs.leaves[0]
    )
  })

  it("IncludingRight", () => {
    const data = cases[Order.IncludingRight]
    const attrs = makeAttributes(1)
    const expected = [NewFMTDelta(2, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 1), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[1]).toStrictEqual(
      attrs.leaves[0]
    )
  })

  it("IncludingMiddle", () => {
    const data = cases[Order.IncludingMiddle]
    const attrs = makeAttributes(1)
    const expected = [NewFMTDelta(1, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 1), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[1]).toStrictEqual(
      attrs.leaves[0]
    )
  })

  it("RightOverlap", () => {
    const data = cases[Order.RightOverlap]
    const attrs = makeAttributes(1)
    const expected = [NewFMTDelta(2, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[1]).toStrictEqual(
      attrs.leaves[0]
    )
  })

  it("LeftOverlap", () => {
    const data = cases[Order.LeftOverlap]
    const expected = [
      NewFMTDelta(2, makeAttributes(1)),
      NewFMTDelta(3, makeAttributes(1)),
    ]
    subject.setLeft(new TextNode(Span.decodeText(cases[Order.Greater])))
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[0]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("Splitted", () => {
    const data = cases[Order.Splitted]
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual([])
    expect(subject.span.content.attributes.leaves[0].props).toBe(undefined)
  })

  it("Splitting", () => {
    const data = cases[Order.Splitting]
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual([])
    expect(subject.span.content.attributes.leaves[0].props).toBe(undefined)
  })

  it("Equal", () => {
    const data = cases[Order.Equal]
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(0, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 3), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(attrs)
  })

  it("IncludedLeft", () => {
    const data = cases[Order.IncludedLeft]
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(0, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 4), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(attrs)
  })

  it("IncludedRight", () => {
    const data = cases[Order.IncludedRight]
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(0, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 4), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(attrs)
  })

  it("IncludedMiddle", () => {
    const data = cases[Order.IncludedMiddle]
    const attrs = makeAttributes(3)
    const expected = [NewFMTDelta(0, attrs)]
    const result = fmt(subject, makeFMTSpan(data[0], 5), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(attrs)
  })
})
