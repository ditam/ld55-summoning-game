
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
    asset: 'goat.png',
    grid: [
      [0, 2, 0],
      [1, 0, 3],
      [0, 0, 0]
    ],
    words: 'Sim Sal Bimm'
  },
  {
    name: 'Bat',
    asset: 'bat.png',
    grid: [
      [0, 0, 0],
      [1, 2, 0],
      [0, 0, 3]
    ],
    words: 'Fla Fla Suh'
  },
  {
    name: 'Imp',
    asset: 'imp.png',
    grid: [
      [0, 0, 0],
      [1, 0, 4],
      [2, 0, 3]
    ],
    words: 'Abr Kad Dabr'
  },
  {
    name: 'Gorgoth',
    asset: 'devil.png',
    grid: [
      [0, 0, 3],
      [1, 0, 0],
      [0, 0, 2]
    ],
    words: 'Xla Fla Mon'
  },
  {
    name: 'Shra-mun',
    asset: 'tentacle.png',
    grid: [
      [0, 3, 0],
      [0, 2, 0],
      [0, 1, 0]
    ],
    words: 'Mun Ten Tacl'
  },
  {
    name: 'Kla Udd',
    asset: 'cloud.png',
    grid: [
      [0, 3, 0],
      [2, 0, 4],
      [0, 1, 0]
    ],
    words: 'Ren Ren Kla'
  },
  {
    name: 'Oztl Unn',
    asset: 'evil.png',
    grid: [
      [0, 2, 0],
      [4, 0, 5],
      [1, 0, 3]
    ],
    words: 'Xla Tum Suh'
  }
];

(function validateBookEntries(){
  htPhrases = {};
  entries.forEach(e=>{
    console.assert(e.name, 'Missing entry name');
    console.assert(e.asset, 'Missing entry asset');
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
      console.log(`=== SUMMONING: ${entry.name} ===`);
      const demon = $('<img>').addClass('demon').attr(
        'src', `assets/${entry.asset}`
      ).appendTo($('#main-wrapper'));
      $('#grid .cell').addClass('summoning');
      setTimeout(function() {
        demon.remove();
        $('#grid .cell').removeClass('summoning');
        // check if task was completed
        if (match !== tasks[currentTask]) {
          console.log(`No match: wrong summon.`);
          totalAttempts++;
          score-=200;
          // TODO: play sound
        } else {
          console.log('MATCH, task completed.');
          totalAttempts++;
          score+=500;
          if (currentTask < 6) {
            currentTask++;
            $('#task-container .task').eq(0).remove();
          } else {
            console.log('END');
            const endTime = new Date();
            var timeDiff = endTime - startTime; // in ms
            timeDiff /= 1000;
            var totalSeconds = Math.round(timeDiff);
            $('<div>').addClass('msg').text(`Congratulations! Your final score is ${score} (${totalAttempts} attempts, ${totalSeconds} seconds). Thank you for playing!`);
          }
        }
        clear();
      }, 4000);
    } else {
      console.log(`No match: wrong grid for phrase of ${entry.name}`);
      totalAttempts++;
      score-=50;
      // TODO: play sound
      setTimeout(clear, 500);
    }
  } else {
    console.log('No match: wrong phrase.')
    totalAttempts++;
    score-=10;
    // TODO: play sound
    setTimeout(clear, 500);
  }
}

function toggleBook() {
  $('#handbook-container').toggleClass('open closed');
}

let currentPage = 0;
function generateBook() {
  const container = $('#handbook-container');
  const book = $('<div>').addClass('book').appendTo(container);
  const backButton = $('<div>').addClass('button back').text('<-').appendTo(book);
  backButton.on('click', ()=>{
    currentPage = Math.max(currentPage-1, 0);
    $('.book .page').addClass('hidden');
    $('.book .page').eq(currentPage).removeClass('hidden');
  });
  const forwardButton = $('<div>').addClass('button forward').text('->').appendTo(book);
  forwardButton.on('click', ()=>{
    currentPage = Math.min(currentPage+1, entries.length-1);
    $('.book .page').addClass('hidden');
    $('.book .page').eq(currentPage).removeClass('hidden');
  });

  const pages = $('<div>').addClass('pages').appendTo(book);
  entries.forEach(e => {
    const page = $('<div>').addClass('page hidden');
    $('<div>').addClass('header').text(e.name).appendTo(page);
    $('<div>').addClass('img-container').css(
      'background-image', `url(assets/${e.asset})`
    ).appendTo(page);
    $('<div>').addClass('grid-1').text(e.grid[0].join(' ')).appendTo(page);
    $('<div>').addClass('grid-2').text(e.grid[1].join(' ')).appendTo(page);
    $('<div>').addClass('grid-3').text(e.grid[2].join(' ')).appendTo(page);
    $('<div>').addClass('phrase-container').text(e.words).appendTo(page);
    page.appendTo(pages);
  });

  // show first page
  $('.book .page').eq(currentPage).removeClass('hidden');

  book.appendTo(container);
}

function clear() {
  console.log('clear');
  resetGrid();
  currentPhrase = '';
  updatePhrase();
  $('.row .cell').removeClass('selected');
}

let currentTask = 0;
const tasks = [];
function getTaskDOM(entry) {
  const task = $('<div>').addClass('task');
  $('<img>').attr(
    'src', `assets/${entry.asset}`
  ).appendTo(task);
  $('<div>').addClass('name').text(entry.name).appendTo(task);
  return task;
}
function generateTasks() {
  const list = $('#task-container');
  tasks.push(entries[0]); // always start with goat
  htDone = {
    'Goat': true,
  };
  let count = 0;
  for (let i=0; i<5; i++) { // 5 more - if you edit, make sure there's enough to choose from
    let entry;
    do {
      entry = getRandomItem(entries);
      count++;
    } while (htDone[entry.name] || count > 1000);
    htDone[entry.name] = true;
    tasks.push(entry);
  }
  console.log(tasks);
  console.log(`Tasks generated - took ${count} tries.`);

  tasks.forEach(entry=>{
    const taskDom = getTaskDOM(entry);
    list.append(taskDom);
  });
}

let startTime;
let score = 0;
let totalAttempts = 0;
$(document).ready(function() {
  resetGrid();
  generateBook();
  generateTasks();

  startTime = new Date();

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
  });

  $('#clear-button').on('click', clear);

  $('#book-button').on('click', function() {
    console.log('toggle book');
    toggleBook();
  });

  document.addEventListener('keydown', (event) => {
    if (event.isComposing || event.keyCode === 229) {
      return;
    }

    // It seems like we can't catch Tabs on keyup after the browser handles it
    if (event.key === 'Tab') {
      toggleBook();
      event.stopPropagation();
      event.preventDefault();
    }
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
