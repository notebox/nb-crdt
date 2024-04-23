import type {TextPropsDelta} from "@/domain/entity"

import {Leaf, Data} from "./leaf"

describe("@entity.content.attributes.leaf", () => {
  describe("clone", () => {
    it("should work", () => {
      const subject = Leaf.decode([1, {U: true, S: true}, [3, 3]])
      const cloned = subject.clone()

      expect(subject === cloned).toBeFalsy()
      expect(subject).toStrictEqual(cloned)
    })

    it("should not be referenced", () => {
      const subject = Leaf.decode([1, {U: true, S: true}, [3, 3]])
      const cloned = subject.clone();

      (cloned.props! as TextPropsDelta).U = null
      cloned.stamp![0] = 5
      cloned.stamp![1] = 5
      expect(subject.props!.U).toBe(true)
      expect(subject.stamp![0]).toBe(3)
      expect(subject.stamp![1]).toBe(3)
    })

    it("should work with empty properties", () => {
      const subject = Leaf.decode([1])
      const cloned = subject.clone()

      expect(subject === cloned).toBeFalsy()
      expect(subject).toStrictEqual(cloned)
    })
  })

  describe("equalsExceptForLength", () => {
    it("should work", () => {
      equalsFalsyTestTable.forEach(table => {
        expect(
          Leaf.decode(table[0]).equalsExceptForLength(Leaf.decode(table[1]))
        ).toBeFalsy()
      })
      equalsTruthyTestTable.forEach(table => {
        expect(
          Leaf.decode(table[0]).equalsExceptForLength(Leaf.decode(table[1]))
        ).toBeTruthy()
      })
    })
  })

  describe("apply", () => {
    it("should work", () => {
      const subject = Leaf.decode([1, {U: true, S: true}, [3, 3]])

      subject.apply({B: true, S: null}, [5, 5])

      expect(subject).toStrictEqual(
        Leaf.decode([1, {B: true, U: true}, [5, 5]])
      )
    })

    it("should work with empty props", () => {
      const subject = Leaf.decode([1])

      subject.apply({B: true}, [5, 5])

      expect(subject).toStrictEqual(Leaf.decode([1, {B: true}, [5, 5]]))
    })

    it("should delete props if the updated props is empty", () => {
      const subject = Leaf.decode([1, {B: true}])

      subject.apply({B: null}, [5, 5])

      expect(subject).toStrictEqual(Leaf.decode([1, undefined, [5, 5]]))
    })
  })
})

const equalsFalsyTestTable: [Data, Data][] = [
  // stamp
  [
    [1, {I: true, B: true}, [3, 3]],
    [1, {I: true, B: true}, [1, 3]],
  ],
  [
    [1, {I: true, B: true}, [3, 3]],
    [1, {I: true, B: true}, [3, 1]],
  ],
  [
    [1, {I: true, B: true}, [3, 3]],
    [1, {I: true, B: true}],
  ],
  // props
  [
    [1, {I: true, B: true}, [3, 3]],
    [1, {S: true, B: true}, [3, 3]],
  ],
  [
    [1, {I: true, B: true}, [3, 3]],
    [1, {I: true, U: true}, [3, 3]],
  ],
  [
    [1, {I: true, B: true}, [3, 3]],
    [1, {I: true}, [3, 3]],
  ],
  [
    [1, {I: true, B: true}, [3, 3]],
    [1, undefined, [3, 3]],
  ],
]

const equalsTruthyTestTable: [Data, Data][] = [
  [
    [1, {I: true, B: true}, [3, 3]],
    [2, {I: true, B: true}, [3, 3]],
  ],
  [
    [1, undefined, [3, 3]],
    [2, undefined, [3, 3]],
  ],
  [
    [1, {I: true, B: true}],
    [2, {I: true, B: true}],
  ],
  [[1], [2]],
]
