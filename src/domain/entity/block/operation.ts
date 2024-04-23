import type {
  uint32,
  Point,
  Stamp,
  Block,
  BlockID,
  ReplicaNonce,
  BlockPosition,
  BlockPropsDelta,
  TextPropsDelta,
  INSSpan,
  DELSpan,
  FMTSpan,
  MODSpan,
  Contributor as ReplicaContributor,
  INSContent,
  INSDelta,
  DELDelta,
  Spans,
} from "@/domain/entity"

export type Version = {
  replicaID: uint32;
  nonce: ReplicaNonce;
};

/** @category input */
export type Local = {
  contributor: {
    nonce?: undefined;
  } & ReplicaContributor;
};
export type Remote = {
  contributor: Version;
};
export type Base = Local | Remote;

export type bINS = Block;

export type bDEL = Base & {
  isDeleted: boolean;
  stamp: Stamp;
};

export type bMOV = Base & {
  parentBlockID: BlockID;
  point: Point;
  stamp: Stamp;
};

export type bSET = Base & {
  props: BlockPropsDelta;
  stamp: Stamp;
};

export type tINS = Base & {
  span: INSSpan;
};

export type tDEL = Base & {
  span: DELSpan;
};

export type tFMT = Base & {
  span: FMTSpan;
};

export type tMOD = Base & {
  span: MODSpan;
};

export type tINSAt = Local & {
  index: uint32;
  content: INSContent;
};

export type tDELAt = Local & {
  index: uint32;
  length: uint32;
};

export type tFMTAt = Local & {
  index: uint32;
  length: uint32;
  props: TextPropsDelta;
  stamp: Stamp;
};

/** @category output */
export type BaseReceipt = {
  blockID: BlockID;
  version?: Version;
};

export type bDELReceipt = BaseReceipt & {
  from: boolean;
  to: boolean;
};
export type bMOVReceipt = BaseReceipt & {
  from: BlockPosition;
  to: BlockPosition;
};
export type bSETReceipt = BaseReceipt & {
  from: BlockPropsDelta;
  to: BlockPropsDelta;
};
export type tINSReceipt = BaseReceipt & {
  delta: INSDelta[];
};
export type tDELReceipt = BaseReceipt & {
  delta: DELDelta[];
};
export type tFMTReceipt = BaseReceipt;
export type tMODReceipt = BaseReceipt & {
  span: MODSpan;
};
export type tINSAtReceipt = BaseReceipt & {
  span: INSSpan;
};
export type tDELAtReceipt = BaseReceipt & {
  spans: Spans;
};
export type tFMTAtReceipt = BaseReceipt & {
  spans: FMTSpan[];
};
