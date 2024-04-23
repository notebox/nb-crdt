import type {uint32, BlockData, INSContentData} from "@/domain/entity"

import {
  Contributor,
  Point,
  BlockVersion,
  Text,
  INSContent,
  DELContent,
  MODContent,
  FMTContent,
  pointMIN,
  OP,
  Span,
  Spans,
} from "@/domain/entity"
import {Block} from "./block"

describe("@entity.block", () => {
  it("type", () => {
    const type = "BLOCKQUOTE"
    const subject = new Block(
      "block-id",
      {},
      pointMIN.clone(),
      {TYPE: [null, type]},
      false,
      new Text(undefined)
    )

    expect(subject.type).toBe(type)
  })

  it("hasText", () => {
    expect(
      new Block(
        "block-id",
        {},
        pointMIN.clone(),
        {TYPE: [null, "LINE"]},
        false,
        new Text(undefined)
      ).hasText()
    ).toBeTruthy()
    expect(
      new Block(
        "block-id",
        {},
        pointMIN.clone(),
        {TYPE: [null, "LINE"]},
        false
      ).hasText()
    ).toBeFalsy()
  })

  it("encode", () => {
    const data: BlockData = [
      "block-id",
      {"3": [5, 7]},
      [[2, 4, 6]],
      {
        TYPE: [[11, 13], "CL"],
        DONE: [null, true],
      },
      false,
      [],
      "parent-block-id",
    ]
    expect(Block.decode(data).encode()).toStrictEqual(data)
  })

  describe("spanFor", () => {
    it("should work", () => {
      const replicaID = 7
      const subject = newTextBlock()
      const content = INSContent.from("foobar")

      const span = subject.spanFor(replicaID, content, {
        lower: Point.decode([[2147483647, 5, 1]]),
        upper: Point.decode([[4294967295, 0, 2]]),
      })
      expect(span.lowerPoint).toStrictEqual(Point.decode([[3221225471, 7, 1]]))
      expect(subject.version[replicaID][1]).toBe(6)
    })

    it("should throw with empty-content", () => {
      const subject = newTextBlock()
      expect(() => subject.spanFor(5, INSContent.from(""))).toThrowError()
    })

    it("should handle appendable case", () => {
      const replicaID = 5
      const subject = newTextBlock(replicaID, 1)
      const appendable = INSContent.from("world")

      const span = subject.spanFor(replicaID, appendable, {
        lower: Point.decode([[5, 5, 1]]),
        upper: undefined,
      })
      expect(span.lowerPoint).toStrictEqual(Point.decode([[5, 5, 2]]))
    })

    it("should use pointMIN and pointMAX as default values", () => {
      const replicaID = 5
      const subject = newTextBlock(replicaID, 1)
      const appendable = INSContent.from("world")

      const span = subject.spanFor(replicaID, appendable)
      expect(span.lowerPoint).toStrictEqual(Point.decode([[2147483647, 5, 2]]))
    })

    it("should work for density", () => {
      const subject = newTextBlock()
      const content = INSContent.from("foobar")

      const span = subject.spanFor(7, content, {
        lower: Point.decode([
          [3, 3, 3],
          [5, 5, 5],
        ]),
        upper: Point.decode([
          [3, 3, 3],
          [6, 6, 6],
        ]),
      })
      expect(span.lowerPoint).toStrictEqual(
        Point.decode([
          [3, 3, 3],
          [5, 5, 4294967295],
          [2147483647, 7, 1],
        ])
      )
    })
  })

  describe("op", () => {
    let data: BlockData
    let subject!: Block

    beforeEach(() => {
      data = [
        "block-id",
        {"3": [5, 7]},
        [[2, 4, 6]],
        {
          TYPE: [[11, 13], "CL"],
          DONE: [null, true],
          GLOBAL_COUNT: [null, true],
          MOV: [[9, 11]],
          DATABASE: {
            "1-1": {name: [null, "a"]},
            "1-2": {name: [[9, 11], "b"]},
            "1-3": {name: [[11, 13], "c"]},
          },
        },
        false,
        [],
        "parent-block-id",
      ]
      subject = Block.decode(data)
    })

    it("mov", () => {
      const from = {
        parentBlockID: subject.parentBlockID,
        point: subject.point.clone(),
      }
      const newParentBlockID = "new-parent-block-id"
      const op: OP.bMOV = {
        parentBlockID: newParentBlockID,
        point: subject.point.offset(3),
        stamp: [10, 12],
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      const result = subject.mov(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        version: undefined,
        from,
        to: {
          parentBlockID: op.parentBlockID,
          point: op.point,
        },
      })
      expect(subject.parentBlockID).toBe(newParentBlockID)
      expect(subject.mov(op)).toBeUndefined()
    })

    it("del", () => {
      const op: OP.bDEL = {
        isDeleted: true,
        stamp: [8, 10],
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      const result = subject.del(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        version: undefined,
        from: false,
        to: true,
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 95: [97, 99]})
      expect(subject.del(op)).toBeUndefined()
    })

    it("set", () => {
      const op: OP.bSET = {
        props: {
          TYPE: "UL",
          DONE: true,
          SRC: "foobar",
          GLOBAL_COUNT: null,
          DATABASE: {
            "1-1": {name: "aa"},
            "1-2": {name: "bb"},
            "1-3": {name: "cc"},
            "1-4": {name: "dd"},
          },
          DATAROW: {
            "1-1": {
              value: [[[5, {I: true}]], "Hello"] as INSContentData,
              format: {S: true, LEAF: true},
            },
          },
        },
        stamp: [11, 12],
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      const result = subject.set(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        version: undefined,
        from: {
          SRC: null,
          GLOBAL_COUNT: true,
          DATABASE: {
            "1-1": {name: "a"},
            "1-2": {name: "b"},
            "1-4": {name: null},
          },
          DATAROW: {
            "1-1": {
              value: null,
              format: null,
            },
          },
        },
        to: {
          SRC: "foobar",
          GLOBAL_COUNT: null,
          DATABASE: {
            "1-1": {name: "aa"},
            "1-2": {name: "bb"},
            "1-4": {name: "dd"},
          },
          DATAROW: {
            "1-1": {
              value: [[[5, {I: true}]], "Hello"],
              format: {S: true, LEAF: true},
            },
          },
        },
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 95: [97, 99]})
      expect(subject.props).toStrictEqual({
        TYPE: [[11, 13], "CL"],
        DONE: [null, true],
        SRC: [[11, 12], "foobar"],
        GLOBAL_COUNT: [[11, 12]],
        MOV: [[9, 11]],
        DATABASE: {
          "1-1": {name: [[11, 12], "aa"]},
          "1-2": {name: [[11, 12], "bb"]},
          "1-3": {name: [[11, 13], "c"]},
          "1-4": {name: [[11, 12], "dd"]},
        },
        DATAROW: {
          "1-1": {
            value: [
              [11, 12],
              [[[5, {I: true}]], "Hello"],
            ],
            format: [[11, 12], {S: true, LEAF: true}],
          },
        },
      })
    })

    it("set nothing", () => {
      const op: OP.bSET = {
        props: {
          DATABASE: {
            "1-3": {name: "cc"},
          },
        },
        stamp: [11, 12],
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      expect(subject.set(op)).toBeUndefined()
      expect(subject.encode()).toStrictEqual(data)
    })

    it("insText", () => {
      const op: OP.tINS = {
        span: new Span(Point.decode([[999, 4, 2]]), INSContent.from("bcd")),
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      const result = subject.insText(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        version: undefined,
        delta: [{index: 0, content: op.span.content}],
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 95: [97, 99]})
    })

    it("delText", () => {
      const op: OP.tDEL = {
        span: new Span(Point.decode([[999, 4, 2]]), new DELContent(5)),
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      const result = subject.delText(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        version: undefined,
        delta: [],
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 95: [97, 99]})
    })

    it("modText", () => {
      const op: OP.tMOD = {
        span: new Span(Point.decode([[999, 4, 2]]), new MODContent("xy")),
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      const result = subject.modText(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        version: undefined,
        span: op.span,
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 95: [97, 99]})
    })

    it("fmtText", () => {
      const op: OP.tFMT = {
        span: new Span(
          Point.decode([[999, 4, 2]]),
          FMTContent.decode([5, [[5, {B: true}]]])
        ),
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      const result = subject.fmtText(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        version: undefined,
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 95: [97, 99]})
    })

    it("insTextAt", () => {
      const op: OP.tINSAt = {
        index: 0,
        content: INSContent.from("xyz"),
        contributor: new Contributor(5, 9),
      }
      const result = subject.insTextAt(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        span: new Span(Point.decode([[2147483647, 5, 1]]), op.content),
        version: {
          nonce: [1, 3],
          replicaID: 5,
        },
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 5: [1, 3]})
    })

    it("delTextAt", () => {
      subject.insTextAt({
        index: 0,
        content: INSContent.from("abc"),
        contributor: new Contributor(5, 9),
      })
      const op: OP.tDELAt = {
        index: 1,
        length: 1,
        contributor: new Contributor(5, 9),
      }
      const result = subject.delTextAt(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        spans: new Spans(
          new Span(Point.decode([[2147483647, 5, 2]]), INSContent.from("b"))
        ),
        version: {
          nonce: [2, 3],
          replicaID: 5,
        },
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 5: [2, 3]})
    })

    it("fmtTextAt", () => {
      const op: OP.tFMTAt = {
        index: 0,
        length: 1,
        props: {B: true},
        stamp: [11, 12],
        contributor: new Contributor(5, 1),
      }
      const result = subject.fmtTextAt(op)
      expect(result).toStrictEqual({
        blockID: subject.blockID,
        spans: [],
        version: {
          nonce: [1, 0],
          replicaID: 5,
        },
      })
      expect(subject.version).toStrictEqual({3: [5, 7], 5: [1, 0]})
    })
  })
})

const newTextBlock = (replicaID?: uint32, pointNonce?: uint32) => {
  let version: BlockVersion = {}

  if (replicaID != null && pointNonce != null) {
    version = {[replicaID]: [0, pointNonce]} as BlockVersion
  }

  return new Block(
    "block-id",
    version,
    pointMIN.clone(),
    {TYPE: [null, "LINE"]},
    false,
    new Text(undefined)
  )
}
