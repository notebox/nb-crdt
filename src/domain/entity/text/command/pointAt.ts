import type {uint32, Point, TextNode} from "@/domain/entity"

const pointAt = (textNode: TextNode, treeIndex: uint32): Point => {
  const currMINIndex = textNode.leftLength()

  if (treeIndex < currMINIndex) {
    return pointAt(textNode.left!, treeIndex)
  }

  const curr = textNode.span

  if (treeIndex === currMINIndex) {
    return curr.lowerPoint
  }

  const currMAXIndex = currMINIndex + curr.length - 1

  if (treeIndex < currMAXIndex) {
    return curr.nthPoint(treeIndex - currMINIndex)
  }

  if (treeIndex === currMAXIndex) {
    return curr.upperPoint
  }

  return pointAt(textNode.right!, treeIndex - currMAXIndex - 1)
}

export {pointAt}
