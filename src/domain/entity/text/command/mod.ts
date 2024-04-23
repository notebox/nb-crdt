import type {uint32, TextNode, MODSpan, MODDelta} from "@/domain/entity"

import {Order, NewMODDelta} from "@/domain/entity"

const mod = (
  textNode: TextNode,
  span: MODSpan,
  minIndex: uint32
): MODDelta[] => {
  const curr = textNode.span
  const currMINIndex = minIndex + textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length

  switch (curr.compare(span)) {
    case Order.Less:
    case Order.Prependable: {
      return modRight(textNode, span, nextMINIndex)
    }
    case Order.Greater:
    case Order.Appendable: {
      return modLeft(textNode, span, minIndex)
    }
    case Order.IncludingLeft:
    case Order.IncludingRight:
    case Order.IncludingMiddle:
    case Order.Equal: {
      const subIndex = span.lowerPoint.nonce - curr.lowerPoint.nonce
      textNode.span.content.mod(subIndex, span.content)

      return [NewMODDelta(currMINIndex + subIndex, span.content.text)]
    }
    case Order.RightOverlap: {
      const rightMODs = modRight(textNode, span, nextMINIndex)
      const subIndex = span.lowerPoint.nonce - curr.lowerPoint.nonce
      const content = span.content.slice(
        0,
        curr.upperPoint.nonce - span.lowerPoint.nonce + 1
      )
      textNode.span.content.mod(subIndex, content)

      return [NewMODDelta(currMINIndex + subIndex, content.text)].concat(
        rightMODs
      )
    }
    case Order.LeftOverlap: {
      const leftMODs = modLeft(textNode, span, minIndex)
      const content = span.content.slice(
        curr.lowerPoint.nonce - span.lowerPoint.nonce,
        span.content.length
      )
      textNode.span.content.mod(0, content)

      return leftMODs.concat([NewMODDelta(currMINIndex, content.text)])
    }
    case Order.IncludedLeft: {
      const rightMODs = modRight(textNode, span, nextMINIndex)
      const content = span.content.slice(0, curr.length)
      textNode.span.content.mod(0, content)

      return [NewMODDelta(currMINIndex, content.text)].concat(rightMODs)
    }
    case Order.IncludedRight: {
      const leftMODs = modLeft(textNode, span, minIndex)
      const content = span.content.slice(
        span.length - curr.length,
        span.length
      )
      textNode.span.content.mod(0, content)
      return leftMODs.concat([NewMODDelta(currMINIndex, content.text)])
    }
    case Order.IncludedMiddle: {
      const leftMODs = modLeft(textNode, span, minIndex)
      const rightMODs = modRight(textNode, span, nextMINIndex)
      const startIndex = curr.lowerPoint.nonce - span.lowerPoint.nonce
      const content = span.content.slice(startIndex, startIndex + curr.length)
      textNode.span.content.mod(0, content)
      return leftMODs
        .concat([NewMODDelta(currMINIndex, content.text)])
        .concat(rightMODs)
    }
    case Order.Splitting:
    case Order.Splitted:
    default:
      return []
  }
}

const modLeft = (
  textNode: TextNode,
  span: MODSpan,
  minIndex: uint32
): MODDelta[] => {
  if (!textNode.left) return []

  return mod(textNode.left, span, minIndex)
}

const modRight = (
  textNode: TextNode,
  span: MODSpan,
  minIndex: uint32
): MODDelta[] => {
  if (!textNode.right) return []

  return mod(textNode.right, span, minIndex)
}

export {mod}
