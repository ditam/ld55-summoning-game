
let DEBUG = location && location.hostname==='localhost';

const grid = [];

function deepCopy(o) {
  return JSON.parse(JSON.stringify(o));
}

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
});
