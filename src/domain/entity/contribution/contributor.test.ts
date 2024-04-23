import {Point} from "@/domain/entity"
import {Contributor} from "./contributor"

describe("@entity.contribution.contributor", () => {
  let subject!: Contributor

  beforeEach(() => {
    subject = new Contributor(5, 3)
  })

  it("getter", () => {
    expect(subject.replicaID).toBe(5)
    expect(subject.blockNonce).toBe(3)
  })

  describe("blockPointBetween", () => {
    it("should work", () => {
      const result = subject.blockPointBetween(
        Point.decode([[2, 4, 6]]),
        Point.decode([[7, 9, 11]])
      )
      expect(result.encode()).toStrictEqual([[4, 5, 4]])
    })

    it("should increase blockNonce by 1", () => {
      const before = subject.blockNonce
      subject.blockPointBetween()
      expect(subject.blockNonce).toBe(before + 1)
    })

    it("should set pointMIN to undefined lower by default", () => {
      const result = subject.blockPointBetween(
        undefined,
        Point.decode([[7, 9, 11]])
      )
      expect(result.encode()).toStrictEqual([[3, 5, 4]])
    })

    it("should set pointMAX to undefined upper by default", () => {
      const result = subject.blockPointBetween(Point.decode([[7, 9, 11]]))
      expect(result.encode()).toStrictEqual([[2147483651, 5, 4]])
    })
  })
})
