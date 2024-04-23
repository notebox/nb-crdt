import {Attributes, Data} from "./attributes"

describe("@entity.content.attributes", () => {
  describe("concat", () => {
    it("should work", () => {
      const subject = Attributes.decode([[1, {I: true, B: true}, [3, 3]]])
      const target = Attributes.decode([[2, {B: true, S: true}, [3, 3]]])
      const concatenated = subject.concat(target)

      expect(concatenated).toStrictEqual(
        Attributes.decode([
          [1, {I: true, B: true}, [3, 3]],
          [2, {B: true, S: true}, [3, 3]],
        ])
      )
    })

    it("should merge if boundaries have same props and stamp", () => {
      const subject = Attributes.decode([[1], [1, {I: true, B: true}, [3, 3]]])
      const target = Attributes.decode([[2, {I: true, B: true}, [3, 3]], [1]])
      const concatenated = subject.concat(target)

      expect(concatenated).toStrictEqual(
        Attributes.decode([[1], [3, {I: true, B: true}, [3, 3]], [1]])
      )
    })
  })

  describe("slice", () => {
    it("should work", () => {
      const subject = Attributes.decode([[1], [1, {I: true, B: true}, [3, 3]]])
      const sliced = subject.slice(1, 2)

      expect(sliced).toStrictEqual(
        Attributes.decode([[1, {I: true, B: true}, [3, 3]]])
      )
    })

    it("should work with slicing in the middle cases", () => {
      const subject = Attributes.decode([
        [1],
        [2, {I: true, B: true}, [3, 3]],
        [3, {S: true, U: true}, [3, 3]],
        [4, {CODE: true}, [3, 3]],
      ])
      const sliced = subject.slice(2, 7)

      expect(sliced).toStrictEqual(
        Attributes.decode([
          [1, {I: true, B: true}, [3, 3]],
          [3, {S: true, U: true}, [3, 3]],
          [1, {CODE: true}, [3, 3]],
        ])
      )
    })

    it("should return empty leaves if length is less than 1", () => {
      const subject = Attributes.decode([[3]])
      const sliced = subject.slice(1, 1)
      expect(sliced).toStrictEqual(Attributes.decode([]))
    })
  })

  describe("apply", () => {
    it("should work", () => {
      const subject = Attributes.decode([
        [2, {I: true}],
        [2, undefined, [1, 1]],
        [2, {B: true}, [1, 1]],
        [2, {S: true}, [1, 1]],
        [2, {CODE: true}, [3, 3]],
      ])
      subject.apply({B: true}, [2, 2])
      expect(subject).toStrictEqual(
        Attributes.decode([
          [2, {I: true, B: true}, [2, 2]],
          [4, {B: true}, [2, 2]],
          [2, {S: true, B: true}, [2, 2]],
          [2, {B: true, CODE: true}, [2, 2]],
        ])
      )
    })
  })

  describe("merge", () => {
    it("should work for multiple to single leaves", () => {
      const subject = Attributes.decode([
        [2, {I: true}],
        [2, undefined, [1, 1]],
        [2, {B: true}, [1, 1]],
        [2, {S: true}, [1, 1]],
        [2, {CODE: true}, [3, 3]],
      ])
      const other = Attributes.decode([[10, {B: true}, [2, 2]]])
      subject.merge(other)
      expect(subject).toStrictEqual(
        Attributes.decode([
          [8, {B: true}, [2, 2]],
          [2, {CODE: true}, [3, 3]],
        ])
      )
    })

    it("should work for single to multiple leaves", () => {
      const subject = Attributes.decode([[10, {B: true}]])
      const other = Attributes.decode([
        [2, {I: true}, [1, 1]],
        [2, undefined, [1, 1]],
        [2, {B: true}, [1, 1]],
        [2, {S: true}, [1, 1]],
        [2, {CODE: true}, [3, 3]],
      ])
      subject.merge(other)
      expect(subject).toStrictEqual(
        Attributes.decode([
          [2, {I: true}, [1, 1]],
          [2, undefined, [1, 1]],
          [2, {B: true}, [1, 1]],
          [2, {S: true}, [1, 1]],
          [2, {CODE: true}, [3, 3]],
        ])
      )
    })
  })

  describe("encoding", () => {
    it("should work", () => {
      const serialized: Data = [
        [1, {I: true}, [3, 5]],
        [7, undefined, [9, 1]],
        [3, {B: true, S: true}],
      ]
      const deserialized = Attributes.decode(serialized)

      expect(deserialized.encode()).toStrictEqual(serialized)
    })
  })
})
