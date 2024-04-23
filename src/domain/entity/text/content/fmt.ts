import type {uint32} from "@/domain/entity"
import type {AbstractContent} from "."

import {validated} from "@/domain/entity"
import {Attributes, AttributesData} from "./attributes"

class FMTContent implements AbstractContent {
  readonly length: uint32
  readonly attributes: Attributes

  constructor(length: uint32, attributes: Attributes) {
    this.length = length
    this.attributes = attributes
  }

  /**
   * @warning
   * Arguments should be validated by yourself. [0, this.length] && start < end
   *
   * @param start is the utf-16 index which will be included.
   * @param end is the utf-16 index which will be excluded.
   * @returns new FMTContent.
   */
  slice(start: uint32, end: uint32): FMTContent {
    return new FMTContent(
      validated(end - start),
      this.attributes.slice(start, end)
    )
  }

  /**
   * @returns new FMTContent
   */
  concat(other: FMTContent): FMTContent {
    return new FMTContent(
      validated(this.length + other.length),
      this.attributes.concat(other.attributes)
    )
  }

  encode(): Data {
    return [this.length, this.attributes.encode()]
  }

  static decode(data: Data): FMTContent {
    return new FMTContent(data[0], Attributes.decode(data[1]))
  }
}

export type Data = [length: uint32, attributes: AttributesData];

export {FMTContent}
