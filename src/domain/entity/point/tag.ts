import type {uint32, BasicOrder} from "@/domain/entity"

import {Order, uint32MIN, uint32MAX, compare} from "@/domain/entity"

class Tag {
  readonly priority: uint32
  readonly replicaID: uint32
  readonly nonce: uint32

  constructor(priority: uint32, replicaID: uint32, nonce: uint32) {
    this.priority = priority
    this.replicaID = replicaID
    this.nonce = nonce
  }

  clone(): Tag {
    return new Tag(this.priority, this.replicaID, this.nonce)
  }

  withNonce(nonce: uint32): Tag {
    if (nonce < uint32MIN || nonce > uint32MAX) {
      throw new Error("invalid-nonce")
    }
    return new Tag(this.priority, this.replicaID, nonce)
  }

  offset(offset: uint32): Tag {
    const nonce = this.nonce + offset
    if (nonce < uint32MIN || nonce > uint32MAX) {
      throw new Error("invalid-offset")
    }
    return new Tag(this.priority, this.replicaID, nonce)
  }

  compareBase(other: Tag): BasicOrder {
    const result = compare(this.priority, other.priority)

    if (result === Order.Equal) {
      return compare(this.replicaID, other.replicaID)
    } else {
      return result
    }
  }

  compare(other: Tag): BasicOrder {
    const result = this.compareBase(other)

    if (result === Order.Equal) {
      return compare(this.nonce, other.nonce)
    } else {
      return result
    }
  }

  encode(): Data {
    return [this.priority, this.replicaID, this.nonce]
  }

  static decode(data: Data): Tag {
    return new Tag(data[0], data[1], data[2])
  }
}

export type Data = [priority: uint32, replicaID: uint32, nonce: uint32];

export {Tag}
