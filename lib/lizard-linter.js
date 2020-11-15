'use babel';

import { CompositeDisposable, Disposable } from 'atom';
import LizardInfoView from './lizard-linter-info-view';

const atomLinter = require('atom-linter');

let lizardInfoView;
const fileAnalysis = {
  fileName: '',
  functionAnalysis: [],
  linterMessages: [],
};

let subscriptions;

let executeLintOnFileOpenEvent;
let executeLintOnFileSaveEvent;
let thresholdCyclomaticComplexity;
let thresholdNumberOfParameters;
let thresholdLinesOfCodeWithoutComments;
let thresholdNumberOfTokens;
let modifiedCyclomaticComplexityCalculation;
let excludeFiles;
let excludeFileExtensions;
let numberOfWorkingThreads;

/* Executes the lizard tool by command line interface */
async function execLinterCmdLine(editorFilePath) {
  const args = [editorFilePath];

  // Do a modified cyclomatic complexity calculation if requested by setting.
  if (modifiedCyclomaticComplexityCalculation) {
    args.push('--modified');
  }

  // set the number of working threads according to the settings
  args.push(`--working_threads=${numberOfWorkingThreads}`);

  const execOpts = { stream: 'both' };
  execOpts.timeout = Infinity;

  const data = await atomLinter.exec('lizard', args, execOpts);

  const { stdout, stderr, exitCode } = data;
  if (exitCode !== 0 && stderr !== '') {
    console.log('error');
    console.log(`exitCode ${exitCode}`);
    console.log(`stderr ${stderr}`);
    throw new Error(stderr);
  }

  console.log(stdout);

  return stdout;
}

function getLizardLintMessages(textEditor, analyzedfunctionsString) {
  const toReturn = [];

  // loop through all functions
  for (let i = 0; i < analyzedfunctionsString.length; i += 1) {
    const line = analyzedfunctionsString[i];
    const regex = /\s?(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+) (.*)@(\d+)-(\d+)@/gm;
    const m = regex.exec(line);

    if (m === null) {
      return null;
    }

    const funcAnlaysis = {};

    const linesOfCodeWithoutComments = parseInt(m[1], 10);
    const cyclomaticComplexity = parseInt(m[2], 10);
    const tokenCount = parseInt(m[3], 10);
    const numOfParameters = parseInt(m[4], 10);
    const functionName = m[6];
    const lineNumberInEditor = parseInt(m[7], 10) - 1;

    funcAnlaysis.cyclomaticComplexity = parseInt(m[2], 10);
    funcAnlaysis.numOfParameters = parseInt(m[4], 10);
    funcAnlaysis.linesOfCodeWithoutComments = parseInt(m[1], 10);
    funcAnlaysis.tokenCount = parseInt(m[3], 10);
    funcAnlaysis.lineStart = parseInt(m[7], 10) - 1;
    funcAnlaysis.lineEnd = parseInt(m[8], 10) - 1;
    funcAnlaysis.name = functionName;

    fileAnalysis.functionAnalysis.push(funcAnlaysis);

    if (((thresholdCyclomaticComplexity > 0)
            && (cyclomaticComplexity > thresholdCyclomaticComplexity))
      || ((thresholdNumberOfParameters > 0)
            && (numOfParameters > thresholdNumberOfParameters))
      || ((thresholdLinesOfCodeWithoutComments > 0)
            && (linesOfCodeWithoutComments > thresholdLinesOfCodeWithoutComments))
      || ((thresholdNumberOfTokens > 0)
            && (tokenCount > thresholdNumberOfTokens))) {
      // safety check if the opened file has changed.
      if (textEditor.getLineCount() < lineNumberInEditor) {
        return null;
      }
      const position = atomLinter.generateRange(textEditor, lineNumberInEditor);

      const message = {
        severity: 'warning',
        location: {
          file: textEditor.getPath(),
          position,
        },
        url: '',
      };

      if ((thresholdCyclomaticComplexity > 0)
          && (cyclomaticComplexity > thresholdCyclomaticComplexity)) {
        message.excerpt = `cyclomatic complexity of ${cyclomaticComplexity} is too high for function ${functionName}`;
        console.log(message.excerpt);
        toReturn.push(message);
      }

      if ((thresholdNumberOfParameters > 0)
          && (numOfParameters > thresholdNumberOfParameters)) {
        message.excerpt = `Too many parameters (${numOfParameters}>${thresholdNumberOfParameters}) for function ${functionName}`;
        console.log(message.excerpt);
        toReturn.push(message);
      }

      if ((thresholdLinesOfCodeWithoutComments > 0)
          && (linesOfCodeWithoutComments > thresholdLinesOfCodeWithoutComments)) {
        message.excerpt = `Too many lines of code (${linesOfCodeWithoutComments}>${thresholdLinesOfCodeWithoutComments}) in function ${functionName}`;
        console.log(message.excerpt);
        toReturn.push(message);
      }

      if ((thresholdNumberOfTokens > 0)
          && (tokenCount > thresholdNumberOfTokens)) {
        message.excerpt = `Too many tokens (${tokenCount}>${thresholdNumberOfTokens}) in function ${functionName}`;
        console.log(message.excerpt);
        toReturn.push(message);
      }
    }
  } // loop through all functions

  return toReturn;
}

