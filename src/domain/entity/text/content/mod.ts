import type {uint32} from "@/domain/entity"
import type {AbstractContent, UTF16} from "."

class MODContent implements AbstractContent {
  readonly text: UTF16

  constructor(data: UTF16) {
    this.text = data
  }

  get length(): uint32 {
    return this.text.length
  }

  /**
   * @remark
   * This method is only for the text-only content.
   *
   * @param start is the utf-16 index which will be included.
   * @param end is the utf-16 index which will be excluded.
   * @returns new MODContent.
   */
  slice(start: uint32, end: uint32): MODContent {
    const text = this.text!.slice(start, end)
    return new MODContent(text)
  }

  /**
   * @remark
   * This method is only for the text-only content.
   *
   * @returns new MODContent.
   */
  concat(other: MODContent): MODContent {
    const text = this.text!.concat(other.text!)
    return new MODContent(text)
  }

  encode(): Data {
    return this.text
  }

  static decode(data: Data): MODContent {
    return new MODContent(data)
  }
}

export type Data = string;

export {MODContent}
