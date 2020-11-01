'use babel';

export default class LizardInfoView {
  /* serializedState is not used but its not possible to delete as the signature is coming
  from ATOM framework. */

  /* eslint-disable-next-line no-unused-vars */
  constructor(content) {
    // Create root element
    this.element = document.createElement('div');
    this.element.setAttribute('id', 'LizardLinterDiv');
    this.element.setAttribute('class', 'lizardLinterDiv');
    this.element.classList.add('lizard-linter');

    const sheet = document.styleSheets[0];
    sheet.insertRule('div.lizardLinterDiv { padding: 5px; }', 1);
    sheet.insertRule('table.lizardLinterTable { border: 1px solid black; border-collapse: collapse; }', 2);
    sheet.insertRule('th.lizardLinterTh { border: 1px solid black; border-collapse: collapse; text-align: center; padding: 5px; }', 3);
    sheet.insertRule('td.lizardLinterTd { border: 1px solid black; border-collapse: collapse; text-align: center; padding: 5px; }', 4);
    sheet.insertRule('table.lizardLinterTable td:nth-child(2) { width: 75px;}', 7);
    sheet.insertRule('table.lizardLinterTable td:nth-child(3) { width: 75px;}', 8);
    sheet.insertRule('table.lizardLinterTable td:nth-child(4) { width: 50px;}', 9);
    sheet.insertRule('table.lizardLinterTable td:nth-child(5) { width: 100px;}', 10);
    sheet.insertRule('table.lizardLinterTable td:nth-child(6) { width: 50px;}', 10);
    this.update(content);
  }

  update(content) {
    this.element.textContent = '';

    const heading = document.createElement('h2');
    heading.textContent = content.fileName;
    this.element.appendChild(heading);

    const table = document.createElement('table');
    table.setAttribute('class', 'lizardLinterTable');

    let tr = document.createElement('tr');
    tr.setAttribute('class', 'lizardLinterTr');

    let th = document.createElement('th');
    th.setAttribute('class', 'lizardLinterTh');
    th.textContent = 'function name';
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute('class', 'lizardLinterTh');
    th.textContent = 'line';
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute('class', 'lizardLinterTh');
    th.textContent = 'cyclomatic complexity';
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute('class', 'lizardLinterTh');
    th.textContent = 'param num';
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute('class', 'lizardLinterTh');
    th.textContent = 'lines of code w/o comments';
    tr.appendChild(th);

    th = document.createElement('th');
    th.setAttribute('class', 'lizardLinterTh');
    th.textContent = 'token Count';
    tr.appendChild(th);

    table.appendChild(tr);

    for (let i = 0; i < content.functionAnalysis.length; i += 1) {
      tr = document.createElement('tr');
      tr.setAttribute('class', 'lizardLinterTr');

      let td = document.createElement('td');
      td.setAttribute('class', 'lizardLinterTd');
      td.textContent = content.functionAnalysis[i].name;
      tr.appendChild(td);

      td = document.createElement('td');
      td.setAttribute('class', 'lizardLinterTd');
      td.textContent = `${content.functionAnalysis[i].lineStart}-${content.functionAnalysis[i].lineEnd}`;
      tr.appendChild(td);

      td = document.createElement('td');
      td.setAttribute('class', 'lizardLinterTd');
      td.textContent = content.functionAnalysis[i].cyclomaticComplexity;
      tr.appendChild(td);

      td = document.createElement('td');
      td.setAttribute('class', 'lizardLinterTd');
      td.textContent = content.functionAnalysis[i].numOfParameters;
      tr.appendChild(td);

      td = document.createElement('td');
      td.setAttribute('class', 'lizardLinterTd');
      td.textContent = content.functionAnalysis[i].linesOfCodeWithoutComments;
      tr.appendChild(td);

      td = document.createElement('td');
      td.setAttribute('class', 'lizardLinterTd');
      td.textContent = content.functionAnalysis[i].tokenCount;
      tr.appendChild(td);

      table.appendChild(tr);
    }

    this.element.appendChild(table);
  }

  // Returns an object that can be retrieved when package is activated
  /* eslint-disable-next-line class-methods-use-this */
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  /* eslint-disable-next-line class-methods-use-this */
  getTitle() {
    // Used by Atom for tab text
    return 'Lizard info view';
  }

  static getURI() {
  // Used by Atom to identify the view when toggling.
    return 'atom://lizard-linter';
  }

  /* eslint-disable-next-line class-methods-use-this */
  getDefaultLocation() {
  // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
  // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'right';
  }

  /* eslint-disable-next-line class-methods-use-this */
  getAllowedLocations() {
  // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }
}
