import type {uint32} from "@/domain/entity"

import {
  uint32MAX,
  Point,
  pointMIN,
  pointMAX,
  Tag,
  tagMIN,
  tagMAX,
} from "@/domain/entity"

export const genPointBetween = (
  replicaID: uint32,
  nonce: uint32,
  lower: Point = pointMIN,
  upper: Point = pointMAX,
  isNotAppendable: boolean = false
): Point => {
  if (!isNotAppendable && isAppendable(replicaID, nonce, lower)) {
    return lower.offset(1)
  }

  const tags = []
  let i = 0
  let tagL = lower.tags[i]
  let tagU = upper.tags[i]
  while (tagU.priority - tagL.priority < 2) {
    // if there is no space at priority
    if (tagL.replicaID === tagU.replicaID) {
      // split
      tags.push(tagL)
    } else {
      // As max nonce means the available end of base
      tags.push(tagL.withNonce(uint32MAX))
    }
    i++
    tagL = lower.tags[i] || tagMIN
    tagU = upper.tags[i] || tagMAX
  }
  const priority = getMIDBetweenGappedPoints(tagL.priority, tagU.priority)
  tags.push(new Tag(priority, replicaID, nonce + 1))

  return new Point(tags)
}

const isAppendable = (
  replicaID: uint32,
  nonce: uint32,
  point: Point
): boolean => {
  return point.replicaID === replicaID && point.nonce === nonce
}

const getMIDBetweenGappedPoints = (a: uint32, b: uint32): uint32 =>
  Math.floor((b - a) / 2) + a
