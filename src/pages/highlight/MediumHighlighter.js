import '@webcomponents/custom-elements/custom-elements.min.js';
import { v4 as uuidv4 } from 'uuid';
import { styled, template } from './template';
import { removeHighlight } from '.';

class MediumHighlighter extends HTMLElement {
  constructor() {
    super();
    this.render();
  }

  get markerPosition() {
    return JSON.parse(this.getAttribute('markerPosition') || '{}');
  }

  get styleElement() {
    return this.shadowRoot.querySelector('style');
  }

  get highlightTemplate() {
    return this.shadowRoot.getElementById('highlightTemplate');
  }

  get mediumHighlighter() {
    return this.shadowRoot.getElementById('mediumHighlighter');
  }

  get menuHighlighter() {
    return this.shadowRoot.getElementById('menuHighlighter');
  }

  get btnDelete() {
    return this.shadowRoot.getElementById('btnDelete');
  }

  static get observedAttributes() {
    return ['markerPosition'];
  }

  render() {
    this.attachShadow({ mode: 'open' });
    const style = document.createElement('style');
    style.textContent = styled();
    this.shadowRoot.appendChild(style);
    this.shadowRoot.innerHTML += template;
    this.mediumHighlighter.addEventListener('click', () =>
      this.highlightSelection()
    );
    this.btnDelete.addEventListener('click', () => {
      const elementId = this.menuHighlighter.getAttribute('data-element-id');
      removeHighlight(elementId);
    });
  }

  attributeChangedCallback(name, oldValue, newValue) {
    if (name === 'markerPosition') {
    }
  }

  highlightSelection() {
    var userSelection = window.getSelection();
    for (let i = 0; i < userSelection.rangeCount; i++) {
      this.highlightRange(userSelection.getRangeAt(i));
    }
    window.getSelection().empty();
  }

  highlightRange(range) {
    const clone =
      this.highlightTemplate.cloneNode(true).content.firstElementChild;
    clone.id = `b-highlight-${uuidv4()}`;
    clone.appendChild(range.extractContents());
    range.insertNode(clone);
  }
}

window.customElements.define('medium-highlighter', MediumHighlighter);
