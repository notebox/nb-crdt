import {Order, Span, TextNode, NewDELDelta} from "@/domain/entity"
import {cases} from "./test.table"
import {del} from "./del"

describe("@entity.command.del", () => {
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("Less/Prependable", () => {
    let span = Span.decodeText(cases[Order.Less])
    let result
    subject.setRight(new TextNode(span))
    result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(subject.length, span.length)])
    expect(subject.right).toBeUndefined()

    span = Span.decodeText(cases[Order.Prependable])
    subject.setRight(new TextNode(span))
    result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(subject.length, span.length)])
    expect(subject.right).toBeUndefined()
  })

  it("Greater/Appendable", () => {
    let span = Span.decodeText(cases[Order.Greater])
    let result
    subject.setLeft(new TextNode(span))
    result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(0, span.length)])
    expect(subject.left).toBeUndefined()

    span = Span.decodeText(cases[Order.Appendable])
    subject.setLeft(new TextNode(span))
    result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(0, span.length)])
    expect(subject.left).toBeUndefined()
  })

  it("IncludingLeft", () => {
    const span = Span.decodeText(cases[Order.IncludingLeft])
    const expected = subject.span.getAppendableSegmentTo(span)
    const result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(0, 1)])
    expect(subject.span).toStrictEqual(expected)
  })

  it("IncludingRight", () => {
    const span = Span.decodeText(cases[Order.IncludingRight])
    const expected = subject.span.getPrependableSegmentTo(span)
    const result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(2, 1)])
    expect(subject.span).toStrictEqual(expected)
  })

  it("IncludingMiddle", () => {
    const span = Span.decodeText(cases[Order.IncludingMiddle])
    const left = subject.span.getPrependableSegmentTo(span)
    const right = subject.span.getAppendableSegmentTo(span)
    const result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(1, 1)])
    expect(subject.span).toStrictEqual(left)
    expect(subject.right!.span).toStrictEqual(right)
  })

  it("RightOverlap", () => {
    const span = Span.decodeText(cases[Order.RightOverlap])
    const expected = subject.span.getPrependableSegmentTo(span)
    const result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(2, 1)])
    expect(subject.span).toStrictEqual(expected)
    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
  })

  it("LeftOverlap", () => {
    const span = Span.decodeText(cases[Order.LeftOverlap])
    const expected = subject.span.getAppendableSegmentTo(span)
    const result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([NewDELDelta(0, 1)])
    expect(subject.span).toStrictEqual(expected)
    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
  })

  it("Splitted", () => {
    const content = subject.span.content
    const span = Span.decodeText(cases[Order.Splitted])
    const result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([])
    expect(subject.span.content).toBe(content)
    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
  })

  it("Splitting", () => {
    const span = Span.decodeText(cases[Order.Splitting])
    const result = del(subject, span.toDELSpan(), 0)
    expect(result).toStrictEqual([])
    expect(subject.shouldBeDeleted).toBeFalsy()
    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
  })

  it("Equal/IncludedLeft/IncludedRight/IncludedMiddle", () => {
    [
      Span.decodeText(cases[Order.Equal]),
      Span.decodeText(cases[Order.IncludedLeft]),
      Span.decodeText(cases[Order.IncludedMiddle]),
      Span.decodeText(cases[Order.IncludedRight]),
    ].forEach(span => {
      subject = new TextNode(Span.decodeText(cases[Order.Equal]))
      const result = del(subject, span.toDELSpan(), 0)
      expect(result).toStrictEqual([NewDELDelta(0, 3)])
      expect(subject.shouldBeDeleted).toBeTruthy()
      expect(subject.left).toBeUndefined()
      expect(subject.right).toBeUndefined()
    })
  })
})
