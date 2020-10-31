'use babel';

import { CompositeDisposable } from 'atom';

const atomLinter = require('atom-linter');

export default {
  subscriptions: null,

  /* state is not used but its not possible to delete as the signature is coming
  from ATOM framework. */

  /* eslint-disable-next-line no-unused-vars */
  activate(state) {
    this.subscriptions = new CompositeDisposable();

    this.subscriptions.add(atom.config.observe('lizard-linter.thresholdCyclomaticComplexity', (value) => {
      this.thresholdCyclomaticComplexity = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-linter.thresholdNumberOfParameters', (value) => {
      this.thresholdNumberOfParameters = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-linter.thresholdLinesOfCodeWithoutComments', (value) => {
      this.thresholdLinesOfCodeWithoutComments = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-linter.thresholdNumberOfTokens', (value) => {
      this.thresholdNumberOfTokens = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-linter.modifiedCyclomaticComplexityCalculation', (value) => {
      this.modifiedCyclomaticComplexityCalculation = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-linter.excludeFiles', (value) => {
      this.excludeFiles = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-linter.excludeFileExtensions', (value) => {
      this.excludeFileExtensions = value;
    }));

    this.subscriptions.add(atom.config.observe('lizard-linter.numberOfWorkingThreads', (value) => {
      this.numberOfWorkingThreads = value;
    }));
  },

  deactivate() {
    this.subscriptions.dispose();
  },

  provideLinter() {
    return {
      name: 'Lizard',
      scope: 'file',
      lintsOnChange: false,
      grammarScopes: ['source.c', 'source.h', 'source.cpp', 'source.java', 'source.cs', 'source.js', 'source.m', 'source.objc', 'source.objcpp', 'source.swift', 'source.python', 'source.python.django', 'source.ruby', 'text.html.php', 'source.php', 'source.scala', 'source.go', 'source.lua', 'source.rust'],
      lint: async (editor) => {
        const textEditor = editor;
        const fileText = textEditor.getText();
        const editorFilePath = textEditor.getPath();
        const editorFileName = editorFilePath.split('\\').pop().split('/').pop();
        const editorFileExtension = editorFileName.split('.').pop();
        const args = [editorFilePath];

        // Only check this file if not excluded by settings.
        if (this.excludeFiles.includes(editorFileName)
            || this.excludeFileExtensions.includes(editorFileExtension)) {
          return null;
        }

        // Do a modified cyclomatic complexity calculation if requested by setting.
        if (this.modifiedCyclomaticComplexityCalculation) {
          args.push('--modified');
        }

        args.push(`--working_threads=${this.numberOfWorkingThreads}`);

        console.log(`editorFilePath ${editorFilePath}`);
        console.log(`editorFileName ${editorFileName}`);
        console.log(`editorFileExtension ${editorFileExtension}`);
        console.log(`this.modifiedCyclomaticComplexityCalculation ${this.modifiedCyclomaticComplexityCalculation}`);
        console.log(`this.numberOfWorkingThreads ${this.numberOfWorkingThreads}`);
        console.log(`args ${args}`);

        const execOpts = { stream: 'both' };
        execOpts.timeout = Infinity;

        const data = await atomLinter.exec('lizard', args, execOpts);
        const { stdout, stderr, exitCode } = data;
        if (exitCode !== 0 && stderr !== '') {
          console.log('aah error');
          console.log(`exitCode ${exitCode}`);
          console.log(`stderr ${stderr}`);
          throw new Error(stderr);
        }
        // NOTE: Providers should also return null if they get null from exec
        // Returning null from provider will tell base linter to keep existing messages
        if (stdout === null || editor.getText() !== fileText) {
          // Editor text was modified since the lint was triggered, tell Linter not to update
          return null;
        }

        // process data
        console.log(stdout);

        // Get the relevant part of stdout containing the function analysis.
        let regex = /-+(.*)1 file analyzed/gms;

        let m;
        m = regex.exec(stdout);

        let analyzedfunctionsString = m[1];
        analyzedfunctionsString = analyzedfunctionsString.trim().split('\n');

        const toReturn = [];

        // loop through all functions
        for (let i = 0; i < analyzedfunctionsString.length; i += 1) {
          const line = analyzedfunctionsString[i];
          regex = /\s?(\d+)\s+(\d+)\s+(\d+)\s+(\d+)\s+(\d+) (.*)@(\d+)-\d+@/gm;
          m = regex.exec(line);

          if (m === null) {
            return null;
          }
          if (m > 0) {
            console.log('test');
          }

          const linesOfCodeWithoutComments = parseInt(m[1], 10);
          const cyclomaticComplexity = parseInt(m[2], 10);
          const tokenCount = parseInt(m[3], 10);
          const numOfParameters = parseInt(m[4], 10);
          const functionName = m[6];
          const lineNumberInEditor = parseInt(m[7], 10) - 1;

          if (((this.thresholdCyclomaticComplexity > 0)
                  && (cyclomaticComplexity > this.thresholdCyclomaticComplexity))
            || ((this.thresholdNumberOfParameters > 0)
                  && (numOfParameters > this.thresholdNumberOfParameters))
            || ((this.thresholdLinesOfCodeWithoutComments > 0)
                  && (linesOfCodeWithoutComments > this.thresholdLinesOfCodeWithoutComments))
            || ((this.thresholdNumberOfTokens > 0)
                  && (tokenCount > this.thresholdNumberOfTokens))) {
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

            if ((this.thresholdCyclomaticComplexity > 0)
                && (cyclomaticComplexity > this.thresholdCyclomaticComplexity)) {
              message.excerpt = `cyclomatic complexity of ${cyclomaticComplexity} is too high for function ${functionName}`;
              console.log(message.excerpt);
              toReturn.push(message);
            }

            if ((this.thresholdNumberOfParameters > 0)
                && (numOfParameters > this.thresholdNumberOfParameters)) {
              message.excerpt = `Too many parameters (${numOfParameters}>${this.thresholdNumberOfParameters}) for function ${functionName}`;
              console.log(message.excerpt);
              toReturn.push(message);
            }

            if ((this.thresholdLinesOfCodeWithoutComments > 0)
                && (linesOfCodeWithoutComments > this.thresholdLinesOfCodeWithoutComments)) {
              message.excerpt = `Too many lines of code (${linesOfCodeWithoutComments}>${this.thresholdLinesOfCodeWithoutComments}) in function ${functionName}`;
              console.log(message.excerpt);
              toReturn.push(message);
            }

            if ((this.thresholdNumberOfTokens > 0)
                && (tokenCount > this.thresholdNumberOfTokens)) {
              message.excerpt = `Too many tokens (${tokenCount}>${this.thresholdNumberOfTokens}) in function ${functionName}`;
              console.log(message.excerpt);
              toReturn.push(message);
            }
          }
        } // loop through all functions

        console.log(`messages ${toReturn}`);
        return toReturn;
      },
    };
  },
};
