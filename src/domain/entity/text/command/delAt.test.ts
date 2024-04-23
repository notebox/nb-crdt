import {Order, ClosedRange, DELContent, Span, TextNode} from "@/domain/entity"
import {cases} from "./test.table"
import {delAt} from "./delAt"

describe("@entity.command.delAt", () => {
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("Less", () => {
    const result = delAt(subject, new ClosedRange(4, 3), 0)
    expect([...result.toDELSpans()]).toStrictEqual([])
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
  })

  it("Greater", () => {
    const span = Span.decodeText(cases[Order.Greater])
    subject.setLeft(new TextNode(span))
    const result = delAt(subject, new ClosedRange(0, 2), 0)
    expect([...result.toDELSpans()]).toStrictEqual([
      new Span(span.lowerPoint, new DELContent(2)),
    ])
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("2")
  })

  it("Prependable", () => {
    const span = Span.decodeText(cases[Order.Less])
    const expected = [new Span(span.lowerPoint, new DELContent(1))]
    subject.setRight(new TextNode(span))
    const result = delAt(subject, new ClosedRange(3, 1), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
    expect(subject.left).toBeUndefined()
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("9a")
  })

  it("Appendable", () => {
    const span = Span.decodeText(cases[Order.Greater])
    const expected = [new Span(span.lowerPoint.offset(2), new DELContent(1))]
    subject.setLeft(new TextNode(span))
    const result = delAt(subject, new ClosedRange(2, 1), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("01")
    expect(subject.right).toBeUndefined()
  })

  it("RightOverlap", () => {
    const expected = [
      new Span(subject.span.lowerPoint.offset(2), new DELContent(1)),
    ]
    const result = delAt(subject, new ClosedRange(2, 3), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("45")
  })

  it("LeftOverlap", () => {
    const span = Span.decodeText(cases[Order.Greater])
    const expected = [
      new Span(span.lowerPoint.offset(2), new DELContent(1)),
      new Span(subject.span.lowerPoint.clone(), new DELContent(1)),
    ]
    subject.setLeft(new TextNode(span))
    const result = delAt(subject, new ClosedRange(2, 2), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("56")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("01")
  })

  it("Equal", () => {
    const expected = [
      new Span(subject.span.lowerPoint.clone(), new DELContent(3)),
    ]
    const result = delAt(subject, new ClosedRange(0, 3), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.shouldBeDeleted).toBeTruthy()
  })

  it("IncludingLeft", () => {
    const expected = [
      new Span(subject.span.lowerPoint.clone(), new DELContent(1)),
    ]
    const result = delAt(subject, new ClosedRange(0, 1), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("56")
  })

  it("IncludingRight", () => {
    const expected = [
      new Span(subject.span.lowerPoint.offset(2), new DELContent(1)),
    ]
    const result = delAt(subject, new ClosedRange(2, 1), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("45")
  })

  it("IncludingMiddle", () => {
    const expected = [
      new Span(subject.span.lowerPoint.offset(1), new DELContent(1)),
    ]
    const result = delAt(subject, new ClosedRange(1, 1), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("4")
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("6")
  })

  it("IncludedLeft", () => {
    const span = Span.decodeText(cases[Order.Less])
    const expected = [
      new Span(subject.span.lowerPoint.clone(), new DELContent(3)),
      new Span(span.lowerPoint.clone(), new DELContent(1)),
    ]
    subject.setRight(new TextNode(span))
    const result = delAt(subject, new ClosedRange(0, 4), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
  })

  it("IncludedRight", () => {
    const span = Span.decodeText(cases[Order.Greater])
    const expected = [
      new Span(span.lowerPoint.offset(2), new DELContent(1)),
      new Span(subject.span.lowerPoint.clone(), new DELContent(3)),
    ]
    subject.setLeft(new TextNode(span))
    const result = delAt(subject, new ClosedRange(2, 4), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("01")
    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
  })

  it("IncludedMiddle", () => {
    const greater = Span.decodeText(cases[Order.Greater])
    const less = Span.decodeText(cases[Order.Less])
    const expected = [
      new Span(greater.lowerPoint.offset(2), new DELContent(1)),
      new Span(subject.span.lowerPoint.clone(), new DELContent(3)),
      new Span(less.lowerPoint.clone(), new DELContent(1)),
    ]
    subject.setLeft(new TextNode(greater))
    subject.setRight(new TextNode(less))
    const result = delAt(subject, new ClosedRange(2, 5), 0)
    expect([...result.toDELSpans()]).toStrictEqual(expected)
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("9a")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("01")
    expect(subject.right).toBeUndefined()
  })
})
