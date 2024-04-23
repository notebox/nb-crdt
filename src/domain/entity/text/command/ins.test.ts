import {Order, Span, TextNode} from "@/domain/entity"
import {cases} from "./test.table"
import {ins} from "./ins"

describe("@entity.command.ins", () => {
  let subject: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("should throw if there is intersection", () => {
    const intersection = [
      cases[Order.RightOverlap],
      cases[Order.LeftOverlap],
      cases[Order.IncludingLeft],
      cases[Order.IncludingMiddle],
      cases[Order.IncludingRight],
      cases[Order.IncludedLeft],
      cases[Order.IncludedMiddle],
      cases[Order.IncludedRight],
      cases[Order.Equal],
    ]

    intersection.forEach(span => {
      expect(() => ins(subject, Span.decodeText(span), 0)).toThrowError()
    })
  })

  it("Less", () => {
    const span = Span.decodeText(cases[Order.Less])

    ins(subject, span, 0)

    expect(subject.left).toBeUndefined()
    expect(subject.right!.span).toBe(span)
  })

  it("Greater", () => {
    const span = Span.decodeText(cases[Order.Greater])

    ins(subject, span, 0)

    expect(subject.right).toBeUndefined()
    expect(subject.left!.span).toBe(span)
  })

  it("Prependable", () => {
    const span = Span.decodeText(cases[Order.Prependable])

    ins(subject, span, 0)

    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456789")
  })

  it("Appendable", () => {
    const span = Span.decodeText(cases[Order.Appendable])

    ins(subject, span, 0)

    expect(subject.left).toBeUndefined()
    expect(subject.right).toBeUndefined()
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("123456")
  })

  it("Splitted", () => {
    const span = Span.decodeText(cases[Order.Splitted])
    const [left, right] = subject.span.splitWith(span)

    ins(subject, span, 0)

    expect(subject.left!.span).toStrictEqual(left)
    expect(subject.right!.span).toStrictEqual(right)
  })

  it("Splitting", () => {
    const span = Span.decodeText(cases[Order.Splitting])
    const [left, right] = span.splitWith(subject.span)

    ins(subject, span, 0)

    expect(subject.left!.span).toStrictEqual(left)
    expect(subject.right!.span).toStrictEqual(right)
  })

  it("insLeft", () => {
    const left = new TextNode(Span.decodeText(cases[Order.Greater]))
    const min = Span.decodeText([[[0, 0, 0]], "foobar"])
    subject.setLeft(left)

    ins(subject, min, 0)

    expect(subject.left!.left!.span).toBe(min)
  })

  it("insRight", () => {
    const right = new TextNode(Span.decodeText(cases[Order.Less]))
    const big = Span.decodeText([[[999999, 999999, 999999]], "foobar"])
    subject.setRight(right)

    ins(subject, big, 0)

    expect(subject.right!.right!.span).toBe(big)
  })
})
