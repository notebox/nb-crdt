import {MODContent} from "./mod"

describe("@entity.content.mod", () => {
  describe("getters", () => {
    it("should work", () => {
      const text = "foobar👍🏿"
      const subject = new MODContent(text)
      expect(subject.length).toBe(text.length)
      expect(subject.encode()).toStrictEqual(text)
    })
  })

  describe("slice", () => {
    it("should work", () => {
      const subject = new MODContent("foobar")
      const result = subject.slice(1, 4)

      expect(result).toStrictEqual(new MODContent("oob"))
    })
  })

  describe("concat", () => {
    it("should work", () => {
      const subject = new MODContent("foo")
      const result = subject.concat(new MODContent("bar"))

      expect(result).toStrictEqual(new MODContent("foobar"))
    })
  })

  describe("encoding", () => {
    it("should work", () => {
      const subject = new MODContent("foobar")
      const serialized = subject.encode()
      const deserialized = MODContent.decode(serialized)

      expect(deserialized).toStrictEqual(subject)
    })
  })
})
