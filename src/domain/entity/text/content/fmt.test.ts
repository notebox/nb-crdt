import {FMTContent} from "./fmt"
import {Attributes} from "./attributes"

describe("@entity.content.fmt", () => {
  it("slice", () => {
    const subject = new FMTContent(5, Attributes.decode([[5]]))
    expect(subject.slice(1, 4)).toStrictEqual(
      new FMTContent(3, Attributes.decode([[3]]))
    )
  })

  it("concat", () => {
    const subject = new FMTContent(5, Attributes.decode([[5]]))
    const target = new FMTContent(9, Attributes.decode([[9]]))
    expect(subject.concat(target)).toStrictEqual(
      new FMTContent(14, Attributes.decode([[14]]))
    )
  })

  describe("encoding", () => {
    it("should work", () => {
      const subject = new FMTContent(5, Attributes.decode([[5]]))
      const serialized = subject.encode()
      const deserialized = FMTContent.decode(serialized)

      expect(deserialized).toStrictEqual(subject)
    })
  })
})
