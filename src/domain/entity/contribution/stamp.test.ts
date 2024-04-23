import type {Stamp} from "./stamp"

import {checkIfNewerStamp, checkIfNewerOrEqualStamp} from "./stamp"

describe("@entity.contribution.stamp", () => {
  describe("checkIfNewerStamp", () => {
    it("should return true if curr is undefined", () => {
      expect(checkIfNewerStamp(undefined, undefined)).toBe(true)
    })
    it("should return false if other is undefined but curr", () => {
      const curr: Stamp = [0, 0]
      expect(checkIfNewerStamp(curr, undefined)).toBe(false)
    })

    it("should check timestamp before replicaID", () => {
      expect(checkIfNewerStamp([1, 0], [0, 1])).toBe(true)
      expect(checkIfNewerStamp([1, 0], [0, 0])).toBe(false)
    })
  })

  describe("checkIfNewerOrEqualStamp", () => {
    it("should return true if curr is undefined", () => {
      expect(checkIfNewerOrEqualStamp(undefined, undefined)).toBe(true)
    })
    it("should return false if other is undefined but curr", () => {
      const curr: Stamp = [0, 0]
      expect(checkIfNewerOrEqualStamp(curr, undefined)).toBe(false)
    })

    it("should check timestamp before replicaID", () => {
      expect(checkIfNewerOrEqualStamp([1, 0], [0, 1])).toBe(true)
      expect(checkIfNewerOrEqualStamp([1, 0], [0, 0])).toBe(false)
    })
  })
})
