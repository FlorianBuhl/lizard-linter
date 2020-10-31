'use babel';

export default class LizardInfoView {
  /* serializedState is not used but its not possible to delete as the signature is coming
  from ATOM framework. */

  /* eslint-disable-next-line no-unused-vars */
  constructor(serializedState) {
    // Create root element
    this.element = document.createElement('div');
    this.element.classList.add('lizard-linter');

    // Create message element
    const message = document.createElement('div');
    message.textContent = 'The lizard-linter package is Alive! It\'s ALIVE!';
    message.classList.add('message');
    this.element.appendChild(message);

    this.subscriptions = atom.workspace.getCenter().observeActivePaneItem((item) => {
      if (!atom.workspace.isTextEditor(item)) {
        message.innerText = 'Open a file to see important information about it.';
        return;
      }
      message.innerHTML = `
    <h2>${item.getFileName() || 'untitled'}</h2>
    <ul>
      <li><b>Soft Wrap:</b> ${item.softWrapped}</li>
      <li><b>Tab Length:</b> ${item.getTabLength()}</li>
      <li><b>Encoding:</b> ${item.getEncoding()}</li>
      <li><b>Line Count:</b> ${item.getLineCount()}</li>
    </ul>
  `;
    });
  }

  // Returns an object that can be retrieved when package is activated
  serialize() {}

  // Tear down any state and detach
  destroy() {
    this.element.remove();
  }

  getElement() {
    return this.element;
  }

  getTitle() {
    // Used by Atom for tab text
    return 'Lizard info view';
  }

  getURI() {
  // Used by Atom to identify the view when toggling.
    return 'atom://lizard-linter';
  }

  getDefaultLocation() {
  // This location will be used if the user hasn't overridden it by dragging the item elsewhere.
  // Valid values are "left", "right", "bottom", and "center" (the default).
    return 'right';
  }

  getAllowedLocations() {
  // The locations into which the item can be moved.
    return ['left', 'right', 'bottom'];
  }
}
