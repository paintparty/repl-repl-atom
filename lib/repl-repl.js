'use babel';

import { CompositeDisposable } from 'atom';
import { getBufferState } from './state';
import { getFormObject } from './form';
import * as util from './util';
import * as logger from './logger';
import * as decorate from './decorate';
import * as control from './control';

export default {
  subscriptions: null,

  activate() {
    this.subscriptions = new CompositeDisposable()
    this.subscriptions.add(atom.commands.add('atom-workspace', {
      'repl-repl:eval-current-form': () => this.replrepl("eval-current-form"),
      'repl-repl:eval-outermost-form': () => this.replrepl("eval-outermost-form"),
      'repl-repl:eval-current-expression': () => this.replrepl("eval-current-expression")
    }))
  },

  deactivate(){
    this.subscriptions.dispose()
  },

  replrepl(userArg) {
    let editor = atom.workspace.getActiveTextEditor();
    if (!editor){
      return;
    }

    // Create object that represents the current buffer
    const state = getBufferState(editor, userArg);

    // file is js, no code selected, return silently
    if(!state){
      return;
    }

    state.logTuple = control.flow(state);
    if(state.logTuple && state.logTuple[1] === "warning"){
      state.warning = state.logTuple[0];
    }

    // create cljs (or js) code snippet to feed to js/console.log
    const newSurf = logger.logBlock(state);

    // flash highlight on form to be evaluated.
    decorate.highlightEvalForm(state);

    logger.insertText(newSurf, state);

    const deleteLogBlock = logger.deleteLogBlockFn(state)

    state.buff.save().then(deleteLogBlock);
  }
};
