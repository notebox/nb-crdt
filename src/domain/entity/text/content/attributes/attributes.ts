import type {uint32, Stamp, TextPropsDelta} from "@/domain/entity"
import type {Data as LeafData} from "./leaf"

import {checkIfNewerStamp} from "@/domain/entity"
import {Leaf} from "./leaf"

class Attributes {
  leaves: Leaf[]

  constructor(leaves: Leaf[]) {
    this.leaves = leaves
  }

  /**
   * @returns new Attributes.
   */
  concat(other: Attributes, withoutStamp = false): Attributes {
    const boundaryIndex = this.leaves.length
    const leaves = this.leaves
      .concat(other.leaves)
      .map(leaf => leaf.clone(withoutStamp))

    const a = leaves[boundaryIndex - 1]
    const b = leaves[boundaryIndex]
    if (a && b && a.equalsExceptForLength(b)) {
      a.length = a.length + b.length
      leaves.splice(boundaryIndex, 1)
    }

    return new Attributes(leaves)
  }

  /**
   * @param start is the utf-16 index which will be included.
   * @param end is the utf-16 index which will be excluded.
   * @returns new Attributes.
   */
  slice(start: uint32, end: uint32): Attributes {
    if (end - start < 1) return Attributes.decode([])
    const leaves = this.leaves.map(leaf => leaf.clone())
    let nextIndex = leaves[0].length

    while (nextIndex <= start) {
      leaves.shift()
      nextIndex += leaves[0].length
    }
    leaves[0].length = nextIndex - start

    let index = 0
    while (nextIndex < end) {
      index++
      nextIndex += leaves[index].length
    }

    if (nextIndex > end) {
      leaves[index].length -= nextIndex - end
    }

    return new Attributes(leaves.slice(0, index + 1))
  }

  /**
   * @remark
   * This method replaces current attributes with the applied one.
   */
  apply(props: TextPropsDelta, stamp: Stamp): void {
    this.leaves = this.leaves.reduce((acc: Leaf[], cur: Leaf) => {
      cur.apply(props, stamp)
      if (acc.length < 1) return acc.concat(cur)

      const last = acc[acc.length - 1]
      if (last.equalsExceptForLength(cur)) {
        last.length += cur.length
        return acc
      }

      return acc.concat(cur)
    }, [])
  }

  /**
   * @remark
   * This method replaces current attributes with the merged one.
   * @warning
   * The length of the other should be equal to this.
   */
  merge(other: Attributes): void {
    const newEls = []
    let idx = 0
    let otherIDX = 0
    let leaf = this.leaves[idx]
    let otherEl = other.leaves[otherIDX]
    let elLength = leaf.length
    let otherElLength = otherEl.length

    while (elLength > 0) {
      let props
      let stamp
      let length

      if (checkIfNewerStamp(leaf.stamp, otherEl.stamp)) {
        props = otherEl.props
        stamp = otherEl.stamp
      } else {
        props = leaf.props
        stamp = leaf.stamp
      }

      if (elLength < otherElLength) {
        length = elLength
      } else {
        length = otherElLength
      }

      const newEl = new Leaf(length, props, stamp)
      const lastNewEl: Leaf = newEls[newEls.length - 1]
      if (lastNewEl && lastNewEl.equalsExceptForLength(newEl)) {
        lastNewEl.length += newEl.length
      } else {
        newEls.push(newEl)
      }

      elLength -= length
      otherElLength -= length

      if (elLength < 1) {
        idx += 1
        leaf = this.leaves[idx]
        elLength = leaf && leaf.length
      }

      if (otherElLength < 1) {
        otherIDX += 1
        otherEl = other.leaves[otherIDX]
        otherElLength = otherEl && otherEl.length
      }
    }

    this.leaves = newEls
  }

  clone(): Attributes {
    return new Attributes(this.leaves.map(leaf => leaf.clone()))
  }

  encode(): Data {
    return this.leaves.map(leaf => leaf.encode())
  }

  static decode(data: Data): Attributes {
    return new Attributes(data.map(elData => new Leaf(...elData)))
  }
}

export type Data = LeafData[];

export {Attributes}
