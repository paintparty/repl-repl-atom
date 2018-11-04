const form = require('./form');
const util = require('./util');

function adjustOgPointIdx(state){
  if(state.isCursorAtHeadOfSelection){state.ogPointIdx--;}
}

function setUserCommandCode(state){
  state.ecf = state.userArg === "eval-current-form";
  state.eof = state.userArg === "eval-outermost-form";
  state.ece = state.userArg === "eval-current-expression";
}

function getBufferState(editor, userArg){
  let state = {editor: editor, userArg: userArg};

  state.fileExt = util.getFileExt(state);

  state.selection = util.getSelection(state)
  state.selectionRange = util.getSelectionRange(state);
  state.selectedText = util.getSelectedText(state);

  state.buff = util.getBuffer(state);

  state.buffText = util.getBufferText(state);

  state.endPos = util.getEndPosition(state);

  state.endOffset = util.getEndOffset(state);

  // --- ???????
  //let endPosVS = state.buff.positionForCharacterIndex(state.buffText.length); // Need this?

  // --- ??????
  //let endOffsetVS = state.buff.characterIndexForPosition(endPosVS); // Need this?

  // establish current cursor position
  state.ogPoint = util.getOgPoint(state);

  state.isCursorAtTailOfSelection = util.isCursorAtTailOfSelection(state);

  state.isCursorAtHeadOfSelection = util.isCursorAtHeadOfSelection(state);

  state.ogPointIdx = util.idxForPos(state, state.ogPoint);

  state.checkpoint = util.checkpoint(state);

  setUserCommandCode(state);

  adjustOgPointIdx(state);

  if(!state.fileExt){
    // issue fileExt warning;
    return;
  }

  if(!state.selectedText && state.fileExt === 'js'){
    // issue js warning
    return;
  }


  let stateProps = {
    isBlacklisted: null,
    isNotBlacklisted: null,
    isInsideForm : null,
    isInExpression : null,
    isNotJsCommentInExpression : null,
    isJsComment : null,
    isNotJsComment : null,
    isOutsideForm : null,
    isCommentRange : null,
    isIgnoredFormRange : null,
    isPointOnExpression : null,
    isPointNotOnExpression : null,
    isStringRange : null,
    jsComment : null,
    jsCommentEvalRange: null,
    jsCommentSelectedText: null,
    logTuple: null,
    rangeCurrentExpression: null,
    rangeCurrentForm: null,
    rangeOuterForm: null,
    textCurrentExpression: null,
    textCurrentForm: null,
    textOuterForm: null,
    warning: null
  };

  Object.assign(stateProps, state);

  /*
  state = {
    buff: state.buff,
    buffText: state.buffText,
    checkpoint: state.checkpoint,
    endPos: state.endPos,
    endOffset: state.endOffset,
    //endPosVS: endPosVS,
    ecf: state.ecf,
    eof: state.eof,
    ece: state.ece,
    editor: editor,
    fileExt: state.fileExt,
    isCursorAtHeadOfSelection: state.isCursorAtHeadOfSelection,
    isBlacklisted: null,
    isNotBlacklisted: null,
    isInsideForm : null,
    isInExpression : null,
    isNotJsCommentInExpression : null,
    isJsComment : null,
    isNotJsComment : null,
    isOutsideForm : null,
    isCommentRange : null,
    isIgnoredFormRange : null,
    isPointOnExpression : null,
    isPointNotOnExpression : null,
    isStringRange : null,
    jsComment : null,
    jsCommentEvalRange: null,
    jsCommentSelectedText: null,
    logTuple: null,
    ogPoint: state.ogPoint,
    ogPointIdx: state.ogPointIdx,
    rangeCurrentExpression: null,
    rangeCurrentForm: null,
    rangeOuterForm: null,
    selection: state.selection,
    selectedText: state.selectedText,
    textCurrentExpression: null,
    textCurrentForm: null,
    textOuterForm: null,
    warning: null
  };
  */
  console.log(state);

  // mutate the state to add range of form and text in range
  form.addFormRange(state);

  // mutate the state to info about current expression on point
  form.addExpressionRange(state);

  return state;
}
exports.getBufferState = getBufferState;
