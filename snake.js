const EAST = 0;
const NORTH = 1;
const WEST = 2;
const SOUTH = 3;

class Direction {
  constructor (initialHeading) {
    this.heading = initialHeading;
    this.deltas = {};
    this.deltas[EAST] = [1, 0];
    this.deltas[WEST] = [-1, 0];
    this.deltas[NORTH] = [0, -1];
    this.deltas[SOUTH] = [0, 1];
  }

  get delta() {
    return this.deltas[this.heading];
  }

  turnLeft() {
    this.heading = (this.heading + 1) % 4;
  }
}

class Snake {
  constructor (positions, direction, type) {
    this.positions = positions.slice();
    this.direction = direction;
    this.type = type;
    this.previousTail = [0, 0];
  }

  get location() {
    return this.positions.slice();
  }

  get species() {
    return this.type;
  }

  turnLeft() {
    this.direction.turnLeft();
  }

  move() {
    const [headX, headY] = this.positions[this.positions.length - 1];
    this.previousTail = this.positions.shift();

    const [deltaX, deltaY] = this.direction.delta;

    this.positions.push([headX + deltaX, headY + deltaY]);
  }

  hasEaten(food) {
    const [foodColId, foodRowId] = food.position;
    const head = this.positions[this.positions.length - 1];
    return head[0] === foodColId && head[1] === foodRowId;
  }

  increase() {
    this.positions.unshift(this.previousTail);
  }
}

class Food {
  constructor (colId, rowId) {
    this.colId = colId;
    this.rowId = rowId;
  }

  get position() {
    return [this.colId, this.rowId];
  }

  changePosition() {
    this.colId = Math.round(Math.random() * 100);
    this.rowId = Math.round(Math.random() * 60);
  }
}

class Game {
  constructor (snake, ghostSnake, food) {
    this.snake = snake;
    this.ghostSnake = ghostSnake;
    this.food = food;
  }

  update() {
    if (this.snake.hasEaten(this.food)) {
      this.food.changePosition();
      this.snake.increase();
    }
  }
}

const NUM_OF_COLS = 100;
const NUM_OF_ROWS = 60;

const GRID_ID = 'grid';

const getGrid = () => document.getElementById(GRID_ID);
const getCellId = (colId, rowId) => colId + '_' + rowId;

const getCell = (colId, rowId) =>
  document.getElementById(getCellId(colId, rowId));

const createCell = function (grid, colId, rowId) {
  const cell = document.createElement('div');
  cell.className = 'cell';
  cell.id = getCellId(colId, rowId);
  grid.appendChild(cell);
};

const createGrids = function () {
  const grid = getGrid();
  for (let y = 0; y < NUM_OF_ROWS; y++) {
    for (let x = 0; x < NUM_OF_COLS; x++) {
      createCell(grid, x, y);
    }
  }
};

const eraseTail = function (snake) {
  let [colId, rowId] = snake.previousTail;
  const cell = getCell(colId, rowId);
  cell.classList.remove(snake.species);
};

const drawSnake = function (snake) {
  snake.location.forEach(([colId, rowId]) => {
    const cell = getCell(colId, rowId);
    cell.classList.add(snake.species);
  });
};

const eraseFood = function (food) {
  let [colId, rowId] = food.position;
  const cell = getCell(colId, rowId);
  cell.classList.remove('food');
};

const drawFood = function (food) {
  let [colId, rowId] = food.position;
  const cell = getCell(colId, rowId);
  cell.classList.add('food');
};

const moveAndDrawSnake = function (snake) {
  snake.move();
  eraseTail(snake);
  drawSnake(snake);
};

const handleKeyPress = snake => {
  snake.turnLeft();
};

const attachEventListeners = snake => {
  document.body.onkeydown = handleKeyPress.bind(null, snake);
};

const updateGame = function (game) {
  const {snake, ghostSnake, food} = game;

  eraseFood(food);
  game.update();
  moveAndDrawSnake(snake);
  moveAndDrawSnake(ghostSnake);
  drawFood(food);
};

const randomlyTurnSnake = function (snake) {
  let num = Math.random() * 100;
  if (num > 50) {
    snake.turnLeft();
  }
};

const setup = function (game) {
  const {snake, ghostSnake, food} = game;

  attachEventListeners(snake);
  createGrids();

  drawSnake(snake);
  drawSnake(ghostSnake);

  drawFood(food);
};

const initSnake = function () {
  const snakePosition = [
    [40, 25],
    [41, 25],
    [42, 25]
  ];

  return new Snake(snakePosition, new Direction(EAST), 'snake');
};

const initGhost = function () {
  const ghostPosition = [
    [40, 30],
    [41, 30],
    [42, 30]
  ];

  return new Snake(ghostPosition, new Direction(SOUTH), 'ghost');
}

const main = function () {
  const snake = initSnake();
  const ghostSnake = initGhost();
  const food = new Food(5, 5);

  const game = new Game(snake, ghostSnake, food);
  setup(game);

  setInterval(updateGame, 200, game);
  setInterval(randomlyTurnSnake, 500, ghostSnake);
};
