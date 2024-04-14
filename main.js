
const WIDTH = 800;
const HEIGHT = 500;

let ctx;
let DEBUG = location && location.hostname==='localhost';

let gesture;

function drawFrame(timestamp) {
  ctx.clearRect(0, 0, WIDTH, HEIGHT);

  if (isDrawing) {
    const start = gesture.history[0];
    const end = gesture.history[gesture.history.length -1];
    if (!gesture.direction) {
      ctx.fillRect(start.x, start.y, 5, 5);
    } else {
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      let targetX, targetY;
      let xDiff = end.x - start.x; // will be positive
      let yDiff = end.y - start.y; // will be negative
      let diff = Math.max(Math.abs(xDiff), Math.abs(yDiff));

      switch(gesture.direction) {
        case '0-': // up
        case '0+': // down
          // no horizontal: lock X to start
          targetX = start.x;
          targetY = end.y;
          break;
        case '+-': // up-right
          targetX = start.x + diff;
          targetY = start.y - diff;
          break;
        case '-+': // down-left
          targetX = start.x - diff;
          targetY = start.y + diff;
          break;
        case '+0': // right
        case '-0': // left
          // lock vertical: lock Y to start
          targetX = end.x;
          targetY = start.y;
          break;
        case '++': // down-right
          targetX = start.x + diff;
          targetY = start.y + diff;
          break;
        case '--': // up-left
          targetX = start.x - diff;
          targetY = start.y - diff;
          break;
        default:
          console.error('Unknown dir:', gesture.direction);
      }
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
    }
  }

  requestAnimationFrame(drawFrame);
}

let isDrawing = false;
function startDrawing(e) {
  gesture = {
    history: [],
  };
  isDrawing = true;
  updateMousePos(e);
}

const DIR = {
  '0-': '0-', // up
  '+-': '+-', // up-right
  '+0': '+0', // right
  '++': '++', // down-right
  '0+': '0+', // down
  '-+': '-+', // down-left
  '-0': '-0', // left
  '--': '--', // up-left
};
let done = false;
function updateMousePos(e) {
  if (DEBUG) {
    $('#debug-log').text(`mouse x:${e.clientX} y:${e.clientY}`);
  }

  if (!isDrawing) {
    return;
  }

  const g = gesture;
  g.history.push({
    x: e.clientX,
    y: e.clientY,
  });
  const BUFFER_SIZE = 9;
  if (g.history.length > BUFFER_SIZE && !done) {
    console.log('GESTURE:');
    const xDiffs = [];
    const yDiffs = [];
    for (let i=0; i<BUFFER_SIZE; i++) {
      const a = g.history[i];
      const b = g.history[i+1];
      console.log(a, b, `-> dX ${b.x-a.x} dY ${b.y-a.y}`);
      xDiffs.push(b.x - a.x);
      yDiffs.push(b.y - a.y);
    }
    const xAvg = xDiffs.reduce((v, s) => v + s, 0) / xDiffs.length;
    const yAvg = yDiffs.reduce((v, s) => v + s, 0) / yDiffs.length;
    let _direction = '';
    if (xAvg < 0) {
      _direction = '-';
    } else if (xAvg === 0) {
      _direction = '0';
    } else {
      _direction = '+';
    }
    if (yAvg < 0) {
      _direction += '-';
    } else if (yAvg === 0) {
      _direction += '0';
    } else {
      _direction += '+';
    }
    g.direction = _direction;
    done = true;
    console.log(`xAvg: ${xAvg}, yAvg: ${yAvg}`);
    console.log(`dir: ${_direction}`);
  }
  g.x = e.clientX;
  g.y = e.clientY;
}

function stopDrawing() {
  isDrawing = false;
  done = false;
}

$(document).ready(function() {
  console.log('Hello Canvas!');

  const canvas = document.getElementById('main-canvas');
  $(canvas).attr('height', HEIGHT);
  $(canvas).attr('width', WIDTH);

  ctx = canvas.getContext('2d');

  ctx.fillStyle = 'red';
  ctx.strokeStyle = 'red';
  ctx.lineWidth = 3;

  document.addEventListener('mousedown', startDrawing);
  document.addEventListener('mousemove', updateMousePos);
  document.addEventListener('mouseup', stopDrawing);

  drawFrame();
});
