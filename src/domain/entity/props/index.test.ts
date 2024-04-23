import type {INSContentData} from "@/domain/entity"

import type {BlockProps, PropLeaf} from "./index"

export const NoteBlockType = "NOTE"
enum BlockType {
  Line = "LINE",
  Header1 = "H1",
  Header2 = "H2",
  Header3 = "H3",
  UnorderedList = "UL",
  OrderedList = "OL",
  CheckList = "CL",
  Blockquote = "BLOCKQUOTE",
  Codeblock = "CODEBLOCK",
  Image = "IMG",
  Divider = "HR",
  Mermaid = "MERMAID",
  Linkblock = "LINK",
  Database = "DATABASE",
  DataRow = "DATAROW",
}

// type ReservedBlockPropsKey = 'INS' | 'DEL' | 'MOV' | 'SET';
enum BlockPropKey {
  TYPE = "TYPE",
  MOV = "MOV",
  DEL = "DEL",
  GlobalCountingRule = "GLOBAL_COUNT",
  Done = "DONE",
  Source = "SRC",
  FileID = "FILE_ID",
  Width = "W",
  Height = "H",
  Caption = "CAPTION",
  Link = "LINK",
  Language = "LANG",
  DatabaseID = "DB_ID",
  Database = "DATABASE",
  DataRow = "DATAROW",
  Template = "TEMPLATE",
  Table = "TABLE",
}

export enum TextPropKey {
  Bold = "B",
  Italic = "I",
  Strike = "S",
  Underline = "U",
  Code = "CODE",
  Link = "A",
  ForegroundColor = "FCOL",
  BackgroundColor = "BCOL",
}

declare module "./index" {
  interface TextPropsContent {
    [TextPropKey.Bold]?: true;
    [TextPropKey.Italic]?: true;
    [TextPropKey.Strike]?: true;
    [TextPropKey.Underline]?: true;
    [TextPropKey.Code]?: true;
    [TextPropKey.Link]?: string;
    [TextPropKey.ForegroundColor]?: string;
    [TextPropKey.BackgroundColor]?: string;
    LEAF?: true;
  }

  interface BlockPropsContent {
    /** @category common */
    [BlockPropKey.TYPE]?: typeof NoteBlockType | BlockType;
    [BlockPropKey.GlobalCountingRule]?: true;

    /** @category checklist */
    [BlockPropKey.Done]?: true;

    /** @category image */
    [BlockPropKey.FileID]?: string;
    [BlockPropKey.Source]?: string;
    [BlockPropKey.Width]?: number;
    [BlockPropKey.Height]?: number;
    [BlockPropKey.Caption]?: string;

    /** @category link-block */
    [BlockPropKey.Link]?: string;

    /** @category code-block */
    [BlockPropKey.Language]?: string;

    /** @category database */
    [BlockPropKey.DatabaseID]?: string;
    [BlockPropKey.Database]?: Props & {
      [columnID: string]: Props & DatabaseColumn;
    };

    /** @category datarow */
    [BlockPropKey.DataRow]?: Props & {
      [columnID: string]: Props & {
        value?: DataValue;
        format?: PropLeaf & TextProps;
      };
    };

    /** @category database template */
    [BlockPropKey.Template]?: DatabaseTemplates;
    [BlockPropKey.Table]?: Props & {
      COLUMNS?: DatabaseColumnID[];
    };
  }
}

/** @category database */
export type DatabaseColumnID = string;
export type DatabaseColumnType = "INDEX" | "MULTI-SELECT" | "SELECT";
export type DatabaseColumn = {
  name: string;
  type?: DatabaseColumnType;
};
export type DatabaseTemplates =
  | BlockPropKey.Table
  | "BOARD"
  | "TIMELINE"
  | "CALENDAR";
export type DatabaseColumnOptionID = string;
export type DataValue =
  | string
  | INSContentData // not yet supported
  | DatabaseColumnOptionID[]
  | [string, ...Array<boolean | number | string>];

const test: BlockProps = {
  TYPE: [null, BlockType.DataRow],
  DATABASE: {
    "1-1": {
      name: [null, "yo"],
    },
  },
  DATAROW: {
    "1-1": {
      value: [null, "hello"],
      format: [null, {B: true, LEAF: true}],
    },
  },
}

describe("@entity.props", () => {
  it("nested props", () => {
    expect(test.DATABASE?.["1-1"]?.name[1]).toBe("yo")
    expect(test.DATAROW?.["1-1"]?.value?.[1]).toBe("hello")
  })
})
