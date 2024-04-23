import {Span, Spans} from "@/domain/entity"
import {TextNode} from "./textNode"

describe("@entity.tree.textNode", () => {
  describe("getter", () => {
    const subject = TextNode.fromSpans([
      Span.decodeText([[[3, 3, 3]], "foo"]),
      Span.decodeText([[[5, 5, 5]], "bar"]),
      Span.decodeText([[[7, 7, 7]], "baz"]),
    ])!
    const left = subject.left!
    const right = subject.right!

    it("should set valid default values", () => {
      expect(subject.length).toBe(9)
      expect(subject.rank).toBe(2)
      expect(subject.shouldBeDeleted).toBe(false)
    })

    it("should return valid currMINIndex", () => {
      expect(subject.leftLength()).toBe(3)
    })

    it("should return valid spans", () => {
      expect(subject.spans()).toStrictEqual(
        new Spans(...[left.span, subject.span, right.span])
      )
    })

    it("should return proper span for min, max, pred, succ", () => {
      expect(subject.minSpan()).toBe(subject.left?.span)
      expect(left.minSpan()).toBe(subject.left?.span)

      expect(subject.maxSpan()).toBe(subject.right?.span)
      expect(right.maxSpan()).toBe(subject.right?.span)

      expect(subject.predecessorSpan()).toBe(subject.left?.span)
      expect(left.predecessorSpan()).toBe(undefined)

      expect(subject.successorSpan()).toBe(subject.right?.span)
      expect(right.successorSpan()).toBe(undefined)
    })
  })

  describe("setter", () => {
    it("setLeft", () => {
      const subject = new TextNode(Span.decodeText([[[5, 5, 5]], "bar"]))
      expect(subject.rank).toBe(1)
      expect(subject.length).toBe(3)
      expect(subject.left).toBe(undefined)

      const left = new TextNode(Span.decodeText([[[3, 3, 3]], "foo"]))
      subject.setLeft(left)

      expect(subject.rank).toBe(2)
      expect(subject.length).toBe(6)
      expect(subject.left).toBe(left)
    })

    it("setRight", () => {
      const subject = new TextNode(Span.decodeText([[[5, 5, 5]], "bar"]))
      expect(subject.rank).toBe(1)
      expect(subject.length).toBe(3)
      expect(subject.right).toBe(undefined)

      const right = new TextNode(Span.decodeText([[[7, 7, 7]], "foo"]))
      subject.setRight(right)

      expect(subject.rank).toBe(2)
      expect(subject.length).toBe(6)
      expect(subject.right).toBe(right)
    })

    it("setSpan", () => {
      const subject = TextNode.fromSpans([
        Span.decodeText([[[3, 3, 3]], "foo"]),
        Span.decodeText([[[5, 5, 5]], "bar"]),
      ])!
      expect(subject.rank).toBe(2)
      expect(subject.length).toBe(6)

      subject.setSpan(Span.decodeText([[[7, 7, 7]], "f"]))

      expect(subject.rank).toBe(2)
      expect(subject.length).toBe(4)
    })
  })

  describe("balance", () => {
    it("should return undefined if shouldBeDeleted is true", () => {
      const origin = Span.decodeText([[[5, 5, 5]], "c"])
      const subject = new TextNode(origin)
      subject.shouldBeDeleted = true

      expect(subject.balance()).toBe(undefined)
    })
    it("should balance left-unbalanced state", () => {
      const min = Span.decodeText([[[1, 1, 1]], "a"])
      const pred = Span.decodeText([[[3, 3, 3]], "b"])
      const origin = Span.decodeText([[[5, 5, 5]], "c"])

      let subject = new TextNode(
        origin,
        new TextNode(min, undefined, new TextNode(pred))
      )
      subject = subject.balance()!

      expect(subject.left?.span).toBe(min)
      expect(subject.span).toBe(pred)
      expect(subject.right?.span).toBe(origin)
    })
  })

  describe("insert", () => {
    it("insertPredecessor", () => {
      const subject = new TextNode(Span.decodeText([[[5, 5, 5]], "bar"]))
      const min = Span.decodeText([[[1, 1, 1]], "a"])
      const pred = Span.decodeText([[[3, 3, 3]], "b"])

      subject.insertPredecessor(min)
      expect(subject.left?.span).toBe(min)

      subject.insertPredecessor(pred)
      expect(subject.left?.right?.span).toBe(pred)
    })

    it("insertSuccessor", () => {
      const subject = new TextNode(Span.decodeText([[[5, 5, 5]], "bar"]))
      const max = Span.decodeText([[[7, 7, 7]], "c"])
      const succ = Span.decodeText([[[9, 9, 9]], "d"])

      subject.insertSuccessor(max)
      expect(subject.right?.span).toBe(max)

      subject.insertSuccessor(succ)
      expect(subject.right?.left?.span).toBe(succ)
    })

    it("insertMIN", () => {
      const origin = Span.decodeText([[[5, 5, 5]], "bar"])
      const min = Span.decodeText([[[1, 1, 1]], "a"])
      const pred = Span.decodeText([[[3, 3, 3]], "b"])
      let subject = new TextNode(origin)

      subject = subject.insertMIN(pred)
      expect(subject.left?.span).toBe(pred)

      subject = subject.insertMIN(min)
      expect(subject.left?.span).toBe(min)
      expect(subject.span).toBe(pred)
      expect(subject.right?.span).toBe(origin)
    })

    it("insertMAX", () => {
      const origin = Span.decodeText([[[5, 5, 5]], "bar"])
      const max = Span.decodeText([[[7, 7, 7]], "c"])
      const succ = Span.decodeText([[[9, 9, 9]], "d"])
      let subject = new TextNode(origin)

      subject = subject.insertMAX(succ)
      expect(subject.right?.span).toBe(succ)

      subject = subject.insertMAX(max)
      expect(subject.left?.span).toBe(origin)
      expect(subject.span).toBe(succ)
      expect(subject.right?.span).toBe(max)
    })
  })

  describe("delete", () => {
    it("deletePredecessor", () => {
      const origin = Span.decodeText([[[5, 5, 5]], "c"])
      const subject = new TextNode(origin)
      const pred = Span.decodeText([[[3, 3, 3]], "b"])

      subject.deletePredecessor()
      subject.left = new TextNode(pred)
      subject.deletePredecessor()

      expect(subject.span).toBe(origin)
      expect(subject.left).toBe(undefined)
    })

    it("deleteSuccessor", () => {
      const origin = Span.decodeText([[[5, 5, 5]], "c"])
      const subject = new TextNode(origin)
      const succ = Span.decodeText([[[7, 7, 7]], "d"])

      subject.deleteSuccessor()
      subject.right = new TextNode(succ)
      subject.deleteSuccessor()

      expect(subject.span).toBe(origin)
      expect(subject.right).toBe(undefined)
    })

    it("deleteMIN", () => {
      const origin = Span.decodeText([[[5, 5, 5]], "c"])
      const pred = Span.decodeText([[[3, 3, 3]], "b"])
      let subject = new TextNode(origin)
      subject.left = new TextNode(pred)

      subject = subject.deleteMIN()!

      expect(subject.span).toBe(origin)
      expect(subject.left).toBe(undefined)
      expect(subject.right).toBe(undefined)
    })

    it("deleteMAX", () => {
      const origin = Span.decodeText([[[5, 5, 5]], "c"])
      const succ = Span.decodeText([[[7, 7, 7]], "d"])
      let subject = new TextNode(origin)
      subject.right = new TextNode(succ)

      subject = subject.deleteMAX()!

      expect(subject.span).toBe(origin)
      expect(subject.left).toBe(undefined)
      expect(subject.right).toBe(undefined)
    })

    describe("deleteSelf", () => {
      it("should only set shouldBeDeleted true if it is single textNode", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "c"])
        const subject = new TextNode(origin)
        subject.deleteSelf()
        expect(subject.shouldBeDeleted).toBe(true)
      })

      it("should be replaced by successor if it exists", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "c"])
        const right = Span.decodeText([[[7, 7, 7]], "d"])
        const subject = new TextNode(origin, undefined, new TextNode(right))

        expect(subject.rank).toBe(2)
        expect(subject.length).toBe(2)
        subject.deleteSelf()
        expect(subject.shouldBeDeleted).toBe(false)
        expect(subject.rank).toBe(1)
        expect(subject.length).toBe(1)
        expect(subject.span).toBe(right)
      })

      it("should be replaced by predecessor if it exists", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "c"])
        const left = Span.decodeText([[[3, 3, 3]], "d"])
        const subject = TextNode.fromSpans([left, origin])!

        expect(subject.rank).toBe(2)
        expect(subject.length).toBe(2)
        subject.deleteSelf()
        expect(subject.shouldBeDeleted).toBe(false)
        expect(subject.rank).toBe(1)
        expect(subject.length).toBe(1)
        expect(subject.span).toBe(left)
      })
    })
  })

  describe("merge", () => {
    describe("mergeLeft", () => {
      it("should work", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "c"])
        const pred = Span.decodeText([[[5, 5, 3]], "ab"])
        const subject = TextNode.fromSpans([pred, origin])!

        expect(subject.rank).toBe(2)
        expect(subject.length).toBe(3)
        subject.mergeLeft()

        expect(subject.rank).toBe(1)
        expect(subject.length).toBe(3)
        expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("abc")
        expect(subject.left).toBe(undefined)
      })
      it("should do nothing if curr hasMeta", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "a"])
        const pred = Span.decodeText([[[5, 5, 3]], "b"])
        const subject = TextNode.fromSpans([pred, origin])!

        delete subject.span.content.text
        subject.mergeLeft()

        expect(subject.rank).toBe(2)
      })

      it("should do nothing if prev hasMeta", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "a"])
        const pred = Span.decodeText([[[5, 5, 3]], "b"])
        const subject = TextNode.fromSpans([pred, origin])!

        delete subject.left!.span.content.text
        subject.mergeLeft()

        expect(subject.rank).toBe(2)
      })

      it("should do nothing if prev is not prependable", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "c"])
        const pred = Span.decodeText([[[5, 5, 3]], "a"])
        const subject = TextNode.fromSpans([pred, origin])!

        subject.mergeLeft()

        expect(subject.rank).toBe(2)
        expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("c")
      })
    })

    describe("mergeRight", () => {
      it("should work", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "c"])
        const succ = Span.decodeText([[[5, 5, 6]], "de"])
        const subject = new TextNode(origin, undefined, new TextNode(succ))

        expect(subject.rank).toBe(2)
        expect(subject.length).toBe(3)
        subject.mergeRight()

        expect(subject.rank).toBe(1)
        expect(subject.length).toBe(3)
        expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("cde")
        expect(subject.right).toBe(undefined)
      })

      it("should do nothing if curr hasMeta", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "a"])
        const succ = Span.decodeText([[[5, 5, 6]], "b"])
        const subject = new TextNode(origin, undefined, new TextNode(succ))

        delete subject.span.content.text
        subject.mergeRight()

        expect(subject.rank).toBe(2)
      })

      it("should do nothing if succ hasMeta", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "a"])
        const succ = Span.decodeText([[[5, 5, 6]], "b"])
        const subject = new TextNode(origin, undefined, new TextNode(succ))

        delete subject.right!.span.content.text
        subject.mergeRight()

        expect(subject.rank).toBe(2)
      })

      it("should do nothing if prev is not appendable", () => {
        const origin = Span.decodeText([[[5, 5, 5]], "c"])
        const succ = Span.decodeText([[[5, 5, 7]], "de"])
        const subject = new TextNode(origin, undefined, new TextNode(succ))

        subject.mergeRight()

        expect(subject.rank).toBe(2)
        expect(subject.span.content.toTextWithMetaPlaceholder()).toBe("c")
      })
    })
  })

  describe("encoding", () => {
    it("should work", () => {
      const left = Span.decodeText([[[1, 1, 1]], "l"])
      const mid = Span.decodeText([[[3, 3, 3]], "m"])
      const right = Span.decodeText([[[5, 5, 5]], "r"])
      const subject = TextNode.fromSpans([left, mid, right])!

      const encoded = subject.encode()
      expect(subject).toStrictEqual(TextNode.decode(encoded))
    })

    describe("decode", () => {
      it("should return undefined when data is undefined", () => {
        const result = TextNode.decode(undefined)
        expect(result).toBeUndefined()
        expect(TextNode.decode()).toBe(result)
      })
    })
  })

  describe("fromSpans", () => {
    it("should work with 0 spans", () => {
      const subject = TextNode.fromSpans(new Spans())

      expect(subject).toBe(undefined)
    })

    it("should work with 1 spans", () => {
      const mid = Span.decodeText([[[3, 3, 3]], "m"])
      const textNode = new TextNode(mid)
      const spans = textNode.spans()
      const subject = TextNode.fromSpans(spans)

      expect(subject).toStrictEqual(textNode)
    })

    it("should work with 2 spans", () => {
      const left = Span.decodeText([[[1, 1, 1]], "l"])
      const mid = Span.decodeText([[[3, 3, 3]], "m"])
      const textNode = new TextNode(mid, new TextNode(left))
      const spans = textNode.spans()
      const subject = TextNode.fromSpans(spans)

      expect(subject).toStrictEqual(textNode)
    })

    it("should work with 3 spans", () => {
      const left = Span.decodeText([[[1, 1, 1]], "l"])
      const mid = Span.decodeText([[[3, 3, 3]], "m"])
      const right = Span.decodeText([[[5, 5, 5]], "r"])
      const textNode = new TextNode(
        mid,
        new TextNode(left),
        new TextNode(right)
      )
      const spans = textNode.spans()
      const subject = TextNode.fromSpans(spans)

      expect(subject).toStrictEqual(textNode)
    })
  })
})
