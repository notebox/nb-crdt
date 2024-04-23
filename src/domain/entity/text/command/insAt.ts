import type {
  uint32,
  INSContent,
  INSSpan,
  TextNode,
  Contributor,
  Block,
} from "@/domain/entity"

import {ins} from "./ins"

const insAt = (
  textNode: TextNode,
  minIndex: uint32,
  content: INSContent,
  contributor: Contributor,
  block: Block
): INSSpan => {
  const curr = textNode.span
  const currMINIndex = textNode.leftLength()
  const nextMINIndex = currMINIndex + curr.length
  if (minIndex < currMINIndex) {
    return insAtLeft(textNode, minIndex, content, contributor, block)
  }
  if (minIndex === currMINIndex) {
    const adjPoints = {
      lower: textNode.predecessorSpan()?.upperPoint,
      upper: curr.lowerPoint,
    }
    const span = block.spanFor(contributor.replicaID, content, adjPoints)
    ins(textNode, span, 0)
    return span
  }
  if (minIndex < nextMINIndex) {
    const [lSplit, rSplit] = curr.splitAt(minIndex - currMINIndex)
    const adjPoints = {
      lower: lSplit.upperPoint,
      upper: rSplit.lowerPoint,
    }
    const span = block.spanFor(contributor.replicaID, content, adjPoints)
    ins(textNode, span, 0)
    return span
  }
  if (minIndex === nextMINIndex) {
    const adjPoints = {
      lower: curr.upperPoint,
      upper: textNode.successorSpan()?.lowerPoint,
    }
    const span = block.spanFor(contributor.replicaID, content, adjPoints)
    ins(textNode, span, 0)
    return span
  }

  const nextSubIndex = minIndex - nextMINIndex
  return insAtRight(textNode, nextSubIndex, content, contributor, block)
}

const insAtLeft = (
  textNode: TextNode,
  minIndex: uint32,
  content: INSContent,
  contributor: Contributor,
  block: Block
): INSSpan => {
  if (textNode.left) {
    const result = insAt(textNode.left, minIndex, content, contributor, block)
    textNode.setLeft(textNode.left.balance())

    return result
  }

  return insAt(textNode, 0, content, contributor, block)
}

const insAtRight = (
  textNode: TextNode,
  minIndex: uint32,
  content: INSContent,
  contributor: Contributor,
  block: Block
): INSSpan => {
  if (textNode.right) {
    const result = insAt(textNode.right, minIndex, content, contributor, block)
    textNode.setRight(textNode.right.balance())

    return result
  }

  const lastIdx = textNode.leftLength() + textNode.span.length
  return insAt(textNode, lastIdx, content, contributor, block)
}

export {insAt}
