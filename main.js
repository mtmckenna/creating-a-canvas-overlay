const GRAVITY = 0.05;
const FRICTION = 0.8;
const BALL_SIZE = 32;
const BALL_BUFFER = 3;
const HALF_BALL_SIZE = BALL_SIZE / 2;
const MAX_VEL = 5.0;
const MIN_VEL = 0.5;
const MIN_ROT_SPEED = 0.05;
const MAX_ROT_SPEED = 0.25;
const MOUSE_TOUCH_VEL = 2.0;

const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');
const ballImage = document.getElementById('basketball');
const { body } = document;

// Last two mouse positions
const mousePos = new Array(2).fill({ x: 0, y: 0 });

let minHeight = 0;
let minWidth = 0;
let maxHeight = 0;
let maxWidth = 0;

setMinMaxDimensions();

const ball = {
  pos: {
    x: randomFloatBetween(minWidth, maxWidth),
    y: window.scrollY + BALL_SIZE,
  },
  vel: {
    x: plusOrMinus() * randomFloatBetween(MIN_VEL, MAX_VEL),
    y: randomFloatBetween(MIN_VEL, MAX_VEL),
  },
  rot: {
    angle: 0.0,
    speed: randomFloatBetween(MIN_ROT_SPEED, MAX_ROT_SPEED),
  },
};

window.addEventListener('load', () => resize());
window.addEventListener('resize', () => resize());
window.addEventListener('scroll', () => setMinMaxDimensions());
window.addEventListener('mousemove', event => mouseMove(event));
window.addEventListener('touchmove', event => mouseMove(event));
window.addEventListener('mouseout', () => resetMousePos());
window.addEventListener('touchend', () => resetMousePos());

requestAnimationFrame(gameLoop);

function gameLoop() {
  update();
  draw();
  requestAnimationFrame(() => gameLoop());
}

function update() {
  // If the ball is at the bottom, roll or bounce
  if (ball.pos.y >= maxHeight) {
    if (shouldRoll()) {
      roll();
    } else {
      bounce('y', maxHeight);
    }
  // Otherwise, bounce if it hits the top and add gravity
  } else {
    if (ball.pos.y <= minHeight) bounce('y', minHeight);
    ball.vel.y = Math.min(ball.vel.y + GRAVITY, MAX_VEL);
  }

  // Bounce off the left and right wall
  if (ball.pos.x >= maxWidth) {
    bounce('x', maxWidth);
  } else if (ball.pos.x <= minWidth) {
    bounce('x', minWidth);
  }

  ball.pos.y += ball.vel.y;
  ball.pos.x += ball.vel.x;
  ball.rot.angle += ball.rot.speed;
  deflectBallWithMouse();
}

function draw() {
  clearCanvas();
  const { x, y } = ball.pos;

  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(ball.rot.angle);
  ctx.drawImage(ballImage, -HALF_BALL_SIZE, -HALF_BALL_SIZE);
  ctx.restore();
}

function mouseMove(event) {
  let touch = event;
  if (event.touches) { touch = event.touches[0]; }
  mousePos[0] = mousePos[1];
  mousePos[1] = {
    x: touch.clientX - body.getBoundingClientRect().x,
    y: touch.clientY + window.scrollY,
  };
}

function resetMousePos() {
  mousePos.fill({ x: 0, y: 0 });
}

function resize() {
  canvas.width = body.offsetWidth;
  canvas.height = body.offsetHeight;
  setMinMaxDimensions();
}

function setMinMaxDimensions() {
  minHeight = BALL_SIZE + window.scrollY;
  minWidth = BALL_SIZE;
  maxHeight = (window.innerHeight - BALL_SIZE) + window.scrollY;
  maxWidth = body.offsetWidth - BALL_SIZE;
}

// Move ball based on the mouse's last two positions
function deflectBallWithMouse() {
  if (pointIntersectsBall(mousePos[1])) {
    // Always bounce the ball up
    ball.vel.y = -MOUSE_TOUCH_VEL;

    // If the mouse is coming from the left to the right, push the ball right
    if (mousePos[1].x - mousePos[0].x > 0) {
      ball.vel.x = MOUSE_TOUCH_VEL;
    } else {
      ball.vel.x = -MOUSE_TOUCH_VEL;
    }

    ball.rot.speed = Math.sign(ball.vel.x) * MAX_ROT_SPEED;
  }
}

function shouldRoll() {
  return ball.pos.y === maxHeight && ball.vel.y === 0;
}

function roll() {
  ball.vel.x *= FRICTION;
  ball.rot.speed *= FRICTION;
}

function bounce(dimension, position) {
  ball.pos[dimension] = position;
  ball.vel[dimension] = absStep(MIN_VEL, -ball.vel[dimension] * FRICTION);
  ball.rot.speed = Math.sign(ball.vel['x']) * Math.min(Math.abs(absStep(MIN_ROT_SPEED, ball.rot.speed)), MAX_ROT_SPEED);
}

function clearCanvas() {
  ctx.clearRect(0, 0, body.offsetWidth, body.offsetHeight);
}

function pointIntersectsBall(point) {
  return point.x >= (ball.pos.x - BALL_BUFFER) &&
    point.x <= (ball.pos.x + BALL_SIZE + BALL_BUFFER) &&
    point.y >= (ball.pos.y - BALL_BUFFER) &&
    point.y <= (ball.pos.y + BALL_SIZE + BALL_BUFFER);
}

function absStep(edge, x) {
  if (Math.abs(x) < edge) return 0.0;
  return x;
}

function randomFloatBetween(min, max) {
  return (Math.random() * (max - min)) + min;
}

function plusOrMinus() {
  return (Math.round(Math.random()) * 2) - 1;
}
