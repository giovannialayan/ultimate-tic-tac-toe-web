let canvas;
let ctx;
let boardOffset;

let player1Active = true;
let tilesBySector = [
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
  [0, 0, 0, 0, 0, 0, 0, 0, 0],
];
let sectors = [0, 0, 0, 0, 0, 0, 0, 0, 0];
let turnSector = -1;
let winner = 0;

let moveHistory;

let botOn = false;

let timeOn = false;

let timeToSet = 0;

let timeSlider;
let timeSliderOutput;

let easyBotMoves = new Map();
let botLevel = 0;

import * as utils from './utils.js';

window.onload = init;

function init() {
  canvas = document.querySelector('canvas');
  boardOffset = 32;
  canvas.width = 531 + boardOffset;
  canvas.height = 531 + boardOffset;
  ctx = canvas.getContext('2d');
  resetBoard();

  canvas.onclick = (e) => {
    let rect = e.target.getBoundingClientRect();
    let mouseX = e.clientX - rect.x;
    let mouseY = e.clientY - rect.y;
    placeTile(mouseX, mouseY);
  };

  document.querySelector('#resetBoard').onclick = resetGame;

  moveHistory = document.querySelector('move-history');

  let botLevelRadios = document.querySelectorAll("input[name='botlevel']");

  //toggle bot button
  document.querySelector('#toggleEasyBot').onclick = (e) => {
    botOn = !botOn;
    e.target.innerHTML = botOn ? 'turn off bot' : 'turn on bot';

    for (let i = 0; i < botLevelRadios.length; i++) {
      if (botLevelRadios[i].checked) {
        botLevel = i;
      }
    }
    //console.log(botLevel);
  };

  //set time button
  document.querySelector('#setTime').onclick = (e) => {
    timeOn = !timeOn;
    moveHistory.playerTime = { red: timeOn ? timeToSet : 0, blue: timeOn ? timeToSet : 0 };
    e.target.innerHTML = timeOn ? 'remove timer' : 'set timer';

    if (timeOn) {
      moveHistory.startTime(player1Active ? 1 : 2);
    } else {
      moveHistory.stopTime(1);
      moveHistory.stopTime(2);
    }
  };

  timeSliderOutput = document.querySelector('#timeSliderOutput');
  timeSlider = document.querySelector('#timeSlider');

  //set timeToSet to inital value of slider
  timeToSet = utils.forceMultiple(timeSlider.value * 8.4, 60) + 60;
  timeSliderOutput.innerHTML = utils.secondsToMinutes(timeToSet);

  //time slider
  document.querySelector('#timeSlider').onchange = (e) => {
    timeToSet = utils.forceMultiple(e.target.value * 8.4, 60) + 60;
    timeSliderOutput.innerHTML = utils.secondsToMinutes(timeToSet);
    //e.target.value = timeToSet / 8.4;
  };

  //time reached zero event
  moveHistory.addEventListener('timeReachedZero', (e) => {
    winner = e.detail.player == 1 ? 2 : 1;
    ctx.save();
    ctx.globalAlpha = 0.5;
    ctx.fillStyle = winner == 1 ? 'red' : 'blue';
    let lineOffset = { x: 5.5, y: 5.5 };
    ctx.fillRect(lineOffset.x, lineOffset.y, canvas.width - lineOffset.x * 2, canvas.height - lineOffset.y * 2);
    ctx.restore();
  });

  //load bot moves
  utils.loadJsonFetch(parseBotMovesJson);
}

