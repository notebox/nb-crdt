import type {Point, TextNode} from "@/domain/entity"

import {Order} from "@/domain/entity"

const adjacentOffsets = (
  textNode: TextNode,
  point: Point
): {lower: number | undefined; upper: number | undefined} => {
  const span = textNode.span
  const lComp = span.lowerPoint.compare(point)
  const minIndex = textNode.leftLength()

  switch (lComp) {
    case Order.Equal:
      return {
        lower: minIndex > 0 ? minIndex - 1 : undefined,
        upper: textNode.right || span.length > 1 ? minIndex + 1 : undefined,
      }
    case Order.Greater: {
      const result = textNode.left && adjacentOffsets(textNode.left, point)
      return result
        ? {
            lower: result.lower,
            upper: result.upper === undefined ? minIndex : result.upper,
          }
        : {
            lower: undefined,
            upper: 0,
          }
    }
    case Order.Less: {
      const rComp = span.upperPoint.compare(point)
      switch (rComp) {
        case Order.Equal: {
          const lastIndex = minIndex + span.length - 1
          return {
            lower: lastIndex - 1,
            upper: textNode.right ? lastIndex + 1 : undefined,
          }
        }
        case Order.Less: {
          const nextMINIndex = minIndex + span.length
          const result =
            textNode.right && adjacentOffsets(textNode.right, point)
          return result
            ? {
                lower:
                  result.lower === undefined
                    ? nextMINIndex - 1
                    : result.lower + nextMINIndex,
                upper: result.upper ? result.upper + nextMINIndex : undefined,
              }
            : {
                lower: nextMINIndex - 1,
                upper: undefined,
              }
        }
        case Order.Greater: {
          const [dist] = point.distanceFrom(span.lowerPoint)
          const index = minIndex + dist
          return {
            lower: index - 1,
            upper: index + 1,
          }
        }
      }
    }
  }
}

export {adjacentOffsets}
