import {Order, ClosedRange, Span, TextNode} from "@/domain/entity"
import {cases, props, stamp, makeAttributes, makeFMTSpan} from "./test.table"
import {fmtAt} from "./fmtAt"

describe("@entity.command.fmtAt", () => {
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("Less", () => {
    const data = cases[Order.Less]
    const span = Span.decodeText(cases[Order.Prependable])
    const expected = [makeFMTSpan(data[0], 1)]
    subject.setRight(new TextNode(span))
    const result = fmtAt(subject, new ClosedRange(4, 1), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.attributes.leaves[1]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("Prependable", () => {
    const data = cases[Order.Prependable]
    const span = Span.decodeText(data)
    const expected = [makeFMTSpan(data[0], 3)]
    subject.setRight(new TextNode(span))
    const result = fmtAt(subject, new ClosedRange(3, 3), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.right!.span.content.attributes).toStrictEqual(
      makeAttributes(3)
    )
  })

  it("Greater", () => {
    const data = cases[Order.Greater]
    const span = Span.decodeText(data)
    const expected = [makeFMTSpan(data[0], 1)]
    subject.setLeft(new TextNode(span))
    const result = fmtAt(subject, new ClosedRange(0, 1), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.attributes.leaves[0]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("Appendable", () => {
    const data = cases[Order.Appendable]
    const span = Span.decodeText(data)
    const expected = [makeFMTSpan(data[0], 3)]
    subject.setLeft(new TextNode(span))
    const result = fmtAt(subject, new ClosedRange(0, 3), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.attributes).toStrictEqual(
      makeAttributes(3)
    )
  })

  it("IncludingLeft", () => {
    const data = cases[Order.IncludingLeft]
    const expected = [makeFMTSpan(data[0], 1)]
    const result = fmtAt(subject, new ClosedRange(0, 1), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[0]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("IncludingRight", () => {
    const data = cases[Order.IncludingRight]
    const expected = [makeFMTSpan(data[0], 1)]
    const result = fmtAt(subject, new ClosedRange(2, 1), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[1]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("IncludingMiddle", () => {
    const data = cases[Order.IncludingMiddle]
    const expected = [makeFMTSpan(data[0], 1)]
    const result = fmtAt(subject, new ClosedRange(1, 1), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[1]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("RightOverlap", () => {
    const data = cases[Order.RightOverlap]
    const expected = [makeFMTSpan(data[0], 1)]
    const result = fmtAt(subject, new ClosedRange(2, 3), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes.leaves[1]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("LeftOverlap", () => {
    const data = cases[Order.LeftOverlap]
    const expected = [
      makeFMTSpan(data[0], 1),
      makeFMTSpan(cases[Order.Equal][0], 1),
    ]
    subject.setLeft(new TextNode(Span.decodeText(cases[Order.Greater])))
    const result = fmtAt(subject, new ClosedRange(2, 2), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.left!.span.content.attributes.leaves[1]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
    expect(subject.span.content.attributes.leaves[0]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("Equal", () => {
    const data = cases[Order.Equal]
    const expected = [makeFMTSpan(data[0], 3)]
    const result = fmtAt(subject, new ClosedRange(0, 3), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(makeAttributes(3))
  })

  it("IncludedLeft", () => {
    const data = cases[Order.IncludedLeft]
    const expected = [
      makeFMTSpan(cases[Order.Equal][0], 3),
      makeFMTSpan(data[0], 1),
    ]
    subject.setRight(new TextNode(Span.decodeText([data[0], "7"])))
    const result = fmtAt(subject, new ClosedRange(0, 4), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(makeAttributes(3))
    expect(subject.right!.span.content.attributes.leaves[0]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })

  it("IncludedMiddle", () => {
    const data = cases[Order.IncludedMiddle]
    const expected = [
      makeFMTSpan(data[0], 1),
      makeFMTSpan(cases[Order.Equal][0], 3),
      makeFMTSpan(
        [
          [1, 1, 1],
          [5, 5, 8],
        ],
        1
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
    const result = fmtAt(subject, new ClosedRange(0, 5), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(makeAttributes(3))
    expect(subject.left!.span.content.attributes).toStrictEqual(
      makeAttributes(1)
    )
    expect(subject.right!.span.content.attributes).toStrictEqual(
      makeAttributes(1)
    )
  })

  it("IncludedRight", () => {
    const data = cases[Order.IncludedRight]
    const expected = [
      makeFMTSpan(data[0], 1),
      makeFMTSpan(cases[Order.Equal][0], 3),
    ]
    subject.setLeft(new TextNode(Span.decodeText([data[0], "3"])))
    const result = fmtAt(subject, new ClosedRange(0, 4), props, stamp, 0)

    expect(result).toStrictEqual(expected)
    expect(subject.span.content.attributes).toStrictEqual(makeAttributes(3))
    expect(subject.left!.span.content.attributes.leaves[0]).toStrictEqual(
      makeAttributes(1).leaves[0]
    )
  })
})
