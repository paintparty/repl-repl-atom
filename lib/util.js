function logStateInfo(state){
  //console.log('logStateInfo -> state.logTuple', state.logTuple);
}

function convertHex(hex) {
  var hex = hex.replace('#', '');
  let r = parseInt(hex.substring(0, 2), 16);
  let g = parseInt(hex.substring(2, 4), 16);
  let b = parseInt(hex.substring(4, 6), 16);
  let a = hex.substring(6, 8);
  let aInt = parseInt(a);
  let opacity = (a.length === 2 && (aInt !== NaN) && (typeof aInt === 'number')) ? (0.7 * aInt/100) : 1;
  let result = 'rgba(' + r + ',' + g + ',' + b + ',' + opacity + ')';
  return result;
}

function numRange(left, right, inclusive) {
  let range = [];
  let ascending = left < right;
  let end = !inclusive ? right : ascending ? right + 1 : right - 1;
  for (let i = left; ascending ? i < end : i > end; ascending ? i++ : i--) {
    range.push(i);
  }
  return range;
}

function toPointRange(state, range){
  return {
    start: posForIdx(state, range.start),
    end: posForIdx(state, range.end),
  };
}

function toIdxRange(state, pointRange){
   let start = idxForPos(state, pointRange.start);
   let end = idxForPos(state, pointRange.end);
   return {start : start, end : end-1};
}

function getCursorOffset(editor){
  let buff = editor.document;
  return buff.offsetAt(editor.selection.active);
}

function saveFileFn(state){
  return(
    function saveFile(promise){return state.buff.save();}
  );
}

const multiSelectWarning =  '\nrepl-repl cannot evaluate multiple selections.' +
  '\n\nPlease use a single selection or evaluate a form ' +
  'by firing repl-repl when your cursor is within the form. ' +
  '\n\nA "form" is an unquoted section of code beginning with (, ' +
  '[, or {, and ending with the respective balancing bracket.\n\n';

function getSelectedText(editor){
  let selection = editor.getSelections();

  if(selection.length > 1){
    console.warn(multiSelectWarning);
    return;
  }
  let selectedText = selection[0].getText();
  selectedText = (selectedText === "") ? null : selectedText;
  return selectedText;
}

function isJsWithNoSelectedText(state){
  let ext = state.fileExt;
  return ((ext === 'js' || ext === 'jsx') && !state.selectedText)
}

function expressionAtIdx(str, re, cursorIdx, formStartIdx){
  let isValidString = (typeof str === "string" && str !== "");
  let isValidRegex = (re instanceof RegExp);
  let indicesAreValid = (typeof cursorIdx === "number" && typeof formStartIdx === "number");
  if(!isValidString){
    return;
  }
  if(!isValidRegex){
    return;
  }
  if(!indicesAreValid){
    return;
  }
  let match;
  while ((match = re.exec(str)) !== null){
    let startIdx = match.index + formStartIdx;
    let endIdx = re.lastIndex + formStartIdx;

    if(startIdx <= cursorIdx && endIdx > cursorIdx ){
      return {
        matchedString: match[0],
        idx: match.index,
        lastIndex: re.lastIndex,
        startIdx: startIdx,
        endIdx: endIdx
      };
    }
  }
}

function reducerFn (ns){
  return (
    (acc, v) => {
      acc[v] = ns[v](acc);
      return acc;
    }
  );
}

/// Atom specific
function fileExt(state){
  let fileExtMatch = state.editor.getPath().match(/.(cljs|cljc|js|jsx)$/);
  if(fileExtMatch){
    return fileExtMatch[1];
  }
}

function isCljx(state){
  let ext = state.fileExt;
  return (ext === "cljs" || ext === "cljc");
}

function isJs(state){
  let ext = state.fileExt;
  return (ext === "js" || ext === "jsx");
}

function selection(state){
  let selections = state.editor.getSelections()
  // mutate state
  if(selections.length > 1){
    state.multiSelectWarning = multiSelectWarning;
  }
  return selections[0];
}

function selectionRange(state){
  let selectionRange = state.selection.getBufferRange();
  return selectionRange;
}

function selectedText(state){
  // fold both steps
  let selectedText = state.selection.getText();
  selectedText = (selectedText === "") ? null : selectedText;
  return selectedText;
}

function buff(state){
  return state.editor.getBuffer();
}

function buffText(state){
  let buffText = state.buff.getText();
  return buffText;
}

function endPos(state){
  let endPos = state.buff.getEndPosition();
  return endPos;
}

function idxForPos(state, pos){
   let idx = state.buff.characterIndexForPosition(pos);
   return idx;
}

function endOffset(state){
   let endOffset = idxForPos(state, state.endPos);
   return endOffset;
}

function cursorPos(state){
  return state.editor.getCursorBufferPosition();
}

function ogPoint(state){
  let ogPoint = cursorPos(state);
  return ogPoint;
}

function isCursorAtTailOfSelection(state){
  let isCursorAtTailOfSelection = state.selectedText ?
    (state.selectionRange.start.row === state.ogPoint.row &&
     state.selectionRange.start.column === state.ogPoint.column)
    :
    null;
  return isCursorAtTailOfSelection;
}

function isCursorAtHeadOfSelection(state){
  return (state.selectedText && !state.isCursorAtTailOfSelection);
}

function ogPointIdx(state){
  let ogPointIdx = idxForPos(state, state.ogPoint);
  return ogPointIdx;
}

function checkpoint(state){
  let checkpoint = state.buff.createCheckpoint();
  return checkpoint;
}

function posForIdx(state, idx){
  return state.buff.positionForCharacterIndex(idx);
}

function charAtIdx(state, idx){
  let char = state.buffText.substring(idx, idx+1);
  return char;
}

function getTextInPointRange(state, range){
  let textInRange = state.editor.getTextInBufferRange(range);
  return textInRange
}
// End Atom specific

// Atom specific
exports.getTextInPointRange = getTextInPointRange;
exports.cursorPos = cursorPos;
exports.checkpoint = checkpoint;
exports.charAtIdx = charAtIdx;
exports.idxForPos = idxForPos;
exports.posForIdx = posForIdx;
exports.fileExt = fileExt;
exports.isCljx = isCljx;
exports.isJs = isJs;
exports.ogPointIdx = ogPointIdx;
exports.isCursorAtHeadOfSelection = isCursorAtHeadOfSelection;
exports.isCursorAtTailOfSelection = isCursorAtTailOfSelection;
exports.ogPoint = ogPoint;
exports.endOffset = endOffset;
exports.endPos = endPos;
exports.buffText = buffText;
exports.buff = buff;
exports.selectedText = selectedText;
exports.selection = selection;
exports.selectionRange = selectionRange;
// End Atom specific

exports.logStateInfo = logStateInfo;
exports.convertHex = convertHex;
exports.expressionAtIdx = expressionAtIdx;
exports.getSelectedText = getSelectedText;
exports.isJsWithNoSelectedText = isJsWithNoSelectedText;
exports.numRange = numRange;
exports.toPointRange = toPointRange;
exports.toIdxRange = toIdxRange;
exports.getCursorOffset = getCursorOffset;
exports.saveFileFn = saveFileFn;
exports.reducerFn = reducerFn;
