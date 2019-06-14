const decorate = require('./decorate');

// reserve various defs
function getCopiedEscapeDefs (copied){
  let nsRe = /^\(\s*ns\s+\S+[\s\S]*\)$/
  if(nsRe.test(copied)){
    return "nil"
  }
  // just match on current regex. if true, turn into array
  let defMatch = /^\(\s*def(?:n|record|protocol|multi|type|method)?\s+(?:\^\S+\s+)*(?:\#\^\{.*\}\s)*(\S+)[\s\S]*\)$/
  let defMatchResult = defMatch.exec(copied);

  if(defMatchResult){
    return '(symbol (str (namespace ::x) "/" (quote ' + defMatchResult[1] + ')))';
  }else{
    let defExpressionMatch = /^def(?:n|record|protocol|multi|type|method)?$/
    let defExpressionMatchResult = defExpressionMatch.exec(copied);
    return defExpressionMatchResult ? "'cljs.core/"+copied : copied;
  }
}

function warningBlock(state){
  if(state.isJs){
    return 'console.clear()\nconsole.warn(\n"' + state.warning + '")';
  }else{
    return '(console.clear)\n(enable-console-print!)\n(js/console.warn\n  "' + state.warning + '")';
  }
}

function jsBlock (state){
  if(state.warning){
    return warningBlock(state);
  }
  let result = 'eval(`' + state.selectedText + '`)';
  let surfStart = '; repl-repl output start';
  let surfEnd = '; repl-repl output end';

  let q = '`';
  let nl = '\n';
  let qnl = '`\n`';
  let qnlSp = '`\n `';
  let sp = ' ';
  let nlTwoSp = nl + sp + sp;
  let joiner = `,${nlTwoSp}`;
  let doubleLineBreak = q + '\\n\\n' + q;
  let thingToEvalDisplay = q + state.selectedText + q;
  let thingToEval = q + '=>' + q + ',' + nlTwoSp + result;
  let logArgs = [qnl, thingToEvalDisplay, doubleLineBreak, thingToEval, qnlSp].join(joiner);
  let applyLog = `console.log.apply(${nl}console, [\n${logArgs}\n])`;
  let consoleClear = 'console.clear()';
  let newSurf = [consoleClear, surfStart, applyLog, surfEnd].join("\n");

  return newSurf;
}

function cljxBlock (state){
  if(state.warning){
    return warningBlock(state);
  }
  let copied = state[state.logTuple[0]];

  let surfStart = '; rr_';
  let surfEnd = '; _rr';

  // quotes and newlines for cljs
  let sp = ' ';
  let qsp = '" "';
  let nl = '\n';
  let qnl = '"\\n"';
  let qnlSp = '"\\n "';
  let qdq = '"\\""';
  let nlTwoSp = nl + sp + sp;

  // cljx stringify fn
  let strfnName = 'rr';
  let strfn = '(let [' + strfnName + ' (fn [v] (if (string? v) (str ' + qdq + ' v ' + qdq + ') v))]';

  // escape cljx defs
  let thingToEval = state.isJsComment ?
    '(js/eval "' + state.jsComment + '")'
    :
    getCopiedEscapeDefs(copied);

  // cljs to pass quoted form to stringify fn
  let thingToEvalDisplay = state.isJsComment ?
    '"'+state.jsComment+'"'
    :
    '(' + strfnName + ' (quote ' + copied + '))';

  // cljs to pass evaled form(result) to stringify fn
  let evalResultLine = '"=>"' + nlTwoSp + '(' + strfnName + ' ' + thingToEval + ')';

  let joiner = nlTwoSp;
  let doubleLineBreak = qnl + qnl;
  let logArgs = [qnl, thingToEvalDisplay, doubleLineBreak, evalResultLine, qnlSp].join(joiner);
  let applyLog = '(apply js/console.log ' + nl + ' [' + logArgs + '])';
  let isCljc = state.fileExt === "cljc";
  let cljxApplyLog = isCljc ? '#?(:cljs ' + applyLog + ')' : applyLog;
  let consoleClear = '(console.clear)';
  let ecp = '(enable-console-print!)';
  let newSurf = [nl, surfStart, consoleClear, ecp, strfn, cljxApplyLog, ')', surfEnd].join("\n");
  return newSurf;
}

function logBlock(state){
  return (state.fileExt === 'js') ?
    jsBlock(state)
    :
    cljxBlock(state);
}

function deleteText(state){
  state.buff.revertToCheckpoint(state.checkpoint);
}

function insertText(text, state){
  state.editor.moveToBottom();
  let ogPointMax = state.editor.getCursorBufferPosition();
  state.editor.insertText(text);
  let newPointMax = state.editor.getCursorBufferPosition();
  state.insertedTextRange = {start: ogPointMax, end: newPointMax};
  decorate.colorText(state);
  state.editor.setCursorBufferPosition(state.ogPoint);
}

// save buffer to trigger reload, then clear text after timeout
function deleteLogBlockFn (state){
  return(
    () => {
      setTimeout(
        () => {
          state.logBlockMarker.destroy();
          state.buff.revertToCheckpoint(state.checkpoint)
        },
        500
      );
    }
  )
}

exports.warningBlock = warningBlock;
exports.cljxBlock = cljxBlock;
exports.jsBlock = jsBlock;
exports.logBlock = logBlock;
exports.insertText = insertText;
exports.deleteLogBlockFn = deleteLogBlockFn;
