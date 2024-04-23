import type {INSSpan, DELSpan} from "@/domain/entity"

import {Attributes, INSContent} from "@/domain/entity"

class Spans extends Array<INSSpan> {
  concat(other: Spans | Array<INSSpan>): Spans {
    return new Spans(...this, ...other)
  }

  splitAt(offset: number): [left: Spans, right: Spans] {
    if (offset === 0) {
      return [new Spans(), this]
    }

    const left = new Spans()
    const right = new Spans()

    let length = offset
    let handled = 0
    for (handled; handled < this.length; handled++) {
      const len = this[handled].content.length
      if (len > length) {
        const [l, r] = this[handled].splitAt(length)
        left.push(l)
        right.push(r)
        break
      } else {
        left.push(this[handled])

        if (len === length) {
          break
        }
      }
      length -= len
    }

    return [left, right.concat(this.slice(handled + 1))]
  }

  toINSContent(): INSContent | undefined {
    if (this.length === 0) return undefined
    return this.reduce((acc: INSContent, cur: INSSpan) => {
      return acc.concat(cur.content, true)
    }, new INSContent(new Attributes([]), ""))
  }

  toDELSpans(): DELSpan[] {
    return this.map(span => span.toDELSpan())
  }

  textLength(): number {
    return this.reduce((acc, cur) => acc + cur.length, 0)
  }

  toString(): string {
    return this.reduce(
      (acc, cur) => acc.concat(cur.content.toTextWithMetaPlaceholder()),
      ""
    )
  }
}

export {Spans}
