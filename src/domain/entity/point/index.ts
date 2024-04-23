import {Point} from "./point"

export * from "./pointer"
export type {Data as TagData} from "./tag"
export type {Data as PointData, Identifier} from "./point"

export {Tag} from "./tag"
export {
  Point,
  pointMIN,
  pointMID,
  pointMAX,
  tagMIN,
  tagMID,
  tagMAX,
} from "./point"
export type AdjacentPoints = {
  lower?: Point | undefined;
  upper?: Point | undefined;
};
