import {Attributes} from "./attributes"
import {INSContent} from "./ins"
import {FMTContent} from "./fmt"
import {MODContent} from "./mod"

describe("@entity.content", () => {
  describe("getters", () => {
    it("should work for meta", () => {
      const subject = INSContent.decode([[[1]]])
      expect(subject.isMeta()).toBe(true)
      expect(subject.length).toBe(1)
      expect(subject.toTextWithMetaPlaceholder()).toBe(" ")
      expect(JSON.stringify(subject)).toStrictEqual(
        JSON.stringify({
          attributes: {leaves: [{length: 1}]},
        })
      )
    })

    it("should work for text", () => {
      const text = "foobar👍🏿"
      const subject = INSContent.from(text)
      expect(subject.isMeta()).toBe(false)
      expect(subject.length).toBe(text.length)
      expect(subject.toTextWithMetaPlaceholder()).toBe(text)
      expect(subject.encode()).toStrictEqual([[[text.length]], text])
    })
  })

  describe("slice", () => {
    it("should work", () => {
      const subject = INSContent.from("foobar")
      const result = subject.slice(1, 4)

      expect(result).toStrictEqual(INSContent.from("oob"))
    })

    it("should throw if it is meta", () => {
      const subject = INSContent.from()
      expect(() => subject.slice(0, 1)).toThrowError()
    })

    it("should use the full length if the end is undefined", () => {
      const subject = INSContent.from("foobar")
      const result = subject.slice(3)

      expect(result).toStrictEqual(INSContent.from("bar"))
    })
  })

  describe("concat", () => {
    it("should work", () => {
      const subject = INSContent.from("foo")
      const result = subject.concat(INSContent.from("bar"))

      expect(result).toStrictEqual(INSContent.from("foobar"))
    })

    it("should throw if it or target is meta", () => {
      const rc = INSContent.from("foobar")
      const mc = INSContent.from()
      expect(() => rc.concat(mc)).toThrowError()
      expect(() => mc.concat(rc)).toThrowError()
    })
  })

  describe("fmt", () => {
    it("should work (replace props)", () => {
      const subject = INSContent.from("foobar", {B: true})
      const affected = subject.fmt(
        1,
        new FMTContent(5, Attributes.decode([[5, {I: true}]]))
      )

      expect(JSON.stringify(affected)).toStrictEqual(
        JSON.stringify({
          leaves: [
            {
              length: 5,
              props: {I: true},
            },
          ],
        })
      )
    })
  })

  describe("fmtAt", () => {
    it("should work (merge props)", () => {
      const subject = INSContent.from("foobar", {B: true})
      const affected = subject.fmtAt(1, 5, {I: true}, [1, 1])

      expect(JSON.stringify(affected)).toStrictEqual(
        JSON.stringify({
          leaves: [
            {
              length: 5,
              props: {B: true, I: true},
              stamp: [1, 1],
            },
          ],
        })
      )
    })
  })

  describe("mod", () => {
    describe("meta", () => {
      it("should throw", () => {
        const subject = INSContent.from()
        const target = new MODContent("A")
        expect(() => subject.mod(0, target)).toThrowError()
      })
    })

    describe("string", () => {
      it("should work", () => {
        const subject = INSContent.from("foobar")
        const target = new MODContent("world")

        subject.mod(1, target)

        expect(subject).toStrictEqual(INSContent.from("fworld"))
      })

      it("should throw if the target has too long length", () => {
        const subject = INSContent.from("foobar")
        const target = new MODContent("world")

        expect(() => subject.mod(2, target)).toThrowError()
      })
    })
  })

  describe("encoding", () => {
    it("should work for string", () => {
      const subject = INSContent.from("foobar")
      const serialized = subject.encode()
      const deserialized = INSContent.decode(serialized)

      expect(deserialized).toStrictEqual(subject)
    })

    it("should work for meta", () => {
      const subject = INSContent.from()
      const serialized = subject.encode()
      const deserialized = INSContent.decode(serialized)

      expect(deserialized).toStrictEqual(subject)
    })
  })
})
