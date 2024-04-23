import type {uint32, TextProps, TextPropsDelta, Stamp} from "@/domain/entity"

class Leaf {
  length: uint32
  props?: TextProps
  stamp?: Stamp

  /**
   * @param length must be a length in utf-16 (unicode code point).
   */
  constructor(length: uint32, props?: TextProps, stamp?: Stamp) {
    this.length = length
    this.props = props
    this.stamp = stamp
  }

  clone(withoutStamp = false): Leaf {
    return new Leaf(
      this.length,
      this.props && Object.assign({}, this.props),
      withoutStamp ? undefined : this.stamp && [this.stamp[0], this.stamp[1]]
    )
  }

  equalsExceptForLength(other: Leaf): boolean {
    if (!this.props !== !other.props) return false
    if (!this.stamp !== !other.stamp) return false
    if (!!this.stamp && !ifStampsAreEqual(this.stamp, other.stamp!))
      return false
    if (!this.props) return true

    const thisKeys = propKeys(this.props)
    const otherKeys = propKeys(other.props!)

    if (thisKeys.length !== otherKeys.length) return false

    return otherKeys.every(key => this.props![key] === other.props![key])
  }

  /**
   * @param props deletes key if the value is null.
   * @param stamp is always updated.
   */
  apply(props: TextPropsDelta, stamp: Stamp): void {
    const newTextProps = this.props || {}

    propKeys(props).forEach(key => {
      if (props[key] === null) {
        delete newTextProps[key]
      } else {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (newTextProps as any)[key] = props[key]
      }
    })

    this.props =
      Object.keys(newTextProps).length < 1 ? undefined : newTextProps
    this.stamp = stamp
  }

  encode(): Data {
    return this.stamp
      ? [this.length, this.props, this.stamp]
      : this.props
      ? [this.length, this.props]
      : [this.length]
  }

  static decode(data: Data): Leaf {
    return new Leaf(...data)
  }
}

const ifStampsAreEqual = (a: Stamp, b: Stamp): boolean => {
  return a[0] === b[0] && a[1] === b[1]
}

const propKeys = (props: TextProps | TextPropsDelta) => {
  return Object.keys(props) as (keyof TextProps)[]
}

export type Data = [length: uint32, props?: TextProps, stamp?: Stamp];

export {Leaf}
