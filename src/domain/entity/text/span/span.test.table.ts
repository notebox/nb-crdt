import type {uint32, SpanOrder, PointData} from "@/domain/entity"

import {Order, DELContent, Point} from "@/domain/entity"
import {Span} from "./span"

export type DELSpanRaw = [pointRaw: PointData, length: uint32];
export const spanFrom = (data: DELSpanRaw): Span<DELContent> =>
  new Span<DELContent>(Point.decode(data[0]), new DELContent(data[1]))
export const subject: DELSpanRaw = [
  [
    [3, 3, 3],
    [5, 5, 5],
  ],
  3,
]
export const cases: [
  order: SpanOrder,
  other: DELSpanRaw,
  intersection?: DELSpanRaw
][] = [
  [
    Order.Splitted,
    [
      [
        [3, 3, 3],
        [5, 5, 5],
        [8, 8, 8],
      ],
      3,
    ],
  ],
  [Order.Less, [[[3, 3, 4]], 3]],
  [
    Order.Less,
    [
      [
        [3, 3, 3],
        [5, 5, 50],
        [8, 8, 8],
      ],
      3,
    ],
  ],
  [
    Order.Less,
    [
      [
        [3, 3, 4],
        [5, 5, 9],
      ],
      3,
    ],
  ],
  [
    Order.Less,
    [
      [
        [3, 3, 3],
        [5, 5, 9],
      ],
      3,
    ],
  ],
  [
    Order.Prependable,
    [
      [
        [3, 3, 3],
        [5, 5, 8],
      ],
      3,
    ],
  ],
  [
    Order.RightOverlap,
    [
      [
        [3, 3, 3],
        [5, 5, 7],
      ],
      3,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 7],
      ],
      1,
    ],
  ],
  [
    Order.IncludingRight,
    [
      [
        [3, 3, 3],
        [5, 5, 7],
      ],
      1,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 7],
      ],
      1,
    ],
  ],
  [
    Order.IncludingMiddle,
    [
      [
        [3, 3, 3],
        [5, 5, 6],
      ],
      1,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 6],
      ],
      1,
    ],
  ],
  [
    Order.IncludingLeft,
    [
      [
        [3, 3, 3],
        [5, 5, 5],
      ],
      1,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 5],
      ],
      1,
    ],
  ],
  [Order.Equal, subject, subject],
  [
    Order.IncludedLeft,
    [
      [
        [3, 3, 3],
        [5, 5, 5],
      ],
      4,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 5],
      ],
      3,
    ],
  ],
  [
    Order.IncludedMiddle,
    [
      [
        [3, 3, 3],
        [5, 5, 4],
      ],
      5,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 5],
      ],
      3,
    ],
  ],
  [
    Order.IncludedRight,
    [
      [
        [3, 3, 3],
        [5, 5, 4],
      ],
      4,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 5],
      ],
      3,
    ],
  ],
  [
    Order.LeftOverlap,
    [
      [
        [3, 3, 3],
        [5, 5, 3],
      ],
      3,
    ],
    [
      [
        [3, 3, 3],
        [5, 5, 5],
      ],
      1,
    ],
  ],
  [
    Order.Appendable,
    [
      [
        [3, 3, 3],
        [5, 5, 2],
      ],
      3,
    ],
  ],
  [
    Order.Greater,
    [
      [
        [3, 3, 3],
        [5, 5, 1],
      ],
      3,
    ],
  ],
  [
    Order.Greater,
    [
      [
        [3, 3, 2],
        [5, 5, 1],
      ],
      3,
    ],
  ],
  [
    Order.Greater,
    [
      [
        [3, 3, 3],
        [5, 5, 4],
        [8, 8, 8],
      ],
      3,
    ],
  ],
  [Order.Greater, [[[3, 3, 1]], 3]],
  [Order.Splitting, [[[3, 3, 3]], 3]],
]
