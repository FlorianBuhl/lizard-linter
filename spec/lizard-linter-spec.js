'use babel';

import * as path from 'path';

const { lint } = require('../lib/lizard-linter.js').provideLinter();

const basePath = path.join(__dirname, 'files');

function CheckFileExtension(pathToTestFolder, language, fileEnding, badFunctionName) {
  describe(`The lizard tool can handle ${language} files`, () => {
    const goodPath = path.join(pathToTestFolder, language, 'good.') + fileEnding;
    const badPath = path.join(pathToTestFolder, language, 'bad.') + fileEnding;
    const emptyPath = path.join(pathToTestFolder, language, 'empty.') + fileEnding;

    beforeEach(async () => {
      await atom.packages.activatePackage('lizard-linter');

      // set the value for cyclomatic complexity threshold very low in order
      // to have smaller test files (e.g. bad.py)
      atom.config.set('lizard-linter.thresholdCyclomaticComplexity', '2');
    });

    it(`checks bad.${fileEnding} and reports the correct results`, async () => {
      const editor = await atom.workspace.open(badPath);
      const messages = await lint(editor);

      expect(messages.length).toBe(1);
      expect(messages[0].severity).toBe('warning');
      expect(messages[0].excerpt).toBe(`cyclomatic complexity of 3 is too high for function ${badFunctionName}`);
      expect(messages[0].location.file).toBe(badPath);
      expect(messages[0].url).toBe('');
    });

    it(`finds nothing wrong with an empty.${fileEnding} file`, async () => {
      const editor = await atom.workspace.open(emptyPath);
      const messages = await lint(editor);
      expect(messages).toBe(null);
    });

    it(`finds nothing wrong with good.${fileEnding} file`, async () => {
      const editor = await atom.workspace.open(goodPath);
      const messages = await lint(editor);
      expect(messages.length).toBe(0);
    });
  });
}

describe('The lizard provider for Linter', () => {
  beforeEach(async () => {
    await atom.packages.activatePackage('lizard-linter');
  });

  it('should be in the packages list', () => {
    expect(atom.packages.isPackageLoaded('lizard-linter')).toBe(true);
  });

  it('should be an active package', () => {
    expect(atom.packages.isPackageActive('lizard-linter')).toBe(true);
  });
});

CheckFileExtension(basePath, 'c', 'c', 'bad_function');
CheckFileExtension(basePath, 'c', 'h', 'bad_function');
CheckFileExtension(basePath, 'cpp', 'cpp', 'bad_function');
CheckFileExtension(basePath, 'java', 'java', 'TestClass::bad_function');
CheckFileExtension(basePath, 'CSharp', 'cs', 'bad_function');
CheckFileExtension(basePath, 'JavaScript', 'js', 'bad_function');
CheckFileExtension(basePath, 'ObjectiveC', 'm', 'bad_function');
CheckFileExtension(basePath, 'swift', 'swift', 'bad_function');
CheckFileExtension(basePath, 'python', 'py', 'bad_function');
CheckFileExtension(basePath, 'ruby', 'rb', 'bad_function');
CheckFileExtension(basePath, 'php', 'php', 'bad_function');
CheckFileExtension(basePath, 'scala', 'scala', 'bad_function');
CheckFileExtension(basePath, 'GDScript', 'gd', 'bad_function');
CheckFileExtension(basePath, 'GoLang', 'go', 'bad_function');
CheckFileExtension(basePath, 'lua', 'lua', 'bad_function');
CheckFileExtension(basePath, 'rust', 'rs', 'bad_function');

describe('The lizard tool analyzes functions', () => {
  beforeEach(async () => {
    await atom.packages.activatePackage('lizard-linter');

    // set the value for cyclomatic complexity threshold very low in order
    // to have smaller test files (e.g. bad.py)
    atom.config.set('lizard-linter.thresholdCyclomaticComplexity', '2');
    atom.config.set('lizard-linter.thresholdNumberOfParameters', '5');
    atom.config.set('lizard-linter.thresholdLinesOfCodeWithoutComments', '10');
    atom.config.set('lizard-linter.thresholdNumberOfTokens', '69');
  });

  it('analyzes the number of parameters', async () => {
    const badPath = path.join(basePath, 'very_bad.py');
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages[0].severity).toBe('warning');
    expect(messages[0].excerpt).toBe('Too many parameters (6>5) for function too_many_parameters');
    expect(messages[0].location.file).toBe(badPath);
    expect(messages[0].location.position).toEqual([[3, 0], [3, 60]]);
    expect(messages[0].url).toBe('');
  });
  it('analyzes the number of code lines without comments', async () => {
    const badPath = path.join(basePath, 'very_bad.py');
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages[1].severity).toBe('warning');
    expect(messages[1].excerpt).toBe('Too many lines of code (11>10) in function too_long_function');
    expect(messages[1].location.file).toBe(badPath);
    expect(messages[1].location.position).toEqual([[15, 0], [15, 24]]);
    expect(messages[1].url).toBe('');
  });

  it('analyzes the number of tokens', async () => {
    const badPath = path.join(basePath, 'very_bad.py');
    const editor = await atom.workspace.open(badPath);
    const messages = await lint(editor);

    expect(messages[2].severity).toBe('warning');
    expect(messages[2].excerpt).toBe('Too many tokens (70>69) in function too_many_tokens');
    expect(messages[2].location.file).toBe(badPath);
    expect(messages[2].location.position).toEqual([[42, 0], [42, 40]]);
    expect(messages[2].url).toBe('');
  });
});
