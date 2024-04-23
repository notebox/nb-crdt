import type {uint32, Stamp, TextProps, TextPropsDelta} from "@/domain/entity"
import type {AbstractContent, FMTContent, MODContent} from "."
import type {AttributesData} from "./attributes"

import {Attributes} from "./attributes"

class INSContent implements AbstractContent {
  attributes: Attributes
  text?: UTF16

  constructor(attributes: Attributes, data?: UTF16) {
    this.text = data
    this.attributes = attributes
  }

  get length(): uint32 {
    return this.text == null ? 1 : this.text.length
  }

  isMeta(): this is INSMetaContent {
    return this.text == null
  }

  /**
   * @remark
   * This method is only for the text-only content.
   *
   * @param start is the utf-16 index which will be included.
   * @param end is the utf-16 index which will be excluded.
   * @returns new INSContent.
   */
  slice(start: uint32, end: uint32 = this.length): INSContent {
    if (this.isMeta()) throw new Error("no-split-meta-content")

    const text = this.text!.slice(start, end)
    const attributes = this.attributes.slice(start, end)
    return new INSContent(attributes, text)
  }

  /**
   * @remark
   * This method is only for the text-only content.
   *
   * @returns new INSContent.
   */
  concat(other: INSContent, withoutStamp = false): INSContent {
    if (this.isMeta() || other.isMeta())
      throw new Error("no-concat-meta-content")

    const text = this.text!.concat(other.text!)
    const attributes = this.attributes.concat(other.attributes, withoutStamp)
    return new INSContent(attributes, text)
  }

  /**
   * This replaces or do nothing target props by stamp.
   * @returns affected attributes.
   */
  fmt(index: uint32, other: FMTContent): Attributes {
    const curr = this.attributes
    const left = curr.slice(0, index)
    const affected = curr.slice(index, index + other.length)
    const right = curr.slice(index + other.length, this.length)

    affected.merge(other.attributes)
    this.attributes = left.concat(affected).concat(right)

    return affected
  }

  /**
   * This applies target props.
   * @returns affected attributes.
   */
  fmtAt(
    index: uint32,
    length: uint32,
    props: TextPropsDelta,
    stamp: Stamp
  ): Attributes {
    const curr = this.attributes
    const left = curr.slice(0, index)
    const affected = curr.slice(index, index + length)
    const right = curr.slice(index + length, this.length)

    affected.apply(props, stamp)
    this.attributes = left.concat(affected).concat(right)

    return affected
  }

  /**
   * @remark
   * This method replaces current text in the index with other text.
   */
  mod(index: uint32, other: MODContent): void {
    if (this.isMeta()) throw new Error("no-updatable")

    const curr = this.text!
    const left = curr.slice(0, index)
    const right = curr.slice(index + other.length, this.length)
    if (curr.length - left.length - right.length !== other.length)
      throw new Error("no-updatable")

    this.text = left.concat(other.text!).concat(right)
  }

  toTextWithMetaPlaceholder(): string {
    return this.text || " "
  }

  clone(): INSContent {
    return new INSContent(this.attributes.clone(), this.text)
  }

  encode(): Data {
    return this.isMeta()
      ? [this.attributes.encode()]
      : [this.attributes.encode(), this.text]
  }

  static decode(data: Data): INSContent {
    return new INSContent(Attributes.decode(data[0]), data[1])
  }

  static from(text?: string, props?: TextProps, stamp?: Stamp): INSContent {
    return new INSContent(
      Attributes.decode([[text?.length || 1, props, stamp]]),
      text
    )
  }
}

export type UTF16 = string;
export type Data = [attributes: AttributesData, text?: string];
export type INSMetaContent = INSContent & {text: string};

export {INSContent}
