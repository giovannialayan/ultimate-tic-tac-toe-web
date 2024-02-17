import * as utils from './utils.js';

const template = document.createElement('template');
template.innerHTML = `
<link rel="stylesheet" href="https://cdn.jsdelivr.net/npm/bulma@0.9.3/css/bulma.min.css"></link>
<style>
    
</style>
<table class="table is-bordered is-striped has-text-centered">
    <tr>
        <th>red</th>
        <th>blue</th>
    <tr>
    <tr>
        <td id="redTime">0:00</td>
        <td id="blueTime">0:00</td>
    </tr>
</table>
<table id="moves" class="table is-bordered is-striped has-text-centered">
    <tr>
        <th>turn</th>
        <th>red</th>
        <th>blue</th>
    </tr>
</table> 
`;

class MoveHistory extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });

    this.shadowRoot.appendChild(template.content.cloneNode(true));

    this.table = this.shadowRoot.querySelector('#moves');

    this.moveNumber = 1;
    this.lastMove;
    this.currentRow;
    this.sectorLetters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I'];
    this.rowNumber = 1;
    this.time = { red: 0, blue: 0 };
    this.tdRedTime = this.shadowRoot.querySelector('#redTime');
    this.tdBlueTime = this.shadowRoot.querySelector('#blueTime');
    this.deltaTime = 1 / 60;
    this.timeOn = { red: false, blue: false };
  }

  connectedCallback() {
    this.render();
  }

  disconnectedCallback() {}

  attributeChangedCallback(attributeName, oldVal, newVal) {
    console.log(attributeName, oldVal, newVal);
    this.render();
  }

  static get observedAttributes() {
    return [];
  }

  render() {
    this.tdRedTime.innerHTML = utils.secondsToMinutes(this.time.red);
    this.tdBlueTime.innerHTML = utils.secondsToMinutes(this.time.blue);
  }

  logMove(sector, tile) {
    this.lastMove = `${this.sectorLetters[sector]},${tile + 1}`;
    if (this.moveNumber % 2 != 0) {
      this.currentRow = this.table.insertRow(this.rowNumber);
      for (let i = 0; i < 3; i++) {
        this.currentRow.insertCell(i);
      }
      this.currentRow.childNodes[0].innerHTML = this.rowNumber;
      this.currentRow.childNodes[1].innerHTML = this.lastMove;
    } else {
      this.currentRow.childNodes[2].innerHTML = this.lastMove;
      this.rowNumber++;
    }
    this.moveNumber++;
  }

  reset() {
    this.table.innerHTML = '';
    this.currentRow = this.table.insertRow(0);
    for (let i = 0; i < 3; i++) {
      this.currentRow.insertCell(i);
    }
    this.currentRow.childNodes[0].outerHTML = '<th>turn</th>';
    this.currentRow.childNodes[1].outerHTML = '<th>red</th>';
    this.currentRow.childNodes[2].outerHTML = '<th>blue</th>';
    this.moveNumber = 1;
    this.rowNumber = 1;

    this.time = { red: 0, blue: 0 };
    this.timeOn = { red: false, blue: false };
  }

  get playerTime() {
    return this.time;
  }

  set playerTime(value) {
    this.time = value;
    this.render();
  }

  countRedTime(element) {
    if (this.timeOn.red) {
      setTimeout(function () {
        element.countRedTime(element);
      }, 1000 * this.deltaTime);

      this.time.red -= this.deltaTime;

      if (this.time.red < 0) {
        this.time.red = 0;
        this.timeOn.red = false;
        this.timeOn.blue = false;
        this.timeReachedZero(1);
      }

      this.render();
    }
  }

  countBlueTime(element) {
    if (this.timeOn.blue) {
      setTimeout(function () {
        element.countBlueTime(element);
      }, 1000 * this.deltaTime);

      this.time.blue -= this.deltaTime;

      if (this.time.blue < 0) {
        this.time.blue = 0;
        this.timeOn.red = false;
        this.timeOn.blue = false;
        this.timeReachedZero(2);
      }

      this.render();
    }
  }

  startTime(player) {
    if (player == 1) {
      this.timeOn.red = true;

      this.countRedTime(this);
    } else {
      this.timeOn.blue = true;

      this.countBlueTime(this);
    }
  }

  stopTime(player) {
    if (player == 1) {
      this.timeOn.red = false;
    } else {
      this.timeOn.blue = false;
    }
  }

  timeReachedZero(player) {
    this.dispatchEvent(
      new CustomEvent('timeReachedZero', {
        detail: {
          player: player,
        },
      })
    );
  }
}

customElements.define('move-history', MoveHistory);
