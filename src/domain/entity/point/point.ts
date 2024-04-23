import type {uint32, BasicOrder, PointOrder} from "@/domain/entity"
import type {Data as TagData} from "./tag"

import {Order, uint32MIN, uint32MID, uint32MAX, compare} from "@/domain/entity"
import {Tag} from "./tag"

class Point {
  readonly tags: Tag[]

  constructor(tags: Tag[]) {
    this.tags = tags
  }

  private get lastTag(): Tag {
    return this.tags[this.tags.length - 1]
  }

  get identifier(): Identifier {
    return `${this.replicaID}-${this.nonce}` as Identifier
  }

  get replicaID(): uint32 {
    return this.lastTag.replicaID
  }

  get nonce(): uint32 {
    return this.lastTag.nonce
  }

  clone(): Point {
    return new Point(this.tags.map(tag => tag.clone()))
  }

  withNonce(nonce: uint32): Point {
    const point = this.clone()
    point.tags[point.tags.length - 1] = point.lastTag.withNonce(nonce)
    return point
  }

  offset(offset: uint32): Point {
    const point = this.clone()
    point.tags[point.tags.length - 1] = point.lastTag.offset(offset)
    return point
  }

  equals(other: Point): boolean {
    return this.replicaID === other.replicaID && this.nonce === other.nonce
  }

  compare(other: Point): BasicOrder {
    if (this.equals(other)) return Order.Equal

    const thisDepth = this.tags.length
    const otherDepth = other.tags.length
    const commonDepth = Math.min(thisDepth, otherDepth)

    for (let i = 0; i < commonDepth; i++) {
      const comp = this.tags[i].compare(other.tags[i])
      if (comp === Order.Equal) continue
      return comp
    }

    return thisDepth < otherDepth ? Order.Less : Order.Greater
  }

  compareBase(other: Point): PointOrder {
    if (this.equals(other)) return Order.Equal

    const thisDepth = this.tags.length
    const otherDepth = other.tags.length
    const commonBaseDepth = Math.min(thisDepth, otherDepth) - 1

    let i = 0
    let baseComp = Order.Equal
    while (i < commonBaseDepth) {
      baseComp = this.tags[i].compare(other.tags[i])
      i++
    }

    if (baseComp === Order.Equal) {
      baseComp = this.tags[commonBaseDepth].compareBase(
        other.tags[commonBaseDepth]
      )
    }

    if (baseComp !== Order.Equal) {
      return baseComp
    }

    return thisDepth > otherDepth
      ? Order.Tagging
      : thisDepth === otherDepth
      ? Order.Equal
      : Order.Tagged
  }

  distanceFrom(other: Point): [distance: uint32, order: BasicOrder] {
    const baseComp = this.compareBase(other)

    if (baseComp === Order.Less || baseComp === Order.Greater) {
      throw new Error("invalid-distance-between-no-relation")
    }

    const commonBaseDepth = Math.min(this.tags.length, other.tags.length) - 1
    const thisNonce = this.tags[commonBaseDepth].nonce
    const otherNonce = other.tags[commonBaseDepth].nonce

    const order = compare(thisNonce, otherNonce)
    const distance =
      order === Order.Less ? otherNonce - thisNonce : thisNonce - otherNonce

    return [distance, order]
  }

  encode(): Data {
    return this.tags.map(tag => tag.encode())
  }

  static decode(data: Data): Point {
    const tags = data.map(tuple => new Tag(...tuple))
    return new Point(tags)
  }
}

const tagMIN = new Tag(uint32MIN, 0, 1)
const tagMID = new Tag(uint32MID, 0, 3)
const tagMAX = new Tag(uint32MAX, 0, 2)
const pointMIN = new Point([tagMIN])
const pointMID = new Point([tagMID])
const pointMAX = new Point([tagMAX])

/** @description `${replicaID}-${nonce}` */
export type Identifier = `${uint32}-${uint32}`;
export type Data = TagData[];

export {Point, pointMIN, pointMID, pointMAX, Tag, tagMIN, tagMID, tagMAX}