export async function lint(textEditor) {
  const fileText = textEditor.getText();
  const stdout = await execLinterCmdLine(textEditor.getPath());

  // NOTE: Providers should also return null if they get null from exec
  // Returning null from provider will tell base linter to keep existing messages
  if (stdout === null || textEditor.getText() !== fileText) {
    // Editor text was modified since the lint was triggered, tell Linter not to update
    return null;
  }

  // Get the relevant part of stdout containing the function analysis.
  const regex = /-+(.*)1 file analyzed/gms;

  const m = regex.exec(stdout);

  let analyzedfunctionsString = m[1];
  analyzedfunctionsString = analyzedfunctionsString.trim().split('\n');

  fileAnalysis.fileName = textEditor.getFileName();
  fileAnalysis.functionAnalysis = [];

  return getLizardLintMessages(textEditor, analyzedfunctionsString);
}

export function activate() {
  subscriptions = new CompositeDisposable(
    //  an opener for our view.
    /* eslint-disable-next-line consistent-return */
    atom.workspace.addOpener((uri) => {
      if (uri === 'atom://lizard-linter') {
        if (lizardInfoView === undefined) {
          lizardInfoView = new LizardInfoView(fileAnalysis);
        } else {
          lizardInfoView.update(fileAnalysis);
        }
        return lizardInfoView;
      }
    }),

    // Register command that toggles this view
    atom.commands.add('atom-workspace', {
      'lizard-linter:toggle': () => this.toggle(),
    }),

    // Destroy any ActiveEditorInfoViews when the package is deactivated.
    new Disposable(() => {
      atom.workspace.getPaneItems().forEach((item) => {
        if (item instanceof LizardInfoView) {
          item.destroy();
        }
      });
    }),
  );

  subscriptions.add(atom.config.observe('lizard-linter.ExecuteLintOnFileOpenEvent', (value) => {
    executeLintOnFileOpenEvent = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.ExecuteLintOnFileSaveEvent', (value) => {
    executeLintOnFileSaveEvent = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.thresholdCyclomaticComplexity', (value) => {
    thresholdCyclomaticComplexity = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.thresholdNumberOfParameters', (value) => {
    thresholdNumberOfParameters = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.thresholdLinesOfCodeWithoutComments', (value) => {
    thresholdLinesOfCodeWithoutComments = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.thresholdNumberOfTokens', (value) => {
    thresholdNumberOfTokens = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.modifiedCyclomaticComplexityCalculation', (value) => {
    modifiedCyclomaticComplexityCalculation = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.excludeFiles', (value) => {
    excludeFiles = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.excludeFileExtensions', (value) => {
    excludeFileExtensions = value;
  }));

  subscriptions.add(atom.config.observe('lizard-linter.numberOfWorkingThreads', (value) => {
    numberOfWorkingThreads = value;
  }));
}

export function consumeIndie(registerIndie) {
  const linter = registerIndie({
    name: 'Lizard-Linter',
  });
  subscriptions.add(linter);

  // Setting and clearing messages per filePath
  subscriptions.add(atom.workspace.observeTextEditors(async (textEditor) => {
    const editorPath = textEditor.getPath();
    if (!editorPath) {
      return;
    }

    const editorFilePath = textEditor.getPath();
    const editorFileName = editorFilePath.split('\\').pop().split('/').pop();
    const editorFileExtension = editorFileName.split('.').pop();

    // Only check this file if not excluded by settings.
    if (excludeFiles.includes(editorFileName)
        || excludeFileExtensions.includes(editorFileExtension)) {
      return;
    }

    if (executeLintOnFileOpenEvent) {
      const messages = await lint(textEditor);
      linter.setMessages(textEditor.getPath(), messages);

      // update the info view if existing
      if (lizardInfoView) {
        lizardInfoView.update(fileAnalysis);
      }
    }

    const subscription2 = textEditor.onDidSave(async () => {
      if (executeLintOnFileSaveEvent) {
        const messages = await lint(textEditor);
        linter.setMessages(textEditor.getPath(), messages);

        // update the info view if existing
        if (lizardInfoView) {
          lizardInfoView.update(fileAnalysis);
        }
      }
      return null;
    });

    const subscription = textEditor.onDidDestroy(() => {
      subscriptions.remove(subscription);
      subscriptions.remove(subscription2);
      linter.setMessages(editorPath, []);

      subscription.dispose();
      subscription2.dispose();
    });

    subscriptions.add(subscription);
    subscriptions.add(subscription2);
  }));

  // Clear all messages
  linter.clearMessages();
}

export function toggle() {
  console.log('toggle');
  atom.workspace.toggle('atom://lizard-linter');
}

export function deactivate() {
  this.subscriptions.dispose();
}
