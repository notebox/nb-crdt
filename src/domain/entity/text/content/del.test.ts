import {DELContent} from "./del"

describe("@entity.content.del", () => {
  it("slice", () => {
    const subject = new DELContent(5)
    expect(subject.slice(1, 4)).toStrictEqual(new DELContent(3))
  })

  it("concat", () => {
    const subject = new DELContent(5)
    const target = new DELContent(9)
    expect(subject.concat(target)).toStrictEqual(new DELContent(14))
  })

  describe("encoding", () => {
    it("should work", () => {
      const subject = new DELContent(5)
      const serialized = subject.encode()
      const deserialized = DELContent.decode(serialized)

      expect(deserialized).toStrictEqual(subject)
    })
  })
})
