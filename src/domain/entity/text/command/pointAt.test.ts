import {Order, Span, TextNode} from "@/domain/entity"
import {pointAt} from "./pointAt"
import {cases} from "./test.table"

describe("@entity.command.pointAt", () => {
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("minIndex === currMINIndex", () => {
    const result = pointAt(subject, 0)
    expect(result).toBe(subject.span.lowerPoint)
  })

  it("minIndex > currMINIndex && minIndex < currMAXIndex", () => {
    const result = pointAt(subject, 1)
    expect(result).toStrictEqual(subject.span.lowerPoint.offset(1))
  })

  it("minIndex > currMINIndex && minIndex === currMAXIndex", () => {
    const result = pointAt(subject, 2)
    expect(result).toStrictEqual(subject.span.upperPoint)
  })

  it("minIndex < currMINIndex", () => {
    const span = Span.decodeText(cases[Order.Greater])
    subject.setLeft(new TextNode(span))
    const result = pointAt(subject, 2)
    expect(result).toStrictEqual(subject.left!.span.upperPoint)
  })

  it("minIndex > currMAXIndex", () => {
    const span = Span.decodeText(cases[Order.Less])
    subject.setRight(new TextNode(span))
    const result = pointAt(subject, 3)
    expect(result).toBe(subject.right!.span.lowerPoint)
  })
})
