import type {ReplicaData} from "."

import {
  Block,
  Point,
  Span,
  Spans,
  INSContent,
  DELContent,
  MODContent,
  FMTContent,
  OP,
} from "@/domain/entity"
import {Replica} from "."

describe("@usecase.replica", () => {
  let subject!: Replica

  beforeEach(() => {
    subject = genReplica()
  })

  describe("getter", () => {
    it("replicaID", () => {
      expect(subject.replicaID).toBe(5)
    })

    it("block", () => {
      expect(subject.block("4-2").blockID).toBe("4-2")
    })

    it("childBlocks", () => {
      expect(
        subject.childBlocks("0-4", false).map(block => block.blockID)
      ).toStrictEqual(["4-1", "4-2", "4-4"])
      expect(
        subject.childBlocks("0-4", true).map(block => block.blockID)
      ).toStrictEqual(["4-1", "4-2", "4-3", "4-4"])
      expect(subject.childBlocks("2-1", true)).toStrictEqual([])
    })

    it("findBlock", () => {
      expect(subject.findBlock(block => block.isDeleted)?.blockID).toBe("3-1")
    })

    it("encode", () => {
      expect(subject.encode()).toStrictEqual(data)
    })

    it("prevSiblingBlock", () => {
      expect(subject.prevSiblingBlock("0-0")).toBeNull()
      expect(subject.prevSiblingBlock("2-1")).toBeNull()
      expect(subject.prevSiblingBlock("4-1")).toBeNull()
      expect(subject.prevSiblingBlock("4-4")?.blockID).toBe("4-2")
      expect(subject.prevSiblingBlock("4-4", true)?.blockID).toBe("4-3")
    })

    it("nextSiblingBlock", () => {
      expect(subject.nextSiblingBlock("0-0")).toBeNull()
      expect(subject.nextSiblingBlock("2-1")).toBeNull()
      expect(subject.nextSiblingBlock("4-4")).toBeNull()
      expect(subject.nextSiblingBlock("4-2")?.blockID).toBe("4-4")
      expect(subject.nextSiblingBlock("4-2", true)?.blockID).toBe("4-3")
    })

    it("prevBlock", () => {
      expect(subject.prevBlock("0-0")).toBeNull()
      expect(subject.prevBlock("0-1")?.blockID).toBe("0-0")
      expect(subject.prevBlock("2-1")?.blockID).toBe("0-2")
      expect(subject.prevBlock("0-4")?.blockID).toBe("0-3")
      expect(subject.prevBlock("0-4", true)?.blockID).toBe("3-1")
      expect(subject.prevBlock("4-4")?.blockID).toBe("4-2")
      expect(subject.prevBlock("4-4", true)?.blockID).toBe("4-3")
    })

    it("nextBlock", () => {
      expect(subject.nextBlock("0-0")?.blockID).toBe("0-1")
      expect(subject.nextBlock("4-4")).toBeNull()
      expect(subject.nextBlock("0-2")?.blockID).toBe("2-1")
      expect(subject.nextBlock("0-3")?.blockID).toBe("0-4")
      expect(subject.nextBlock("0-3", true)?.blockID).toBe("3-1")
      expect(subject.nextBlock("4-2")?.blockID).toBe("4-4")
      expect(subject.nextBlock("4-2", true)?.blockID).toBe("4-3")
      expect(subject.nextBlock("1-3")?.blockID).toBe("1-4")
      expect(subject.nextBlock("1-4")?.blockID).toBe("0-2")
    })

    it("genNewStamp", () => {
      const before = Date.now()
      const result = subject.genNewStamp()
      const after = Date.now()
      expect(result.length).toBe(2)
      expect(result[0]).toBe(subject.replicaID)
      expect(result[1]).toBeGreaterThanOrEqual(before)
      expect(result[1]).toBeLessThanOrEqual(after)
    })

    it("replaceBlock", () => {
      const note = Block.decode([
        "0-0",
        {},
        [[0, 0, 1]],
        {
          TYPE: [null, "NOTE"],
        },
        false,
        [],
        undefined,
      ])
      subject.replaceBlock(note)
      expect(subject.block(note.blockID)).toBe(note)

      const contentBlock = Block.decode([
        "0-1",
        {},
        [[0, 1, 1]],
        {
          TYPE: [null, "LINE"],
        },
        false,
        [],
        "0-0",
      ])
      subject.replaceBlock(contentBlock)
      expect(subject.childBlocks(note.blockID, false)[0]).toBe(contentBlock)
    })

    it("genBlockPoint", () => {
      expect(subject.genBlockPoint().encode()).toStrictEqual([
        [2147483647, 5, 4],
      ])
    })

    it("genSpanFor", () => {
      const block = subject.block("0-1")
      expect(
        subject.genSpanFor(block, INSContent.from("abc")).encode()
      ).toStrictEqual([[[2147483647, 5, 1]], [[[3]], "abc"]])
    })

    it("subSpans", () => {
      expect(subject.subSpans("1-3", 0, 0)).toStrictEqual(new Spans())
      expect(subject.subSpans("4-1", 0, 0)).toStrictEqual(new Spans())
    })

    it("stringify", () => {
      expect(subject.stringify("1-3")).toBe("")
    })

    it("pointAt", () => {
      expect(subject.pointAt("1-3", 0)).toBeUndefined()
    })
  })

  describe("op", () => {
    it("insBlock", () => {
      const contentBlock = Block.decode([
        "9-9",
        {},
        [[0, 9, 9]],
        {
          TYPE: [null, "LINE"],
        },
        false,
        [],
        "0-0",
      ])
      expect(subject.insBlock(contentBlock)).toBeTruthy()
      const childBlocksOfTheParentBlock = subject.childBlocks("0-0", false)
      expect(
        childBlocksOfTheParentBlock[childBlocksOfTheParentBlock.length - 1]
      ).toBe(contentBlock)
    })

    it("delBlock", () => {
      const op: OP.bDEL = {
        isDeleted: true,
        stamp: [8, 10],
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      subject.block("1-1").props.DEL = [[9, 11]]
      expect(subject.delBlock("1-1", op)).toBeUndefined()

      const before = subject.childBlocks("0-1", false).length
      subject.block("1-1").props.DEL = [[8, 9]]
      subject.delBlock("1-1", op)
      expect(subject.childBlocks("0-1", false).length).toBe(before - 1)

      op.isDeleted = false
      op.stamp = [9, 11]
      expect(subject.delBlock("1-1", op)).not.toBeUndefined()
      expect(subject.childBlocks("0-1", false).length).toBe(before)
    })

    it("movBlock", () => {
      const op: OP.bMOV = {
        parentBlockID: "0-2",
        point: Point.decode([[999, 999, 999]]),
        stamp: [8, 10],
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      subject.block("1-1").props.MOV = [[9, 11]]
      expect(subject.movBlock("1-1", op)).toBeUndefined()

      const beforeFrom = subject.childBlocks("0-1", false).length
      const beforeTo = subject.childBlocks("0-2", false).length
      subject.block("1-1").props.MOV = [[8, 9]]
      expect(subject.movBlock("1-1", op)).not.toBeUndefined()
      expect(subject.childBlocks("0-1", false).length).toBe(beforeFrom - 1)
      expect(subject.childBlocks("0-2", false).length).toBe(beforeTo + 1)
    })

    it("setBlock", () => {
      const op: OP.bSET = {
        props: {SRC: "https://notebox.cloud"},
        stamp: [8, 10],
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      expect(subject.setBlock("1-1", op)).not.toBeUndefined()
    })

    it("insText", () => {
      const op: OP.tINS = {
        span: new Span(Point.decode([[999, 4, 2]]), INSContent.from("bcd")),
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      expect(subject.insText("1-1", op)).not.toBeUndefined()
    })

    it("delText", () => {
      const op: OP.tDEL = {
        span: new Span(Point.decode([[999, 4, 2]]), new DELContent(5)),
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      expect(subject.delText("1-1", op)).not.toBeUndefined()
    })

    it("modText", () => {
      const op: OP.tMOD = {
        span: new Span(Point.decode([[999, 4, 2]]), new MODContent("xy")),
        contributor: {
          replicaID: 95,
          nonce: [97, 99],
        },
      }
      expect(subject.modText("1-1", op)).not.toBeUndefined()
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
      expect(subject.fmtText("1-1", op)).not.toBeUndefined()
    })

    it("insTextAt", () => {
      const op: OP.tINSAt = {
        index: 0,
        content: INSContent.from("xyz"),
        contributor: subject.contributor,
      }
      expect(subject.insTextAt("1-1", op)).not.toBeUndefined()
    })

    it("delTextAt", () => {
      subject.insTextAt("1-1", {
        index: 0,
        content: INSContent.from("xyz"),
        contributor: subject.contributor,
      })
      const op: OP.tDELAt = {
        index: 1,
        length: 1,
        contributor: subject.contributor,
      }
      expect(subject.delTextAt("1-1", op)).not.toBeUndefined()
    })

    it("fmtTextAt", () => {
      const op: OP.tFMTAt = {
        index: 0,
        length: 1,
        props: {B: true},
        stamp: [11, 12],
        contributor: subject.contributor,
      }
      expect(subject.fmtTextAt("1-1", op)).not.toBeUndefined()
    })
  })

  describe("private", () => {
    it("addToParentBlock should handle the children of an inserted block", () => {
      const parentBlock = Block.decode([
        "9-9",
        {},
        [[0, 9, 9]],
        {
          TYPE: [null, "LINE"],
        },
        false,
        [],
        "0-0",
      ])
      expect(subject.insBlock(parentBlock)).toBeTruthy()
      const childBlock = Block.decode([
        "9-10",
        {},
        [[0, 9, 9]],
        {
          TYPE: [null, "LINE"],
        },
        false,
        [],
        parentBlock.blockID,
      ])
      expect(subject.insBlock(parentBlock)).toBeTruthy()
      expect(subject.insBlock(childBlock)).toBeTruthy()
      expect(subject.childBlocks(parentBlock.blockID, false)[0]).toBe(
        childBlock
      )
    })

    it("addToParentBlock should handle duplicated inserting", () => {
      const block = Block.decode([
        "9-9",
        {},
        [[0, 9, 9]],
        {
          TYPE: [null, "LINE"],
        },
        false,
        [],
        "0-0",
      ])
      const before = subject.childBlocks("0-0", false).length
      expect(subject.insBlock(block)).toBeTruthy()
      expect(subject.childBlocks("0-0", false).length).toBe(before + 1)
      expect(subject.insBlock(block)).toBeTruthy()
      expect(subject.childBlocks("0-0", false).length).toBe(before + 1)
    })
  })
})

const data: ReplicaData = {
  replicaID: 5,
  blocks: [
    [
      "0-0",
      {},
      [[0, 0, 1]],
      {
        TYPE: [null, "NOTE"],
      },
      false,
      [],
      undefined,
    ],
    // three siblings
    [
      "0-1",
      {},
      [[0, 1, 1]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-0",
    ],
    [
      "1-1",
      {},
      [[0, 1, 1]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-1",
    ],
    [
      "1-3",
      {},
      [[0, 5, 3]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-1",
    ],
    [
      "1-2",
      {},
      [[0, 5, 2]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-1",
    ],
    // nested child
    [
      "1-4",
      {},
      [[0, 5, 3]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "1-3",
    ],
    // single sibling
    [
      "0-2",
      {},
      [[0, 2, 2]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-0",
    ],
    [
      "2-1",
      {},
      [[0, 1, 1]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-2",
    ],
    // deleted sibling
    [
      "0-3",
      {},
      [[0, 2, 2]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-0",
    ],
    [
      "3-1",
      {},
      [[0, 1, 1]],
      {
        TYPE: [null, "LINE"],
      },
      true,
      [],
      "0-3",
    ],
    // three siblings
    [
      "0-4",
      {},
      [[0, 2, 2]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-0",
    ],
    [
      "4-1",
      {},
      [[0, 1, 1]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      undefined,
      "0-4",
    ],
    [
      "4-2",
      {},
      [[0, 1, 2]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-4",
    ],
    [
      "4-3",
      {},
      [[0, 1, 3]],
      {
        TYPE: [null, "LINE"],
      },
      true,
      [],
      "0-4",
    ],
    [
      "4-4",
      {},
      [[0, 1, 4]],
      {
        TYPE: [null, "LINE"],
      },
      false,
      [],
      "0-4",
    ],
  ],
}

const genReplica = () => Replica.decode(data)
