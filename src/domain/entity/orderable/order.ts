enum Order {
  Splitting,
  Tagging,
  Less,
  Prependable,
  RightOverlap,
  IncludingRight,
  IncludingMiddle,
  IncludingLeft,
  Equal,
  IncludedLeft,
  IncludedMiddle,
  IncludedRight,
  LeftOverlap,
  Appendable,
  Greater,
  Tagged,
  Splitted,
}

type BasicOrder = Order.Less | Order.Equal | Order.Greater;
type RangeOrder =
  | Order.Less
  | Order.Prependable
  | Order.RightOverlap
  | Order.IncludingRight
  | Order.IncludingMiddle
  | Order.IncludingLeft
  | Order.Equal
  | Order.IncludedLeft
  | Order.IncludedMiddle
  | Order.IncludedRight
  | Order.LeftOverlap
  | Order.Appendable
  | Order.Greater;
type PointOrder =
  | Order.Tagging
  | Order.Less
  | Order.Equal
  | Order.Greater
  | Order.Tagged;
type SpanOrder =
  | Order.Splitting
  | Order.Less
  | Order.Prependable
  | Order.RightOverlap
  | Order.IncludingRight
  | Order.IncludingMiddle
  | Order.IncludingLeft
  | Order.Equal
  | Order.IncludedLeft
  | Order.IncludedMiddle
  | Order.IncludedRight
  | Order.LeftOverlap
  | Order.Appendable
  | Order.Greater
  | Order.Splitted;

export {Order, BasicOrder, RangeOrder, PointOrder, SpanOrder}
