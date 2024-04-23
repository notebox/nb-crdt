import {Order, BasicOrder} from "./order"

/**
 * @warning
 * uint32 is just a flag. It doesn't guarantee anything.
 * uint32 is only validated by below.
 * - Tag: withNonce, offset
 */
export type uint32 = number;

export const uint32MIN = 0
export const uint32MID = 2147483647
export const uint32MAX = 4294967295

export const compare = (a: uint32, b: uint32): BasicOrder => {
  return a < b ? Order.Less : a === b ? Order.Equal : Order.Greater
}

export const validate = (a: uint32): boolean => {
  return !(a < uint32MIN || a > uint32MAX)
}

export const validated = (num: uint32): uint32 => {
  if (!validate(num)) throw new Error("invalid-uint32")
  return num
}
