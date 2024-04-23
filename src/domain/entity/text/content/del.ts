import type {uint32} from "@/domain/entity"
import type {AbstractContent} from "."

import {validated} from "@/domain/entity"
class DELContent implements AbstractContent {
  readonly length: uint32

  constructor(length: uint32) {
    this.length = length
  }

  /**
   * @warning
   * Arguments should be validated by yourself. [0, this.length] && start < end
   *
   * @param start is the utf-16 index which will be included.
   * @param end is the utf-16 index which will be excluded.
   * @returns new DELContent.
   */
  slice(start: uint32, end: uint32): DELContent {
    return new DELContent(validated(end - start))
  }

  /**
   * @returns new DELContent
   */
  concat(other: DELContent): DELContent {
    return new DELContent(validated(this.length + other.length))
  }

  encode(): uint32 {
    return this.length
  }

  static decode(data: uint32): DELContent {
    return new DELContent(data)
  }
}

export type Data = uint32;

export {DELContent}
