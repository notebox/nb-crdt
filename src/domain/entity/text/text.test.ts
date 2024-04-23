import type {TextNodeData} from "@/domain/entity"

import {
  Point,
  Text,
  Span,
  Spans,
  INSContent,
  DELContent,
  MODContent,
  FMTContent,
  Block,
  pointMIN,
  Contributor,
} from "@/domain/entity"

describe("@entity.text", () => {
  let subject!: Text
  const data: TextNodeData = [
    [[[999, 4, 1]], [[[1]], "a"]],
    [[[999, 4, 2]], [[[3]], "bcd"]],
    [[[999, 4, 5]], [[[5]], "efghi"]],
  ]

  beforeEach(() => {
    subject = Text.decode(data)
  })

  it("length", () => {
    expect(subject.length()).toBe(9)
  })

  it("toString", () => {
    expect(subject.toString()).toStrictEqual("abcdefghi")
  })

  it("spans", () => {
    expect(new Text(undefined).spans()).toStrictEqual(new Spans())
  })

  it("subSpans", () => {
    expect(subject.subSpans(2, 8)).toStrictEqual(
      new Spans(
        new Span(Point.decode([[999, 4, 3]]), INSContent.from("cd")),
        new Span(Point.decode([[999, 4, 5]]), INSContent.from("efgh"))
      )
    )
  })

  it("pointAt", () => {
    expect(subject.pointAt(2)?.encode()).toStrictEqual([[999, 4, 3]])
    expect(new Text(undefined).pointAt(2)).toBeUndefined()
  })

  describe("contribution", () => {
    it("ins", () => {
      const span = new Span(Point.decode([[999, 9, 9]]), INSContent.from("ij"))
      expect(subject.ins(span)).toStrictEqual([
        {index: 9, content: span.content},
      ])
      expect(new Text(undefined).ins(span)).toStrictEqual([
        {
          index: 0,
          content: span.content,
        },
      ])
    })

    it("del", () => {
      const span = new Span(Point.decode([[999, 4, 3]]), new DELContent(2))
      expect(subject.del(span)).toStrictEqual([{index: 2, length: 2}])
      expect(new Text(undefined).del(span)).toStrictEqual([])
    })

    it("mod", () => {
      const span = new Span(Point.decode([[999, 4, 3]]), new MODContent("xy"))
      expect(subject.mod(span)).toStrictEqual([{index: 2, text: "xy"}])
      expect(new Text(undefined).mod(span)).toStrictEqual([])
    })

    it("fmt", () => {
      const span = new Span(
        Point.decode([[999, 4, 3]]),
        FMTContent.decode([2, [[2, {B: true}, [3, 7]]]])
      )
      expect(subject.fmt(span)).toStrictEqual([
        {index: 2, attributes: span.content.attributes},
      ])
      expect(new Text(undefined).fmt(span)).toStrictEqual([])
    })

    it("insAt", () => {
      const content = INSContent.from("xyz")
      const block = new Block(
        "block-id",
        {},
        pointMIN.clone(),
        {TYPE: [null, "LINE"]},
        false
      )
      const contributor = new Contributor(5, 9)
      expect(subject.insAt(2, content, contributor, block)).toStrictEqual(
        new Span(
          Point.decode([
            [999, 4, 2],
            [2147483647, 5, 1],
          ]),
          INSContent.from("xyz")
        )
      )
      expect(block.version).toStrictEqual({5: [0, 3]})
      expect(
        new Text(undefined).insAt(2, content, contributor, block)
      ).toStrictEqual(
        new Span(Point.decode([[2147483647, 5, 4]]), INSContent.from("xyz"))
      )
    })

    it("delAt", () => {
      expect(subject.delAt(2, 6)).toStrictEqual(
        new Spans(
          new Span(Point.decode([[999, 4, 3]]), INSContent.from("cd")),
          new Span(Point.decode([[999, 4, 5]]), INSContent.from("efgh"))
        )
      )
      expect(subject.delAt(9, 6)).toBeUndefined()
      expect(new Text(undefined).delAt(2, 6)).toBeUndefined()
    })

    it("fmtAt", () => {
      expect(subject.fmtAt(2, 6, {B: true}, [3, 7])).toStrictEqual([
        new Span(
          Point.decode([[999, 4, 3]]),
          FMTContent.decode([2, [[2, {B: true}, [3, 7]]]])
        ),
        new Span(
          Point.decode([[999, 4, 5]]),
          FMTContent.decode([4, [[4, {B: true}, [3, 7]]]])
        ),
      ])
      expect(subject.fmtAt(9, 6, {B: true}, [3, 7])).toStrictEqual([])
      expect(new Text(undefined).fmtAt(2, 6, {B: true}, [3, 7])).toStrictEqual(
        []
      )
    })
  })

  describe("encoding", () => {
    it("should work", () => {
      const encoded = subject.encode()
      expect(Array.from(encoded)).toStrictEqual(data)
      const decoded = Text.decode(data)
      expect(decoded).toStrictEqual(subject)

      expect(new Text(undefined).encode()).toStrictEqual([])
    })
  })
})
