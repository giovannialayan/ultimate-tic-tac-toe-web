const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"></link>
<nav class="navbar has-shadow is-white">
	<div class="navbar-brand">
		<a href="" class="navbar-item">
			<img src="images/logo.png" alt="logo" style="max-height: 70px" class="py-2 px-2">
		</a>
		<a class="navbar-burger" id="burger">
			<span></span>
			<span></span>
			<span></span>
		</a>
	</div>

	<div class="navbar-menu" id="nav-links">
		<div class="navbar-start">
            <a href="index.html" class="navbar-item">home</a>
			<a href="game.html" class="navbar-item">game</a>
			<a href="rules.html" class="navbar-item">rules</a>
			<a href="documentation.html" class="navbar-item">documentation</a>
		</div>
	</div>
</nav>
`;

class Navbar extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.burger = this.shadowRoot.querySelector('#burger');
    this.menu = this.shadowRoot.querySelector('#nav-links');

    const navbars = this.shadowRoot.querySelector('.navbar-start').childNodes;
    for (const item of navbars) {
      if (item.href == window.location) {
        item.classList.toggle('is-active');
      }
    }
  }

  connectedCallback() {
    this.burger.onclick = (e) => {
      this.menu.classList.toggle('is-active');
    };
    this.render();
  }

  disconnectedCallback() {
    this.burger.onclick = null;
  }

  attributeChangedCallback(attributeName, oldVal, newVal) {
    //console.log(attributeName, oldVal, newVal);
    this.render;
  }

  static get observedAttributes() {}

  render() {}
}

customElements.define('custom-navbar', Navbar);