//clear board
function resetBoard() {
  ctx.save();
  //clear
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  //small vertical lines
  ctx.strokeStyle = '#777';
  ctx.lineWidth = 2;

  let lineOffset = 5.5;
  for (let i = 1; i < 9; i++) {
    if (i % 3 == 0) {
      lineOffset += 5;
    } else {
      ctx.beginPath();
      ctx.moveTo((canvas.width - boardOffset) * (i / 9) + lineOffset, 0);
      ctx.lineTo((canvas.width - boardOffset) * (i / 9) + lineOffset, canvas.height);
      ctx.stroke();
      ctx.closePath();

      lineOffset += 2;
    }
  }
  //small horizontal lines
  lineOffset = 5.5;
  for (let i = 1; i < 9; i++) {
    if (i % 3 == 0) {
      lineOffset += 5;
    } else {
      ctx.beginPath();
      ctx.moveTo(0, (canvas.height - boardOffset) * (i / 9) + lineOffset);
      ctx.lineTo(canvas.width, (canvas.height - boardOffset) * (i / 9) + lineOffset);
      ctx.stroke();
      ctx.closePath();

      lineOffset += 2;
    }
  }
  //outer border
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 5;
  ctx.beginPath();
  ctx.moveTo(ctx.lineWidth / 2, ctx.lineWidth / 2);
  ctx.lineTo(canvas.width - ctx.lineWidth / 2, ctx.lineWidth / 2);
  ctx.lineTo(canvas.width - ctx.lineWidth / 2, ctx.canvas.height - ctx.lineWidth / 2);
  ctx.lineTo(ctx.lineWidth / 2, canvas.height - ctx.lineWidth / 2);
  ctx.closePath();
  ctx.stroke();
  //large vertical lines
  lineOffset = 9.5;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo((canvas.width - boardOffset) * (i / 3) + lineOffset, 0);
    ctx.lineTo((canvas.width - boardOffset) * (i / 3) + lineOffset, canvas.height);
    ctx.stroke();
    ctx.closePath();

    lineOffset += 10;
  }
  //large horizontal lines
  lineOffset = 9.5;
  for (let i = 1; i < 3; i++) {
    ctx.beginPath();
    ctx.moveTo(0, (canvas.height - boardOffset) * (i / 3) + lineOffset);
    ctx.lineTo(canvas.width, (canvas.height - boardOffset) * (i / 3) + lineOffset);
    ctx.stroke();
    ctx.closePath();

    lineOffset += 9;
  }
  ctx.restore();
}

//resets canvas and game variables
function resetGame() {
  resetBoard();
  player1Active = true;
  tilesBySector = [
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
    [0, 0, 0, 0, 0, 0, 0, 0, 0],
  ];
  sectors = [0, 0, 0, 0, 0, 0, 0, 0, 0];
  turnSector = -1;
  winner = 0;
  moveHistory.reset();
}

