import {Order, Span, TextNode, NewMODDelta} from "@/domain/entity"
import {cases, makeMODSpan} from "./test.table"
import {mod} from "./mod"

describe("@entity.command.mod", () => {
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("Less", () => {
    const data = cases[Order.Less]
    const span = Span.decodeText(data)
    const expected = [NewMODDelta(3, "xyz")]
    subject.setRight(new TextNode(span))
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("Prependable", () => {
    const data = cases[Order.Prependable]
    const span = Span.decodeText(data)
    const expected = [NewMODDelta(3, "xyz")]
    subject.setRight(new TextNode(span))
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("Greater", () => {
    const data = cases[Order.Greater]
    const span = Span.decodeText(data)
    const expected = [NewMODDelta(0, "xyz")]
    subject.setLeft(new TextNode(span))
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("Appendable", () => {
    const data = cases[Order.Appendable]
    const span = Span.decodeText(data)
    const expected = [NewMODDelta(0, "xyz")]
    subject.setLeft(new TextNode(span))
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("IncludingLeft", () => {
    const data = cases[Order.IncludingLeft]
    const expected = [NewMODDelta(0, "x")]
    const result = mod(subject, makeMODSpan(data[0], "x"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("x56")
  })

  it("IncludingRight", () => {
    const data = cases[Order.IncludingRight]
    const expected = [NewMODDelta(2, "x")]
    const result = mod(subject, makeMODSpan(data[0], "x"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("45x")
  })

  it("IncludingMiddle", () => {
    const data = cases[Order.IncludingMiddle]
    const expected = [NewMODDelta(1, "x")]
    const result = mod(subject, makeMODSpan(data[0], "x"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("4x6")
  })

  it("RightOverlap", () => {
    const data = cases[Order.RightOverlap]
    const expected = [NewMODDelta(2, "x")]
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("45x")
  })

  it("LeftOverlap", () => {
    const data = cases[Order.LeftOverlap]
    const expected = [NewMODDelta(0, "z")]
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("z56")
  })

  it("Splitted", () => {
    const data = cases[Order.Splitted]
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual([])
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
  })

  it("Splitting", () => {
    const data = cases[Order.Splitting]
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual([])
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
  })

  it("Equal", () => {
    const data = cases[Order.Equal]
    const expected = [NewMODDelta(0, "xyz")]
    const result = mod(subject, makeMODSpan(data[0], "xyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("IncludedLeft", () => {
    const data = cases[Order.IncludedLeft]
    const expected = [NewMODDelta(0, "wxy")]
    const result = mod(subject, makeMODSpan(data[0], "wxyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("wxy")
  })

  it("IncludedRight", () => {
    const data = cases[Order.IncludedRight]
    const expected = [NewMODDelta(0, "xyz")]
    const result = mod(subject, makeMODSpan(data[0], "wxyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("xyz")
  })

  it("IncludedMiddle", () => {
    const data = cases[Order.IncludedMiddle]
    const expected = [NewMODDelta(0, "wxy")]
    const result = mod(subject, makeMODSpan(data[0], "vwxyz"), 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("wxy")
  })
})
