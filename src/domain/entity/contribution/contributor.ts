import type {uint32} from "@/domain/entity"

import {Point, pointMIN, pointMAX, genPointBetween} from "@/domain/entity"

class Contributor {
  private _replicaID: uint32
  private _blockNonce: uint32 // last seq

  constructor(replicaID: uint32, blockNonce: uint32) {
    this._replicaID = replicaID
    this._blockNonce = blockNonce
  }

  get replicaID(): uint32 {
    return this._replicaID
  }

  get blockNonce(): uint32 {
    return this._blockNonce
  }

  blockPointBetween(lower: Point = pointMIN, upper: Point = pointMAX) {
    const point = genPointBetween(
      this._replicaID,
      this._blockNonce,
      lower,
      upper
    )
    this._blockNonce += 1
    return point
  }
}

export {Contributor}