//place tile
function placeTile(mouseX, mouseY) {
  let lineOffset = { x: 5.5, y: 5.5 };
  let tile = { x: -1, y: -1 };
  for (let i = 0; i < 9; i++) {
    if (mouseX > (canvas.width - boardOffset) * (i / 9) + lineOffset.x && mouseX < (canvas.width - boardOffset) * ((i + 1) / 9) + lineOffset.x) {
      tile.x = i;
      lineOffset.x = i + (1 % 3) == 0 ? lineOffset.x : lineOffset.x - 1;
      if (i > 2 && i % 3 == 0) {
        lineOffset.x += 2;
      }
    } else if (tile.x == -1) {
      if (i % 3 == 0 && i != 0) {
        lineOffset.x += 5;
      } else {
        lineOffset.x += 2;
      }
    }

    if (mouseY > (canvas.height - boardOffset) * (i / 9) + lineOffset.y && mouseY < (canvas.height - boardOffset) * ((i + 1) / 9) + lineOffset.y) {
      tile.y = i;
      lineOffset.y = i + (1 % 3) == 0 ? lineOffset.y : lineOffset.y - 1;
      if (i > 2 && i % 3 == 0) {
        lineOffset.y += 2;
      }
    } else if (tile.y == -1) {
      if (i % 3 == 0 && i != 0) {
        lineOffset.y += 5;
      } else {
        lineOffset.y += 2;
      }
    }
  }

  let sectorTile = absoluteTileToSectorTile(tile.x, tile.y);

  ctx.save();
  let color = player1Active ? 'red' : 'blue';
  ctx.fillStyle = color;

  if (
    tile.x != -1 &&
    tile.y != -1 &&
    tilesBySector[sectorTile[0]][sectorTile[1]] == 0 &&
    sectors[sectorTile[0]] == 0 &&
    winner == 0 &&
    (turnSector == sectorTile[0] || turnSector == -1)
  ) {
    ctx.fillRect(
      (canvas.width - boardOffset) * (tile.x / 9) + lineOffset.x,
      (canvas.width - boardOffset) * (tile.y / 9) + lineOffset.y,
      (canvas.width - boardOffset) / 9,
      (canvas.height - boardOffset) / 9
    );

    updateBoardState(player1Active ? 1 : 2, sectorTile[0], sectorTile[1]);

    if (sectors[sectorTile[0]] != 0) {
      ctx.globalAlpha = 0.5;
      switch (sectors[sectorTile[0]]) {
        case 1:
          ctx.fillStyle = 'red';
          break;

        case 2:
          ctx.fillStyle = 'blue';
          break;

        case 3:
          ctx.fillStyle = 'gray';
          break;

        default:
          console.log('default happened in sector square');
          break;
      }
      let sectorPos = SectorToAbsoluteSectorPos(sectorTile[0]);
      ctx.fillRect(sectorPos[0], sectorPos[1], (canvas.width - boardOffset) / 3, (canvas.height - boardOffset) / 3);
    }

    if (winner != 0) {
      ctx.globalAlpha = 0.5;
      switch (sectors[sectorTile[0]]) {
        case 1:
          ctx.fillStyle = 'red';
          break;

        case 2:
          ctx.fillStyle = 'blue';
          break;

        case 3:
          ctx.fillStyle = 'gray';
          break;

        default:
          console.log('default happened in winner square');
          break;
      }
      lineOffset = { x: 5.5, y: 5.5 };
      ctx.fillRect(lineOffset.x, lineOffset.y, canvas.width - lineOffset.x * 2, canvas.height - lineOffset.y * 2);
    }
  } else if (winner == 0) {
    let correctSector = SectorToAbsoluteSectorPos(turnSector);
    outlineSector(correctSector[0], correctSector[1], 1, 0.02);
  }

  ctx.restore();
}

//check for changes in board state
function updateBoardState(player, sector, tile) {
  tilesBySector[sector][tile] = player;

  //check end conditions for sector where move was made

  //cols
  for (let i = 0; i < 3; i++) {
    if (tilesBySector[sector][i] == player && tilesBySector[sector][i + 3] == player && tilesBySector[sector][i + 6] == player) {
      sectors[sector] = player;
      break;
    }
  }

  //rows
  for (let i = 0; i < 9; i += 3) {
    if (tilesBySector[sector][i] == player && tilesBySector[sector][i + 1] == player && tilesBySector[sector][i + 2] == player) {
      sectors[sector] = player;
      break;
    }
  }

  //diagonals
  if (tilesBySector[sector][0] == player && tilesBySector[sector][4] == player && tilesBySector[sector][8] == player) {
    sectors[sector] = player;
  } else if (tilesBySector[sector][2] == player && tilesBySector[sector][4] == player && tilesBySector[sector][6] == player) {
    sectors[sector] = player;
  }

  //draw
  if (sectors[sector] == 0) {
    for (let i = 0; i < tilesBySector[sector].length; i++) {
      if (tilesBySector[sector][i] == 0) {
        break;
      } else if (i == tilesBySector[sector].length - 1) {
        sectors[sector] = 3;
      }
    }
  }

  //check end condition for large board

  //cols
  for (let i = 0; i < 3; i++) {
    if (sectors[i] == player && sectors[i + 3] == player && sectors[i + 6] == player) {
      winner = player;
      break;
    }
  }

  //rows
  for (let i = 0; i < 9; i += 3) {
    if (sectors[i] == player && sectors[i + 1] == player && sectors[i + 2] == player) {
      winner = player;
      break;
    }
  }

  //diagonals
  if (sectors[0] == player && sectors[4] == player && sectors[8] == player) {
    winner = player;
  } else if (sectors[2] == player && sectors[4] == player && sectors[6] == player) {
    winner = player;
  }

  //draw
  if (winner == 0) {
    for (let i = 0; i < sectors.length; i++) {
      if (sectors[i] == 0) {
        break;
      } else if (i == sectors.length - 1) {
        winner = 3;
      }
    }
  }

  //console.log(sectors, winner);
  player1Active = !player1Active;
  turnSector = sectors[sector] || sectors[tile] != 0 ? -1 : tile;

  //log move and toggle timer for players
  moveHistory.logMove(sector, tile);
  if (timeOn) {
    moveHistory.stopTime(player1Active ? 2 : 1);
    if (winner == 0) {
      moveHistory.startTime(player1Active ? 1 : 2);
    }
  }

  //bot move
  if (botOn && !player1Active && winner == 0) {
    let botMoveSeconds = Math.floor(Math.random() * 3 + 1);
    setTimeout(selectBotMove, 1000 * botMoveSeconds);
  }
}

