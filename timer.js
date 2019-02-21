const notifier = require('node-notifier');

// globals

let maxFps = 60;
let maxMinutes = 60;
let newRemainingMinutes = 0;
let endTime = null;

// functions

function setStartTime(timer, remainingMinutes) { // will be called to set default time or prepare startTime
  timer.setAttribute('remainingMinutes', remainingMinutes);
}

function setEndTime(timer, targetTime) {
  if (!timer.getAttribute('targetTime')) {
    return;
  }
  timer.setAttribute('targetTime', targetTime)
}

function startTimer(timer) {
  let remainingMinutes = timer.getAttribute('remainingMinutes');
  if (!remainingMinutes) {
    return;
  };
  endTime = new Date(remainingMinutes * 60 * 1000 + Date.now());
  timer.removeAttribute('remainingMinutes');

  let timerID = timer.getAttribute('timerID');
  if (!timerID) {
    // TODO: stop all other timers now
    timer.setAttribute('timerID', setInterval(
      ((timer) => {
        return () => {
          if (!newRemainingMinutes) {
            let remainingMinutes;
            if (endTime < Date.now()) {
              notifier.notify({title: "Time Timer", message: "Times over"});
              stopTimer(timer);
              remainingMinutes = 0;
            } else {
              remainingMinutes = (endTime - Date.now()) / 60 / 1000;
            }
            drawTime(timer, remainingMinutes, maxMinutes);
          }
        }
      })(timer),
      200
    ));
  }
}

function stopTimer(timer) { // timer will be stoped externaly when another timer starts running
  let timerID = timer.getAttribute('timerID');
  if (!timerID) {
    return;
  }
  clearInterval(timerID);
  timer.removeAttribute('timerID');

  let targetTime = timer.getAttribute('targetTime');
  timer.removeAttribute('targetTime');
  timer.setAttribute('remainingMinutes', targetTime - Date.now());
}

function drawTime(timer, remainingMinutes /*Double*/, maxMinutes /* Integer */) {
  maxMinutes = maxMinutes || 60;
  let canvas = timer.querySelector('.analogTimer');
  let ctx = canvas.getContext("2d");

  //현재 지나간 시간 표시
  ctx.fillStyle = '#E1E1E1';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2, 2 * Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  //현재 남은 시간 표시
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2.05, (remainingMinutes / maxMinutes - 0.25) * 2 * Math.PI, 1.5 * Math.PI, true);
  ctx.lineTo(canvas.width / 2, canvas.height / 2);
  ctx.closePath();
  ctx.fill();

  //타이머 내부 원
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 3, 2 * Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  //타이머 내부 글자
  let minutes = Math.floor(remainingMinutes);
  let seconds = Math.ceil((remainingMinutes - minutes) * 60);

  if (seconds == 60) {
    minutes++;
    seconds = 0;
  }

  const first = minutes === 0
    ? ("0" + seconds).slice(-2) + '"'
    : ("0" + minutes).slice(-2) + "'";
  const second = minutes > 0
    ? ("0" + seconds).slice(-2) + '"'
    : "";
  
  fillTextUp(ctx, canvas, getEndTimeText(endTime));
  fillTextCenter(ctx, canvas, first + ' ' + second);
  //fillTextDown(ctx, canvas, second);
}

const getEndTimeText = (endTime) => {
  const h = ("0" + endTime.getHours()).slice(-2);
  const m = ("0" + endTime.getMinutes()).slice(-2);
  return h + ':' + m;  
}

const fillTextUp = (ctx, canvas, text) => {
  ctx.fillStyle = 'red';
  ctx.textAlign = "center";
  ctx.font = "15px Arial";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2, canvas.height / 2 - 33);
}

const fillTextCenter = (ctx, canvas, text) => {
  ctx.fillStyle = 'black';
  ctx.textAlign = "center";
  ctx.font = "25px Arial";
  ctx.textBaseline = "middle";
  ctx.fillText(text, canvas.width / 2 + 3, canvas.height / 2);
}

// events
document.addEventListener('click', (event) => {
  if (event.target.className == 'analogTimer' && newRemainingMinutes > 0) {
    setStartTime(event.target.parentElement, newRemainingMinutes);
    startTimer(event.target.parentElement);
  }
  newRemainingMinutes = 0;
}, false);

document.addEventListener('mousemove', (event) => {
  if (event.target.className == 'analogTimer' && event.buttons == 1) {
    newRemainingMinutes = getMinutesFromPosition(event.offsetX, event.offsetY, event.target.width, event.target.height, maxMinutes);
    endTime = new Date(newRemainingMinutes * 60 * 1000 + Date.now());
    drawTime(event.target.parentElement, newRemainingMinutes, maxMinutes);
  }
}, false);

// utils
function getMinutesFromPosition(x, y, width, height, maxMinutes) {
  maxMinutes = maxMinutes || 60;
  return (180 - Math.atan2(x - width / 2, y - height / 2) * (180 / Math.PI)) / (360 / maxMinutes);
}