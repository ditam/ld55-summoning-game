
function getRandomItem(array) {
  return array[Math.floor(Math.random() * array.length)];
}
function deepCopy(o) {
  return JSON.parse(JSON.stringify(o));
}

// === end utils ===

let DEBUG = location && location.hostname==='localhost';
const grid = [];
const entries = [
  {
    name: 'Goat',
    grid: [
      [0, 2, 0],
      [1, 0, 3],
      [0, 0, 0]
    ],
    words: 'sim sal bimm'
  },
  {
    name: 'Bat',
    grid: [
      [0, 0, 0],
      [1, 2, 0],
      [0, 0, 3]
    ],
    words: 'fla fla suh'
  },
  {
    name: 'Imp',
    grid: [
      [0, 0, 0],
      [1, 0, 4],
      [2, 0, 3]
    ],
    words: 'Xla tum suh'
  }
];

(function validateBookEntries(){
  htPhrases = {};
  entries.forEach(e=>{
    console.assert(e.name, 'Missing entry name');
    console.assert(typeof e.words === 'string' && e.words.length >= 5, 'Missing entry phrase');
    // phrase should be unique - otherwise checking logic will need updates
    console.assert(!htPhrases[e.words], 'Phrase already used:', e.words)
    htPhrases[e.words] = true;
    htNums = {};
    e.grid.forEach(row => {
      row.forEach(cell => {
        if (cell && htNums[cell]) {
          console.assert(false, 'Duplicate index ', cell, ' in grid for: ', e.name);
        }
        htNums[cell] = true;
      })
      // TODO: could also check that indexes are consecutive
    });
  });
  console.log('--Validated book entries.--');
})();

function resetGrid() {
  grid[0] = [0, 0, 0];
  grid[1] = [0, 0, 0];
  grid[2] = [0, 0, 0];

  if (DEBUG) {
    $('#debug-log').text(`${grid[0]}\n${grid[1]}\n${grid[2]}`);
  }
}

function getNextIndex(grid) {
  let biggestSoFar = 0;
  grid.forEach(row => {
    row.forEach(cell => {
      if (cell > biggestSoFar) {
        biggestSoFar = cell;
      }
    })
  });
  return biggestSoFar + 1;
}

function removeMarker(grid, i, j) {
  const oldVal = grid[i][j];
  grid[i][j] = 0;
  // each cell that was after the removed val needs to be decreased by 1
  grid.forEach(row => {
    row.forEach((cell, _i) => {
      if (cell > oldVal) {
        row[_i] = cell-1;
      }
    })
  });
  console.assert(oldVal!==0, 'Unexpected marker removal:', deepCopy(grid), i, j);
}

let currentPhrase = '';
function updatePhrase() {
  $('#phrase-display').text(currentPhrase);
}

function validateSpell() {
  console.log('VALIDATING: ', deepCopy(grid), currentPhrase);
  const matchingEntries = entries.filter(e=>{
    return e.words.toLowerCase() === currentPhrase.toLowerCase();
  });
  let match;
  if (matchingEntries.length > 0) {
    const entry = matchingEntries[0];
    let hasError = false;
    entry.grid.forEach((row, i) => {
      row.forEach((cell, j) => {
        if (cell !== grid[i][j]) {
          hasError = true;
        }
      })
    });
    if (!hasError) {
      match = entry;
    }
    // TODO: action based on result, move to next or clear etc...
    if (match) {
      console.log(`=== MATCH: ${entry.name} ===`);
    } else {
      console.log(`No match: wrong grid for phrase of ${entry.name}`);
    }
  } else {
    console.log('No match: wrong phrase.')
  }
}

$(document).ready(function() {
  resetGrid();

  $('.row .cell').on('click', function() {
    const _cell = $(this);
    const j = _cell.index();
    const i = _cell.parent('.row').index();
    if (grid[i][j] === 0) {
      grid[i][j] = getNextIndex(grid);
    } else {
      removeMarker(grid, i, j);
    }
    _cell.toggleClass('selected');

    if (DEBUG) {
      $('#debug-log').text(`${grid[0]}\n${grid[1]}\n${grid[2]}`);
    }
  });

  $('#clear-button').on('click', function() {
    console.log('clear');
    resetGrid();
    $('.row .cell').removeClass('selected');
  });

  document.addEventListener('keyup', (event) => {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    const k = event.keyCode;
    if ((k >= 65 && k <= 90)) {
      // add key to text
      currentPhrase += event.key;
      updatePhrase();
    } else if (k === 13 || k === 32) { // Enter or space
      // TODO: check if 3rd, then validate spell
      if (currentPhrase.split(' ').length === 3) {
        validateSpell();
      } else {
        // add space to text
        currentPhrase += ' ';
        updatePhrase();
      }
    } else if (k === 8) { // backspace
      // remove a char
      currentPhrase = currentPhrase.slice(0, -1);
      updatePhrase();
    }
  });
});
