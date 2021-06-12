// Generated by ReScript, PLEASE EDIT WITH CARE

import * as React from "react";

var current = {
  contents: 0
};

function increment(param) {
  current.contents = current.contents + 1 | 0;
  return current;
}

function reducer(_state, action) {
  return increment(undefined).contents;
}

function useGlobalCount(param) {
  return React.useReducer(reducer, current.contents);
}

export {
  current ,
  increment ,
  reducer ,
  useGlobalCount ,
  
}
/* react Not a pure module */
