import type {uint32, INSContent, Attributes, UTF16} from "@/domain/entity"

export type INSDelta = {
  index: uint32;
  content: INSContent;
};

export type DELDelta = {
  index: uint32;
  length: uint32;
};

export type FMTDelta = {
  index: uint32;
  attributes: Attributes;
};

export type MODDelta = {
  index: uint32;
  text: UTF16;
};

const NewINSDelta = (index: uint32, content: INSContent): INSDelta => {
  return {
    index,
    content,
  }
}
const NewDELDelta = (index: uint32, length: uint32): DELDelta => {
  return {
    index,
    length,
  }
}
const NewFMTDelta = (index: uint32, attributes: Attributes): FMTDelta => {
  return {
    index,
    attributes,
  }
}
const NewMODDelta = (index: uint32, text: UTF16): MODDelta => {
  return {
    index,
    text,
  }
}

export {NewINSDelta, NewDELDelta, NewFMTDelta, NewMODDelta}
