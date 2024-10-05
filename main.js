const canvasField = document.getElementById("canvas_field");
const ctx = canvasField.getContext("2d");
const headSnake = document.getElementById("headSnake");
const deadHead = document.getElementById("deadHead");
const bodySnake = document.getElementById("bodySnake");
const eatingHead = document.getElementById("eatingSnake");
const food = document.getElementById('food');
const scoreCount = document.getElementById('score');
const pauseBtn = document.getElementById('pauseBtn');
const restartGame = document.getElementById('restartBtn');
const gamePause = document.getElementById('gamePause');

const gameOverPopup = document.getElementById('gameOverPopup');
const gameOverTitle = document.getElementById('gameOverTitle');
const gameOverMessage = document.getElementById('gameOverMessage');
const finalScore = document.getElementById('finalScore');
const playerNameInput = document.getElementById('playerName');
const submitScoreButton = document.getElementById('submitScore');

const fieldHeight = canvasField.height;
const fieldWidth = canvasField.width;
const snakeHeight = 64;
const snakeWidth = 64;

let directionChanged = false

let direction = null;
const step = 64;
let gameOver = false ;
let pause = false ;

let xFood ;
let yFood ;
let snake = [];
snake.push({
  x: 448,
  y: 320
})

let score = 0;

const bgMusic = new Audio('bg.mp3');
bgMusic.loop = true;
bgMusic.volume = 0.5;
const deathSound = new Audio('death.wav');
const biteSound = new Audio('bite.mp3');

const soundBtn = document.getElementById('soundBtn');
let isMusicPlaying = false;

function toggleMusic() {
  if (isMusicPlaying) {
    bgMusic.pause();
    soundBtn.textContent = '🔇';
    soundBtn.classList.add('muted');
  } else {
    bgMusic.play();
    soundBtn.textContent = '🔊';
    soundBtn.classList.remove('muted');
  }
  isMusicPlaying = !isMusicPlaying;
}

soundBtn.onclick = toggleMusic;

pauseBtn.onclick =()=>{
  pause = !pause;
  if(pause){
    gamePause.style.display = 'block';
    if (isMusicPlaying) bgMusic.pause();
  }else{
    gamePause.style.display = 'none';
    if (isMusicPlaying) bgMusic.play();
  }
  render();
}

restartGame.onclick = () => {
  snake = [{
    x: 448,
    y: 320
  }];
  direction = null;
  xFood = undefined;
  yFood = undefined;
  score = 0;
  scoreCount.innerHTML = 0;
  if (gameOver) {
    gameOver = false;
  }
  foodRandomizer();
  if (isMusicPlaying) {
    bgMusic.currentTime = 0;
    bgMusic.play();
  }
  render();
}

document.body.onkeydown = (ev)=>{
  if(pause) return ;
  switch(ev.keyCode){
    case 37://left
      if(direction != "right" && !directionChanged){
        direction = "left";
        directionChanged = true
      }
    break;
    case 38://up
      if(direction != "down" && !directionChanged){
        direction = "up";
        directionChanged = true
      }
    break;
    case 39://right
      if(direction != "left" && !directionChanged){
        direction = "right";
        directionChanged = true
      }
    break;
    case 40://down
      if(direction != "up" && !directionChanged){
        direction = "down";
        directionChanged = true
      }
    break;
    default:
    break;
  }
}
function drawSnake(){
  for(let i= snake.length-1; i >= 0; i--){
    const eating = (snake[i].x-snakeWidth == xFood && snake[i].y-snakeHeight == yFood) ? eatingHead : headSnake;
    const head = gameOver ? deadHead : eating;
    const image = i == 0 ? head : bodySnake;  
    ctx.drawImage(image,snake[i].x-snakeWidth,snake[i].y-snakeHeight);
  }
}

function render() {
  directionChanged = false;
  if (gameOver) {
    ctx.clearRect(0, 0, fieldWidth, fieldHeight);
    drawSnake();
    showGameOverPopup(false);
    return;
  }
  ctx.clearRect(0, 0, fieldWidth, fieldHeight);
  move();
  drawFood();
  drawSnake();
  dinner();
  if (!pause) {
    setTimeout(render, 200);
  }
  if (score == 96) {
    showGameOverPopup(true);
  }
}