//gets tile position in sector,tile from col,row
function absoluteTileToSectorTile(col, row) {
  let sector = Math.floor(col / 3) + Math.floor(row / 3) * 3;
  let tile = (col % 3) + (row % 3) * 3;

  return [sector, tile];
}

//gets sector position in x,y from sector
function SectorToAbsoluteSectorPos(sector) {
  let col = sector % 3;
  let row = (sector - (sector % 3)) / 3;

  let lineOffset = { x: 5.5, y: 5.5 };

  for (let i = 0; i < col; i++) {
    lineOffset.x += 9;
  }
  for (let i = 0; i < row; i++) {
    lineOffset.y += 9;
  }

  return [(canvas.width - boardOffset) * (col / 3) + lineOffset.x, (canvas.width - boardOffset) * (row / 3) + lineOffset.y];
}

//gets tile position in x,y from sector tile
function SectorTileToAbsolutePos(sector, tile) {
  let col = (sector % 3) * 3 + (tile % 3);
  let row = sector - (sector % 3) + (tile - (tile % 3)) / 3;

  let lineOffset = { x: 5.5, y: 5.5 };

  for (let i = 0; i < col; i++) {
    if (i % 3 == 0 && i != 0) {
      lineOffset.x += 5;
    } else {
      lineOffset.x += 2;
    }
  }
  lineOffset.x = col + (1 % 3) == 0 ? lineOffset.x : lineOffset.x - 1;
  if (col > 2 && col % 3 == 0) {
    lineOffset.x += 2;
  }
  for (let i = 0; i < row; i++) {
    if (i % 3 == 0 && i != 0) {
      lineOffset.y += 5;
    } else {
      lineOffset.y += 2;
    }
  }
  lineOffset.y = row + (1 % 3) == 0 ? lineOffset.y : lineOffset.y - 1;
  if (row > 2 && row % 3 == 0) {
    lineOffset.y += 2;
  }

  return [(canvas.width - boardOffset) * (col / 9) + lineOffset.x, (canvas.width - boardOffset) * (row / 9) + lineOffset.y];
}

