import {
  Order,
  INSContent,
  Span,
  TextNode,
  Contributor,
  Block,
  Text,
  pointMIN,
} from "@/domain/entity"
import {cases} from "./test.table"
import {insAt} from "./insAt"

describe("@entity.command.insAt", () => {
  const contributor = new Contributor(8, 0)
  let subject!: TextNode

  beforeEach(() => {
    subject = new TextNode(Span.decodeText(cases[Order.Equal]))
  })

  it("minIndex === currMINIndex", () => {
    insAt(subject, 0, INSContent.from("123"), contributor, newTextBlock())
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("123")
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
  })

  it("minIndex > currMINIndex && minIndex < nextMINIndex", () => {
    insAt(subject, 1, INSContent.from("123"), contributor, newTextBlock())
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("4")
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("123")
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("56")
  })

  it("minIndex > currMINIndex && minIndex === nextMINIndex", () => {
    insAt(subject, 3, INSContent.from("123"), contributor, newTextBlock())
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("123")
  })

  it("minIndex < currMINIndex", () => {
    insAt(subject, -1, INSContent.from("123"), contributor, newTextBlock())
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
    expect(subject.left!.span.content.toTextWithMetaPlaceholder()).toBe("123")
  })

  it("minIndex > nextMINIndex", () => {
    insAt(subject, 4, INSContent.from("123"), contributor, newTextBlock())
    expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("456")
    expect(subject.right!.span.content.toTextWithMetaPlaceholder()).toBe("123")
  })

  it("insAtLeft", () => {
    const left = new TextNode(Span.decodeText(cases[Order.Greater]))
    subject.setLeft(left)

    insAt(subject, 0, INSContent.from("foobar"), contributor, newTextBlock())

    expect(subject.left!.left!.span.content.toTextWithMetaPlaceholder()).toBe(
      "foobar"
    )
  })

  it("insAtRight", () => {
    const right = new TextNode(Span.decodeText(cases[Order.Less]))
    subject.setRight(right)

    insAt(subject, 6, INSContent.from("foobar"), contributor, newTextBlock())

    expect(subject.right!.right!.span.content.toTextWithMetaPlaceholder()).toBe(
      "foobar"
    )
  })
})

const newTextBlock = () => {
  return new Block(
    "block-id",
    {},
    pointMIN.clone(),
    {TYPE: [null, "LINE"]},
    false,
    new Text(undefined)
  )
}
