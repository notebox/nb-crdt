import type {uint32} from "@/domain/entity"

import {Attributes, Leaf} from "./attributes"
import {INSContent, Data as INSContentData, UTF16} from "./ins"
import {DELContent, Data as DELContentData} from "./del"
import {FMTContent, Data as FMTContentData} from "./fmt"
import {MODContent, Data as MODContentData} from "./mod"

abstract class AbstractContent {
  abstract readonly length: uint32;
  abstract slice(start: uint32, end: uint32): AbstractContent;
  abstract concat(other: AbstractContent): AbstractContent;
  abstract encode(): ContentData;
}

type ContentData =
  | INSContentData
  | DELContentData
  | FMTContentData
  | MODContentData;

export type {
  AbstractContent,
  INSContentData,
  DELContentData,
  FMTContentData,
  MODContentData,
  ContentData,
  UTF16,
}

export {INSContent, DELContent, FMTContent, MODContent, Attributes, Leaf}
