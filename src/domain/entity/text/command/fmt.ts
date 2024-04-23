import type {uint32, FMTSpan, TextNode, FMTDelta} from "@/domain/entity"

import {Order, NewFMTDelta} from "@/domain/entity"

const fmt = (
  textNode: TextNode,
  span: FMTSpan,
  minIndex: uint32
): FMTDelta[] => {
  const curr = textNode.span
  const currMINIndex = minIndex + textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length

  switch (curr.compare(span)) {
    case Order.Less:
    case Order.Prependable: {
      return fmtRight(textNode, span, nextMINIndex)
    }
    case Order.Greater:
    case Order.Appendable: {
      return fmtLeft(textNode, span, minIndex)
    }
    case Order.IncludingLeft:
    case Order.IncludingRight:
    case Order.IncludingMiddle:
    case Order.Equal: {
      const subIndex = span.lowerPoint.nonce - curr.lowerPoint.nonce
      const attributes = textNode.span.content.fmt(subIndex, span.content)

      return [NewFMTDelta(currMINIndex + subIndex, attributes)]
    }
    case Order.RightOverlap: {
      const rightFMTs = fmtRight(textNode, span, nextMINIndex)
      const subIndex = span.lowerPoint.nonce - curr.lowerPoint.nonce
      const content = span.content.slice(
        0,
        curr.upperPoint.nonce - span.lowerPoint.nonce + 1
      )
      const attributes = textNode.span.content.fmt(subIndex, content)

      return [NewFMTDelta(currMINIndex + subIndex, attributes)].concat(
        rightFMTs
      )
    }
    case Order.LeftOverlap: {
      const leftFMTs = fmtLeft(textNode, span, minIndex)
      const content = span.content.slice(
        curr.lowerPoint.nonce - span.lowerPoint.nonce,
        span.content.length
      )
      const attributes = textNode.span.content.fmt(0, content)

      return leftFMTs.concat([NewFMTDelta(currMINIndex, attributes)])
    }
    case Order.IncludedLeft: {
      const rightFMTs = fmtRight(textNode, span, nextMINIndex)
      const content = span.content.slice(0, curr.length)
      const attributes = textNode.span.content.fmt(0, content)

      return [NewFMTDelta(currMINIndex, attributes)].concat(rightFMTs)
    }
    case Order.IncludedRight: {
      const leftFMTs = fmtLeft(textNode, span, minIndex)
      const content = span.content.slice(
        span.length - curr.length,
        span.length
      )
      const attributes = textNode.span.content.fmt(0, content)

      return leftFMTs.concat([NewFMTDelta(currMINIndex, attributes)])
    }
    case Order.IncludedMiddle: {
      const leftFMTs = fmtLeft(textNode, span, minIndex)
      const rightFMTs = fmtRight(textNode, span, nextMINIndex)
      const startIndex = curr.lowerPoint.nonce - span.lowerPoint.nonce
      const content = span.content.slice(startIndex, startIndex + curr.length)
      const attributes = textNode.span.content.fmt(0, content)

      return leftFMTs
        .concat([NewFMTDelta(currMINIndex, attributes)])
        .concat(rightFMTs)
    }
    case Order.Splitting:
    case Order.Splitted:
    default:
      return []
  }
}

const fmtLeft = (
  textNode: TextNode,
  span: FMTSpan,
  minIndex: uint32
): FMTDelta[] => {
  if (!textNode.left) return []

  return fmt(textNode.left, span, minIndex)
}

const fmtRight = (
  textNode: TextNode,
  span: FMTSpan,
  minIndex: uint32
): FMTDelta[] => {
  if (!textNode.right) return []

  return fmt(textNode.right, span, minIndex)
}

export {fmt}
