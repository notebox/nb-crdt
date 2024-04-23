import type {
  INSContent,
  DELContent,
  FMTContent,
  MODContent,
} from "@/domain/entity"
import {Data, TextINSSpanData} from "./span"

import {Span} from "./span"

export * from "./spans"
export type INSSpan = Span<INSContent>;
export type DELSpan = Span<DELContent>;
export type FMTSpan = Span<FMTContent>;
export type MODSpan = Span<MODContent>;
export type SpanData = Data;

export {Span, TextINSSpanData}
