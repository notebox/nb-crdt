import type {
  uint32,
  Point,
  TextNode,
  MODContent,
  MODSpan,
} from "@/domain/entity"

import {Order, ClosedRange, Span} from "@/domain/entity"

const modAt = (
  textNode: TextNode,
  range: ClosedRange,
  content: MODContent,
  minIndex: uint32
): MODSpan[] => {
  const curr = textNode.span
  const currMINIndex = minIndex + textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length
  const currRange = new ClosedRange(currMINIndex, curr.length)

  switch (currRange.compare(range)) {
    case Order.Less:
    case Order.Prependable:
      return modAtRight(textNode, range, content, nextMINIndex)
    case Order.Greater:
    case Order.Appendable:
      return modAtLeft(textNode, range, content, minIndex)
    case Order.IncludingLeft:
    case Order.IncludingRight:
    case Order.IncludingMiddle:
    case Order.Equal: {
      const subIndex = range.lower - currRange.lower
      textNode.span.content.mod(subIndex, content)

      return [toMODSpan(textNode.span.lowerPoint.offset(subIndex), content)]
    }
    case Order.RightOverlap: {
      const rightMODSpans = modAtRight(textNode, range, content, nextMINIndex)
      const subIndex = range.lower - currRange.lower
      const leftContents = content.slice(0, currRange.upper - range.lower + 1)
      textNode.span.content.mod(subIndex, leftContents)

      return [
        toMODSpan(textNode.span.lowerPoint.offset(subIndex), leftContents),
      ].concat(rightMODSpans)
    }
    case Order.LeftOverlap: {
      const leftMODSpans = modAtLeft(textNode, range, content, minIndex)
      const rightContents = content.slice(
        currRange.lower - range.lower,
        range.length
      )
      textNode.span.content.mod(0, rightContents)

      return leftMODSpans.concat([
        toMODSpan(textNode.span.lowerPoint, rightContents),
      ])
    }
    case Order.IncludedLeft: {
      const rightMODSpans = modAtRight(textNode, range, content, nextMINIndex)
      const leftContents = content.slice(0, currRange.length)
      textNode.span.content.mod(0, leftContents)

      return [toMODSpan(textNode.span.lowerPoint, leftContents)].concat(
        rightMODSpans
      )
    }
    case Order.IncludedRight: {
      const leftMODSpans = modAtLeft(textNode, range, content, minIndex)
      const rightContents = content.slice(
        range.length - currRange.length,
        range.length
      )
      textNode.span.content.mod(0, rightContents)

      return leftMODSpans.concat([
        toMODSpan(textNode.span.lowerPoint, rightContents),
      ])
    }
    case Order.IncludedMiddle: {
      const leftMODSpans = modAtLeft(textNode, range, content, minIndex)
      const rightMODSpans = modAtRight(textNode, range, content, nextMINIndex)
      const midContents = content.slice(
        currRange.lower - range.lower,
        currRange.upper - range.lower + 1
      )
      textNode.span.content.mod(0, midContents)

      return leftMODSpans
        .concat([toMODSpan(textNode.span.lowerPoint, midContents)])
        .concat(rightMODSpans)
    }
  }
}

const modAtLeft = (
  textNode: TextNode,
  range: ClosedRange,
  content: MODContent,
  minIndex: uint32
): MODSpan[] => {
  if (!textNode.left) return []

  return modAt(textNode.left, range, content, minIndex)
}

const modAtRight = (
  textNode: TextNode,
  range: ClosedRange,
  content: MODContent,
  minIndex: uint32
): MODSpan[] => {
  if (!textNode.right) return []

  return modAt(textNode.right, range, content, minIndex)
}

const toMODSpan = (lowerPoint: Point, content: MODContent): MODSpan =>
  new Span<MODContent>(lowerPoint, content)

export {modAt}
