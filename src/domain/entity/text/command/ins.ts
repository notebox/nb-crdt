import type {uint32, INSSpan, INSDelta} from "@/domain/entity"

import {Order, TextNode, NewINSDelta} from "@/domain/entity"

const ins = (
  textNode: TextNode,
  span: INSSpan,
  minIndex: uint32
): INSDelta[] => {
  const curr = textNode.span
  const currMINIndex = minIndex + textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length

  switch (curr.compare(span)) {
    case Order.Less:
      return insIntoRight(textNode, span, nextMINIndex)
    case Order.Greater:
      return insIntoLeft(textNode, span, minIndex)
    case Order.Prependable: {
      const inss = insIntoRight(textNode, span, nextMINIndex)
      textNode.mergeRight()
      return inss
    }
    case Order.Appendable: {
      const inss = insIntoLeft(textNode, span, minIndex)
      textNode.mergeLeft()
      return inss
    }
    case Order.Splitted: {
      const [lSplit, rSplit] = curr.splitWith(span)
      textNode.insertPredecessor(lSplit)
      textNode.setSpan(span)
      const spanIndex = currMINIndex + lSplit.length
      textNode.insertSuccessor(rSplit)
      return [NewINSDelta(spanIndex, span.content)]
    }
    case Order.Splitting: {
      const [lSplit, rSplit] = span.splitWith(curr)
      const rINSs = insIntoRight(textNode, rSplit, nextMINIndex)
      const lINSs = insIntoLeft(textNode, lSplit, minIndex)
      return rINSs.concat(lINSs)
    }
    case Order.RightOverlap:
    case Order.LeftOverlap:
    case Order.IncludingLeft:
    case Order.IncludingMiddle:
    case Order.IncludingRight:
    case Order.IncludedLeft:
    case Order.IncludedMiddle:
    case Order.IncludedRight:
    case Order.Equal:
    default:
      throw new Error("no-dup-insion")
  }
}

/* ins */
const insIntoLeft = (
  textNode: TextNode,
  span: INSSpan,
  minIndex: uint32
): INSDelta[] => {
  if (textNode.left) {
    const inss = ins(textNode.left, span, minIndex)
    textNode.setLeft(textNode.left.balance())

    return inss
  }

  textNode.setLeft(new TextNode(span))
  return [NewINSDelta(minIndex, span.content)]
}

const insIntoRight = (
  textNode: TextNode,
  span: INSSpan,
  minIndex: uint32
): INSDelta[] => {
  if (textNode.right) {
    const inss = ins(textNode.right, span, minIndex)
    textNode.setRight(textNode.right.balance())

    return inss
  }

  textNode.setRight(new TextNode(span))
  return [NewINSDelta(minIndex, span.content)]
}

export {ins}
