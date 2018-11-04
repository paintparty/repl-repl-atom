const changeColor = function(decoration, colorname){
  let classname =  'repl-repl-'+colorname;
  decoration.setProperties({type: 'highlight', class: classname });
}

// Indiana Jones and the triangle of doom...
function evalFormHighlightAnimation (highlightMarker, decoration){
  const interval = 50;
  setTimeout(
    () => {
      changeColor(decoration, 'cyan');
      setTimeout(
        () => {
          changeColor(decoration, 'green');
          setTimeout(
            () => {
              changeColor(decoration, 'yellow');
              setTimeout(
                () => {
                  changeColor(decoration, 'orange');
                  setTimeout(
                    () => {
                      changeColor(decoration, 'red');
                      setTimeout(
                        () => {
                          changeColor(decoration, 'violet');
                          setTimeout(
                            () => {
                              changeColor(decoration, 'blue');
                              setTimeout(
                                () => {
                                  highlightMarker.destroy();
                                },
                                interval
                              );
                            },
                            interval
                          );
                        },
                        interval
                      );
                    },
                    interval
                  );
                },
                interval
              );
            },
            interval
          );
        },
        interval
      );
    },
    interval 
  );
}

function highlightEvalForm(state){
  if(state.logTuple && state.logTuple[1]!=="warning"){
    let editor = atom.workspace.getActiveTextEditor();
    let rangeToHighlight = state[state.logTuple[2]]
    let highlightMarker = editor.markBufferRange(rangeToHighlight);
    let decoration = editor.decorateMarker(highlightMarker, {type: 'highlight', class: 'selection'});
    setTimeout(evalFormHighlightAnimation, 0, highlightMarker, decoration, state);
  }
};

function colorText(state){
  state.logBlockMarker = state.editor.markBufferRange(state.insertedTextRange);
  state.logBlockDecoration = state.editor.decorateMarker(state.logBlockMarker, {type: 'text', class: 'repl-repl-logblock'});
};

exports.highlightEvalForm = highlightEvalForm;
exports.colorText = colorText;
