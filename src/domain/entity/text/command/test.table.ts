/* eslint-disable */
import type {uint32, PointData, TextINSSpanData, Stamp} from '@/domain/entity';

import {Order, Point, Attributes, FMTContent, MODContent, Span} from '@/domain/entity';

const cases: {[key: number]: TextINSSpanData} = {
  [Order.Splitted]:        [[[1, 1, 1], [5, 5, 5], [8, 8, 8]], 'ghi'],
  [Order.Less]:            [[[1, 1, 1], [5, 5, 9]],            '89a'],
  [Order.Prependable]:     [[[1, 1, 1], [5, 5, 8]],            '789'],
  [Order.RightOverlap]:    [[[1, 1, 1], [5, 5, 7]],            '678'],
  [Order.IncludingRight]:  [[[1, 1, 1], [5, 5, 7]],            '6'],
  [Order.IncludingMiddle]: [[[1, 1, 1], [5, 5, 6]],            '5'],
  [Order.IncludingLeft]:   [[[1, 1, 1], [5, 5, 5]],            '4'],
  [Order.Equal]:           [[[1, 1, 1], [5, 5, 5]],            '456'],
  [Order.IncludedLeft]:    [[[1, 1, 1], [5, 5, 5]],            '4567'],
  [Order.IncludedMiddle]:  [[[1, 1, 1], [5, 5, 4]],            '34567'],
  [Order.IncludedRight]:   [[[1, 1, 1], [5, 5, 4]],            '3456'],
  [Order.LeftOverlap]:     [[[1, 1, 1], [5, 5, 3]],            '234'],
  [Order.Appendable]:      [[[1, 1, 1], [5, 5, 2]],            '123'],
  [Order.Greater]:         [[[1, 1, 1], [5, 5, 1]],            '012'],
  [Order.Splitting]:       [[[1, 1, 1]],                       'jkl'],
};

const props = {FCOL: 'red'};
const stamp: Stamp = [5, 9];

const makeAttributes = (length: uint32): Attributes => {
  return Attributes.decode([[length, props, stamp]]);
};

const makeFMTSpan = (point: PointData, length: uint32): Span<FMTContent> => {
  return new Span<FMTContent>(
    Point.decode(point),
    new FMTContent(length, makeAttributes(length)),
  );
};

const makeMODSpan = (point: PointData, updatedText: string): Span<MODContent> => {
  return new Span<MODContent>(
    Point.decode(point),
    new MODContent(updatedText),
  );
};

export {cases, props, stamp, makeAttributes, makeFMTSpan, makeMODSpan};
