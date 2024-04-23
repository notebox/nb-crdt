import type {uint32, TextNode} from "@/domain/entity"

import {ClosedRange, Order, Spans} from "@/domain/entity"

const delAt = (
  textNode: TextNode,
  range: ClosedRange,
  minIndex: uint32
): Spans => {
  const curr = textNode.span
  const currMINIndex = minIndex + textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length
  const currRange = new ClosedRange(currMINIndex, curr.length)

  switch (currRange.compare(range)) {
    case Order.Less: {
      return delAtRight(textNode, range, nextMINIndex)
    }
    case Order.Greater: {
      return delAtLeft(textNode, range, minIndex)
    }
    case Order.Prependable: {
      const spans = delAtRight(textNode, range, nextMINIndex)
      textNode.mergeRight()
      return spans
    }
    case Order.Appendable: {
      const spans = delAtLeft(textNode, range, minIndex)
      textNode.mergeLeft()
      return spans
    }
    case Order.RightOverlap: {
      const rightDELs = delAtRight(textNode, range, nextMINIndex)
      const overlapped = range.intersection(currRange)
      const currDELs = delAt(textNode, overlapped, minIndex)
      return currDELs.concat(rightDELs)
    }
    case Order.LeftOverlap: {
      const overlapped = range.intersection(currRange)
      const currDELs = delAt(textNode, overlapped, minIndex)
      const leftDELs = delAtLeft(textNode, range, minIndex)
      return leftDELs.concat(currDELs)
    }
    case Order.Equal: {
      textNode.deleteSelf()
      return new Spans(curr)
    }
    case Order.IncludingLeft: {
      const [lSplit, rSplit] = curr.splitAt(range.length)
      textNode.setSpan(rSplit)
      return new Spans(lSplit)
    }
    case Order.IncludingRight: {
      const splitIndex = range.lower - currRange.lower
      const [lSplit, rSplit] = curr.splitAt(splitIndex)
      textNode.setSpan(lSplit)
      return new Spans(rSplit)
    }
    case Order.IncludingMiddle: {
      const rSplitIndex = range.upper + 1 - currRange.lower
      const [lSplit, rSplit] = curr.splitAt(rSplitIndex)
      const lSplitIndex = range.lower - currRange.lower
      const [llSplit, lrSplit] = lSplit.splitAt(lSplitIndex)
      textNode.setSpan(llSplit)
      textNode.insertSuccessor(rSplit)
      return new Spans(lrSplit)
    }
    case Order.IncludedLeft: {
      const rightDELs = delAtRight(textNode, range, nextMINIndex)
      textNode.deleteSelf()
      return new Spans(curr).concat(rightDELs)
    }
    case Order.IncludedRight: {
      const leftDELs = delAtLeft(textNode, range, minIndex)
      textNode.deleteSelf()
      return leftDELs.concat([curr])
    }
    case Order.IncludedMiddle: {
      const rightDELs = delAtRight(textNode, range, nextMINIndex)
      const leftDELs = delAtLeft(textNode, range, minIndex)
      textNode.deleteSelf()
      return leftDELs.concat([curr]).concat(rightDELs)
    }
  }
}

const delAtLeft = (
  textNode: TextNode,
  range: ClosedRange,
  minIndex: uint32
): Spans => {
  if (!textNode.left) return new Spans()

  const dels = delAt(textNode.left, range, minIndex)
  textNode.setLeft(textNode.left.balance())
  return dels
}

const delAtRight = (
  textNode: TextNode,
  range: ClosedRange,
  minIndex: uint32
): Spans => {
  if (!textNode.right) return new Spans()

  const dels = delAt(textNode.right, range, minIndex)
  textNode.setRight(textNode.right.balance())
  return dels
}

export {delAt}
