import type {uint32, DELSpan, TextNode, DELDelta} from "@/domain/entity"

import {Order, NewDELDelta} from "@/domain/entity"

const del = (
  textNode: TextNode,
  span: DELSpan,
  minIndex: uint32
): DELDelta[] => {
  const curr = textNode.span
  const currMINIndex = minIndex + textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length

  switch (curr.compare(span)) {
    case Order.Less:
    case Order.Prependable: {
      return delRight(textNode, span, nextMINIndex)
    }
    case Order.Greater:
    case Order.Appendable: {
      return delLeft(textNode, span, minIndex)
    }
    case Order.IncludingLeft: {
      textNode.setSpan(curr.getAppendableSegmentTo(span))
      return [NewDELDelta(currMINIndex, span.length)]
    }
    case Order.IncludingRight: {
      const replacing = curr.getPrependableSegmentTo(span)
      textNode.setSpan(replacing)
      return [NewDELDelta(currMINIndex + replacing.length, span.length)]
    }
    case Order.IncludingMiddle: {
      const replacing = curr.getPrependableSegmentTo(span)
      textNode.setSpan(replacing)
      textNode.insertSuccessor(curr.getAppendableSegmentTo(span))
      return [NewDELDelta(currMINIndex + replacing.length, span.length)]
    }
    case Order.RightOverlap: {
      const rightDELs = delRight(textNode, span, nextMINIndex)
      const overlapped = span.intersection(curr.toDELSpan())
      const currDELs = del(textNode, overlapped, minIndex)
      return currDELs.concat(rightDELs)
    }
    case Order.LeftOverlap: {
      const overlapped = span.intersection(curr.toDELSpan())
      const currDELs = del(textNode, overlapped, minIndex)
      const leftDELs = delLeft(textNode, span, minIndex)
      return leftDELs.concat(currDELs)
    }
    case Order.Equal: {
      textNode.deleteSelf()
      return [NewDELDelta(currMINIndex, curr.length)]
    }
    case Order.IncludedLeft: {
      const rightDELs = delRight(textNode, span, nextMINIndex)
      const currDELs = del(textNode, curr.toDELSpan(), minIndex)
      return currDELs.concat(rightDELs)
    }
    case Order.IncludedRight: {
      const leftDELs = delLeft(textNode, span, minIndex)
      const currDELs = del(textNode, curr.toDELSpan(), minIndex)
      return leftDELs.concat(currDELs)
    }
    case Order.IncludedMiddle: {
      const rightDELs = delRight(textNode, span, nextMINIndex)
      const leftDELs = delLeft(textNode, span, minIndex)
      const currDELs = del(textNode, curr.toDELSpan(), minIndex)
      return leftDELs.concat(currDELs).concat(rightDELs)
    }
    case Order.Splitting: {
      const [lSplit, rSplit] = span.splitWith(curr.toDELSpan())
      const rightDELs = del(textNode, rSplit, minIndex)
      const leftDELs = del(textNode, lSplit, minIndex)
      return leftDELs.concat(rightDELs)
    }
    case Order.Splitted:
    default:
      return [] // the target range does not exist
  }
}

const delLeft = (
  textNode: TextNode,
  span: DELSpan,
  minIndex: uint32
): DELDelta[] => {
  if (!textNode.left) return []

  const dels = del(textNode.left, span, minIndex)
  textNode.setLeft(textNode.left.balance())

  return dels
}

const delRight = (
  textNode: TextNode,
  span: DELSpan,
  minIndex: uint32
): DELDelta[] => {
  if (!textNode.right) return []

  const dels = del(textNode.right, span, minIndex)
  textNode.setRight(textNode.right.balance())

  return dels
}

export {del}