function move(){
    switch (direction) {
      case "left":
        snake.unshift({
          x: snake[0].x -step,
          y: snake[0].y
        })
        snake.pop();      
        break;
      case "up":
        snake.unshift({
          x: snake[0].x ,
          y: snake[0].y - step
        })
        snake.pop(); 
        break;
      case "right":
        snake.unshift({
          x: snake[0].x +step,
          y: snake[0].y
        })
        snake.pop(); 
        break;
      case "down":
        snake.unshift({
          x: snake[0].x ,
          y: snake[0].y + step
        })
        snake.pop(); 
      break;   
      default:
        break;
    }
    if(snake[0].x > fieldWidth){
      snake[0].x = snakeWidth;
    }
    if(snake[0].x  <= 0 ){
      snake[0].x  = fieldWidth ;
    }
    if(snake[0].y > fieldHeight){
      snake[0].y = snakeHeight;
    }
    if(snake[0].y <= 0){
      snake[0].y = fieldHeight;
    }
    for(let i=1;i < snake.length; i++){
      if(snake[i].x == snake[0].x && snake[i].y == snake[0].y ){
        gameOver = true;
        deathSound.play();
      } 

    }
}

function drawFood(){
  ctx.drawImage(food,xFood,yFood);
}


function foodRandomizer(){
  xFood = getRandomInt(0,(fieldWidth/64)-1)*64;
  yFood = getRandomInt(0,(fieldHeight/64)-1)*64;
  for(let i=0; i<snake.length; i++){
    if(snake[i].x-snakeWidth == xFood && snake[i].y-snakeHeight == yFood){
      foodRandomizer();
      break;
    }
  }
}

function getRandomInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function dinner(){
  if( snake[0].x-snakeWidth == xFood && snake[0].y-snakeHeight == yFood){
    score++;
    scoreCount.innerHTML = score;
    foodRandomizer();
    snake.push({
      x: snake[snake.length-1].x,
      y: snake[snake.length-1].y
    });
    biteSound.play();
  }

}

let highScores = [
  { rank: 1, name: "Alice", score: 10 },
  { rank: 2, name: "Bob", score: 9 },
  { rank: 3, name: "Charlie", score: 7 },
  { rank: 4, name: "David", score: 6 },
  { rank: 5, name: "Eve", score: 5 },
];

let currentPlayerScore = null;

let currentPage = 1;
let totalPages = 1;

async function fetchHighScores(page = 1) {
  try {
    const response = await fetch(`/api/highscores?page=${page}`);
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error fetching high scores:', error);
    return { highScores: [], currentPage: 1, totalPages: 1 };
  }
}

async function updateHighScores() {
  const { highScores, currentPage: page, totalPages: total } = await fetchHighScores(currentPage);
  const tableBody = document.querySelector('#highScoresTable tbody');
  tableBody.innerHTML = '';

  currentPage = page;
  totalPages = total;

  if (highScores.length === 0) {
    const row = document.createElement('tr');
    row.innerHTML = '<td colspan="3">No high scores available</td>';
    tableBody.appendChild(row);
  } else {
    highScores.forEach((score, index) => {
      const row = document.createElement('tr');
      const nameCell = document.createElement('td');
      nameCell.textContent = score.name;
      nameCell.className = 'name-cell';
      nameCell.title = score.name;
      
      row.innerHTML = `
        <td>${(currentPage - 1) * 5 + index + 1}</td>
        <td>${score.score}</td>
      `;
      row.insertBefore(nameCell, row.children[1]);

      if (currentPlayerScore && score._id === currentPlayerScore._id) {
        row.classList.add('current-player');
      }
      tableBody.appendChild(row);
    });
  }

  updatePaginationControls();
}

function updatePaginationControls() {
  const prevButton = document.getElementById('prevPage');
  const nextButton = document.getElementById('nextPage');
  const currentPageSpan = document.getElementById('currentPage');

  prevButton.disabled = currentPage === 1;
  nextButton.disabled = currentPage === totalPages;
  currentPageSpan.textContent = `Page ${currentPage} of ${totalPages}`;
}

document.getElementById('prevPage').addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    updateHighScores();
  }
});

document.getElementById('nextPage').addEventListener('click', () => {
  if (currentPage < totalPages) {
    currentPage++;
    updateHighScores();
  }
});

async function addHighScore(name, score) {
  try {
    const response = await fetch('/api/highscores', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ name, score }),
    });
    if (!response.ok) {
      throw new Error('Network response was not ok');
    }
    const result = await response.json();
    currentPlayerScore = result.updatedScore;
    updateHighScores();
  } catch (error) {
    console.error('Error adding high score:', error);
  }
}

function showGameOverPopup(isWin) {
  gameOverTitle.textContent = isWin ? 'YOU WIN!' : 'GAME OVER!';
  finalScore.textContent = score;
  gameOverPopup.style.display = 'block';
  if (isMusicPlaying) bgMusic.pause();
}

submitScoreButton.onclick = () => {
  const playerName = playerNameInput.value.trim();
  if (playerName) {
    addHighScore(playerName, score);
    gameOverPopup.style.display = 'none';
  } else {
    alert('Please enter your name!');
  }
};

updateHighScores();
drawSnake();
foodRandomizer();
render();