//show the sector the current player has to go in
function outlineSector(col, row, opacity, deltaOpacity) {
  let outLineWidth = (canvas.width - boardOffset) / 3 + 5.5 * 2;
  let outLineHeight = (canvas.height - boardOffset) / 3 + 5.5 * 2;

  if (turnSector == -1) {
    outLineWidth = canvas.width - 5.5;
    outLineHeight = canvas.height - 5.5;
    col = 5.5 + 5.5 / 2;
    row = 5.5 + 5.5 / 2;
  }

  refreshBoard();
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.strokeStyle = '#ff00bb';
  ctx.lineWidth = 5;
  ctx.strokeRect(col - 5.5, row - 5.5, outLineWidth, outLineHeight);
  ctx.restore();

  opacity -= deltaOpacity;
  deltaOpacity += 0.02;

  if (opacity > 0) {
    setTimeout(function () {
      outlineSector(col, row, opacity, deltaOpacity);
    }, 1000 / 30);
  }
}

//redraw canvas to current move
function refreshBoard() {
  resetBoard();

  ctx.save();
  for (let i = 0; i < tilesBySector.length; i++) {
    for (let j = 0; j < tilesBySector[i].length; j++) {
      if (tilesBySector[i][j] != 0) {
        let tilePos = SectorTileToAbsolutePos(i, j);
        ctx.fillStyle = tilesBySector[i][j] == 1 ? 'red' : 'blue';
        ctx.fillRect(tilePos[0], tilePos[1], (canvas.width - boardOffset) / 9, (canvas.height - boardOffset) / 9);
      }
    }
  }

  for (let i = 0; i < sectors.length; i++) {
    if (sectors[i] != 0) {
      ctx.globalAlpha = 0.5;
      switch (sectors[i]) {
        case 1:
          ctx.fillStyle = 'red';
          break;

        case 2:
          ctx.fillStyle = 'blue';
          break;

        case 3:
          ctx.fillStyle = 'gray';
          break;

        default:
          console.log('default happened in refresh board sector square');
          break;
      }
      let sectorPos = SectorToAbsoluteSectorPos(i);
      ctx.fillRect(sectorPos[0], sectorPos[1], (canvas.width - boardOffset) / 3, (canvas.height - boardOffset) / 3);
    }
  }
  ctx.restore();
}

//select move for bot
function selectBotMove() {
  let move = { sector: turnSector, tile: -1 };
  let pos = [-1, -1];

  switch (botLevel) {
    case 0:
      let possibleMoves = new Set();

      if (move.sector == -1) {
        let possibleSectors = new Set();

        for (let i = 0; i < sectors.length; i++) {
          if (sectors[i] == 0) {
            possibleSectors.add(i);
          }
        }

        move.sector = [...possibleSectors][Math.floor(Math.random() * possibleSectors.size)];
      }

      for (let i = 0; i < tilesBySector[move.sector].length; i++) {
        if (tilesBySector[move.sector][i] == 0) {
          possibleMoves.add(i);
        }
      }

      move.tile = [...possibleMoves][Math.floor(Math.random() * possibleMoves.size)];

      pos = SectorTileToAbsolutePos(move.sector, move.tile);
      break;

    case 1:
      if (move.sector == -1) {
        let secIndex = 0;
        while (move.sector == -1 && sectors.includes(0)) {
          move.sector = sectors[easyBotMoves.get(turnSector + '')[secIndex]] == 0 ? easyBotMoves.get(turnSector + '')[secIndex] : -1;
          secIndex++;
        }
      }

      let tileIndex = 0;
      while (move.tile == -1 && tilesBySector[move.sector].includes(0)) {
        move.tile =
          tilesBySector[move.sector][easyBotMoves.get(move.sector + '')[tileIndex]] == 0 ? easyBotMoves.get(move.sector + '')[tileIndex] : -1;
        tileIndex++;
      }

      pos = SectorTileToAbsolutePos(move.sector, move.tile);
      break;

    default:
      console.log('default occurred in selectBotMove');
      break;
  }

  placeTile(pos[0] + 5, pos[1] + 5);
}

//parse json into bot moves
function parseBotMovesJson(json) {
  const keys = Object.keys(json);
  for (let k of keys) {
    easyBotMoves.set(k, json[k]);
  }
}
