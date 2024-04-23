/* eslint-disable @typescript-eslint/no-explicit-any */
import type {Stamp} from "@/domain/entity"

export type PropLeaf = {LEAF: true};
export type Props = {
  [index: number]: never;
  LEAF?: never;
};

export type OptionalNestedProps = Props | undefined;

export type PropsDelta<Type> = {
  [Property in keyof Type]?: Type[Property] extends OptionalNestedProps
    ? PropsDelta<Type[Property]>
    : Type[Property] | null;
} & {
  [index: number]: never;
};

export type BlockPropsWithStamp<Type> = {
  [Property in keyof Type]: Type[Property] extends OptionalNestedProps
    ? BlockPropsWithStamp<Type[Property]>
    : [stamp: Stamp | null, value: Type[Property]] | [stamp: Stamp];
};

export const isProps = (prop: any): prop is Props =>
  prop && typeof prop === "object" && !Array.isArray(prop) && !prop.LEAF

/** @category TEXT */

export type TextPropsDelta = PropsDelta<Props & TextProps>;
export type TextProps = TextPropsContent;
export interface TextPropsContent {}

/** @category BLOCK */

export type BlockType = string;

export type BlockPropsDelta = PropsDelta<Props & BlockPropsContent>;
export type BlockProps = BlockPropsWithStamp<Props & BlockPropsContent> & {
  TYPE: [stamp: Stamp | null, type: BlockType];
  MOV?: [stamp: Stamp];
  DEL?: [stamp: Stamp];
  LEAF?: never;
};
export interface BlockPropsContent {}
