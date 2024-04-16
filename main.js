
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
      let demon;
      const hums = [humSound1, humSound2, humSound3];
      const selectedHums = [
        getRandomItem(hums),
        getRandomItem(hums),
        getRandomItem(hums)
      ];
      // immediately start playing 3 hums
      selectedHums[0].currentTime = 0;
      selectedHums[0].play();
      setTimeout(function(){
        selectedHums[1].currentTime = 0;
        selectedHums[1].play();
      }, 1400);
      setTimeout(function(){
        selectedHums[2].currentTime = 0;
        selectedHums[2].play();
      }, 3000);
      // delay the summoning
      setTimeout(function() {
        demon = $('<img>').addClass('demon').attr(
          'src', `assets/${entry.asset}`
        ).appendTo($('#main-wrapper'));
        $('#grid .cell').addClass('summoning');
        summonSound.play();
      }, 3000);
      setTimeout(function() {
        demon.remove();
        $('#grid .cell').removeClass('summoning');
        // check if task was completed
        if (match !== tasks[currentTask]) {
          console.log(`No match: wrong summon.`);
          errorSound.play();
          totalAttempts++;
          score-=200;
          // TODO: play sound
        } else {
          console.log('MATCH, task completed.');
          totalAttempts++;
          score+=500;
          $('#task-container .task').eq(0).remove();
          if (currentTask < 5) {
            currentTask++;
          } else {
            console.log('END');
            const endTime = new Date();
            var timeDiff = endTime - startTime; // in ms
            timeDiff /= 1000;
            var totalSeconds = Math.round(timeDiff);
            if (totalSeconds < 300) {
              score += (300 - totalSeconds) * 10;
            }
            const msg = $('<div>').addClass('msg').text(`Congratulations! Your final score is ${score} (${totalAttempts} attempts, ${totalSeconds} seconds). Thank you for playing!`);
            msg.appendTo($('#main-wrapper'));
          }
        }
        clear();
      }, 7000);
    } else {
      console.log(`No match: wrong grid for phrase of ${entry.name}`);
      errorSound.play();
      totalAttempts++;
      score-=50;
      // TODO: play sound
      setTimeout(clear, 500);
    }
  } else {
    console.log('No match: wrong phrase.');
    errorSound.play();
    totalAttempts++;
    score-=10;
    // TODO: play sound
    setTimeout(clear, 500);
  }
}

function toggleBook() {
  $('#handbook-container').toggleClass('open closed');
  bookSound.currentTime = 0;
  bookSound.play();
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
    pageSound.currentTime = 0;
    pageSound.play();
  });
  const forwardButton = $('<div>').addClass('button forward').text('->').appendTo(book);
  forwardButton.on('click', ()=>{
    currentPage = Math.min(currentPage+1, entries.length-1);
    $('.book .page').addClass('hidden');
    $('.book .page').eq(currentPage).removeClass('hidden');
    pageSound.currentTime = 0;
    pageSound.play();
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
  candleOffSound.currentTime = 0;
  candleOffSound.play();
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

let songs, sounds;
let humSound1, humSound2, humSound3;
let errorSound, summonSound;
let candleOnSound, candleOffSound;
let bookSound, pageSound;
$(document).ready(function() {
  resetGrid();
  generateBook();
  generateTasks();

  songs = [
    new Audio('assets/song.ogg')
  ];

  bookSound = new Audio('assets/book.mp3');
  pageSound = new Audio('assets/page.mp3');
  candleOnSound = new Audio('assets/candle_on.mp3');
  candleOnSound = new Audio('assets/candle_on.mp3');
  candleOffSound = new Audio('assets/candle_off.mp3');
  errorSound = new Audio('assets/error.mp3');
  summonSound = new Audio('assets/summon.mp3');
  humSound1 = new Audio('assets/hum1.mp3');
  humSound2 = new Audio('assets/hum2.mp3');
  humSound3 = new Audio('assets/hum3.mp3');

  sounds = [
    bookSound,
    pageSound,
    errorSound,
    summonSound,
    candleOnSound,
    candleOffSound,
    humSound1,
    humSound2,
    humSound3
  ];

  let audioLoadCount = 0;
  $('#loadCountTotal').text(songs.length + sounds.length);
  function countWhenLoaded(audioElement) {
    audioElement.addEventListener('canplaythrough', function() {
      audioLoadCount++;
      $('#loadCount').text(audioLoadCount);
    }, false);
  }

  songs.forEach(countWhenLoaded);
  sounds.forEach(countWhenLoaded);

  $('#splash').on('click', function() {
    $('#splash').remove();
    songs[0].play();
    songs[0].addEventListener('ended', function() {
      this.currentTime = 0;
      this.play();
    }, false);
  });

  startTime = new Date();

  $('.row .cell').on('click', function() {
    const _cell = $(this);
    const j = _cell.index();
    const i = _cell.parent('.row').index();
    if (grid[i][j] === 0) {
      grid[i][j] = getNextIndex(grid);
      // reset sound to allow quick repeated playing
      candleOnSound.currentTime = 0;
      candleOnSound.play();
    } else {
      removeMarker(grid, i, j);
      // reset sound to allow quick repeated playing
      candleOffSound.currentTime = 0;
      candleOffSound.play();
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
