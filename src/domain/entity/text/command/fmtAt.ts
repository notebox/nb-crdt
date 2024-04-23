import type {
  uint32,
  Point,
  Stamp,
  TextNode,
  Attributes,
  TextPropsDelta,
  FMTSpan,
} from "@/domain/entity"

import {Order, ClosedRange, FMTContent, Span} from "@/domain/entity"

const fmtAt = (
  textNode: TextNode,
  range: ClosedRange,
  props: TextPropsDelta,
  stamp: Stamp,
  minIndex: uint32
): FMTSpan[] => {
  const curr = textNode.span
  const currMINIndex = minIndex + textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length
  const currRange = new ClosedRange(currMINIndex, curr.length)

  switch (currRange.compare(range)) {
    case Order.Less:
    case Order.Prependable:
      return fmtAtRight(textNode, range, props, stamp, nextMINIndex)
    case Order.Greater:
    case Order.Appendable:
      return fmtAtLeft(textNode, range, props, stamp, minIndex)
    case Order.IncludingLeft:
    case Order.IncludingRight:
    case Order.IncludingMiddle:
    case Order.Equal: {
      const subIndex = range.lower - currRange.lower
      const length = range.length
      const attributes = textNode.span.content.fmtAt(
        subIndex,
        length,
        props,
        stamp
      )

      return [
        toFMTSpan(
          textNode.span.lowerPoint.offset(subIndex),
          length,
          attributes
        ),
      ]
    }
    case Order.RightOverlap: {
      const rightAttrSpans = fmtAtRight(
        textNode,
        range,
        props,
        stamp,
        nextMINIndex
      )
      const subIndex = range.lower - currRange.lower
      const length = currRange.length - subIndex
      const attributes = textNode.span.content.fmtAt(
        subIndex,
        length,
        props,
        stamp
      )

      return [
        toFMTSpan(
          textNode.span.lowerPoint.offset(subIndex),
          length,
          attributes
        ),
      ].concat(rightAttrSpans)
    }
    case Order.LeftOverlap: {
      const leftAttrSpans = fmtAtLeft(textNode, range, props, stamp, minIndex)
      const length = range.upper - currRange.lower + 1
      const attributes = textNode.span.content.fmtAt(0, length, props, stamp)

      return leftAttrSpans.concat([
        toFMTSpan(textNode.span.lowerPoint, length, attributes),
      ])
    }
    case Order.IncludedLeft: {
      const rightAttrSpans = fmtAtRight(
        textNode,
        range,
        props,
        stamp,
        nextMINIndex
      )
      const length = currRange.length
      const attributes = textNode.span.content.fmtAt(0, length, props, stamp)

      return [toFMTSpan(textNode.span.lowerPoint, length, attributes)].concat(
        rightAttrSpans
      )
    }
    case Order.IncludedRight: {
      const leftAttrSpans = fmtAtLeft(textNode, range, props, stamp, minIndex)
      const length = currRange.length
      const attributes = textNode.span.content.fmtAt(0, length, props, stamp)

      return leftAttrSpans.concat([
        toFMTSpan(textNode.span.lowerPoint, length, attributes),
      ])
    }
    case Order.IncludedMiddle: {
      const leftAttrSpans = fmtAtLeft(textNode, range, props, stamp, minIndex)
      const rightAttrSpans = fmtAtRight(
        textNode,
        range,
        props,
        stamp,
        nextMINIndex
      )
      const length = currRange.length
      const attributes = textNode.span.content.fmtAt(0, length, props, stamp)

      return leftAttrSpans
        .concat([toFMTSpan(textNode.span.lowerPoint, length, attributes)])
        .concat(rightAttrSpans)
    }
  }
}

const fmtAtLeft = (
  textNode: TextNode,
  range: ClosedRange,
  props: TextPropsDelta,
  stamp: Stamp,
  minIndex: uint32
): FMTSpan[] => {
  if (!textNode.left) return []

  return fmtAt(textNode.left, range, props, stamp, minIndex)
}

const fmtAtRight = (
  textNode: TextNode,
  range: ClosedRange,
  props: TextPropsDelta,
  stamp: Stamp,
  minIndex: uint32
): FMTSpan[] => {
  if (!textNode.right) return []

  return fmtAt(textNode.right, range, props, stamp, minIndex)
}

const toFMTSpan = (
  lowerPoint: Point,
  length: uint32,
  attributes: Attributes
) => {
  return new Span<FMTContent>(lowerPoint, new FMTContent(length, attributes))
}

export {fmtAt}
