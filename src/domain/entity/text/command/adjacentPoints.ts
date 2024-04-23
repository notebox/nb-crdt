import type {Point, TextNode} from "@/domain/entity"

import {Order} from "@/domain/entity"

const adjacentPoints = (
  textNode: TextNode,
  point: Point
): {lower: Point | undefined; upper: Point | undefined} => {
  const span = textNode.span
  const lComp = span.lowerPoint.compare(point)

  switch (lComp) {
    case Order.Equal:
      return {
        lower: textNode.predecessorSpan()?.upperPoint.clone(),
        upper:
          span.length > 1
            ? point.offset(1)
            : textNode.successorSpan()?.lowerPoint.clone(),
      }
    case Order.Greater: {
      const left = textNode.left
      if (left) {
        const result = adjacentPoints(left, point)
        return {
          lower: result.lower,
          upper: result.upper || span.lowerPoint.clone(),
        }
      }

      return {
        lower: undefined,
        upper: span.lowerPoint.clone(),
      }
    }
    case Order.Less: {
      const rComp = span.upperPoint.compare(point)
      switch (rComp) {
        case Order.Equal:
          return {
            lower: point.offset(-1),
            upper: textNode.successorSpan()?.lowerPoint.clone(),
          }
        case Order.Less: {
          const right = textNode.right
          if (right) {
            const result = adjacentPoints(right, point)
            return {
              lower: result.lower || span.upperPoint.clone(),
              upper: result.upper,
            }
          }

          return {
            lower: span.upperPoint.clone(),
            upper: undefined,
          }
        }
        case Order.Greater: {
          const [dist] = point.distanceFrom(span.lowerPoint)
          return {
            lower: span.lowerPoint.offset(
              point.compareBase(span.lowerPoint) === Order.Tagging
                ? dist
                : dist - 1
            ),
            upper: span.lowerPoint.offset(dist + 1),
          }
        }
      }
    }
  }
}

export {adjacentPoints}
