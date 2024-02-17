const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"></link>
<footer class="footer" pt-0 pb-0>
  <div class="content has-text-centered">
    <p>
      <strong id="title-element">Ultimate Tic Tac Toe</strong> by Giovanni Alayan
    </p>
  </div>
</footer>
`;

class CustomFooter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.titleHTML = this.shadowRoot.querySelector('#title-element');
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {}

  attributeChangedCallback(attributeName, oldVal, newVal) {
    //console.log(attributeName, oldVal, newVal);
    this.render;
  }

  static get observedAttributes() {
    return ['data-title'];
  }

  render() {
    const titleText = this.dataset.title ? this.dataset.title : '?';
    this.titleHTML.innerHTML = `${titleText}`;
  }
}

customElements.define('custom-footer', CustomFooter);
