// html references

let optionsButton = document.querySelector('#optionsButton');
let addClockButton = document.querySelector('#addClockButton');
let silenceButton = document.querySelector('#silenceButton');

// globals

let maxFps = 60;
let maxMinutes = 60;
let newRemainingMinutes = 0;

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
  timer.setAttribute('targetTime', remainingMinutes * 60 * 1000 + Date.now());
  timer.removeAttribute('remainingMinutes');

  let timerID = timer.getAttribute('timerID');
  if (!timerID) {
    // TODO: stop all other timers now
    timer.setAttribute('timerID', setInterval(
      ((timer) => {
        return () => {
          if (!newRemainingMinutes) {
            let targetTime = timer.getAttribute('targetTime');
            let remainingMinutes;
            if (targetTime < Date.now()) {
              alert('Done!');
              stopTimer(timer);
              remainingMinutes = 0;
            } else {
              remainingMinutes = (targetTime - Date.now()) / 60 / 1000;
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
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2.4, 2 * Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  //현재 남은 시간 표시
  ctx.fillStyle = 'blue';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2.4, ((maxMinutes - remainingMinutes) / maxMinutes - 0.25) * 2 * Math.PI, 1.5 * Math.PI);
  ctx.lineTo(canvas.width / 2, canvas.height / 2);
  ctx.closePath();
  ctx.fill();

  //타이머 내부 원
  ctx.fillStyle = 'white';
  ctx.beginPath();
  ctx.arc(canvas.width / 2, canvas.height / 2, canvas.width / 2.6, 2 * Math.PI, 0);
  ctx.closePath();
  ctx.fill();

  //타이머 내부 글자
  let minutes = Math.floor(remainingMinutes);
  let seconds = Math.ceil((remainingMinutes - minutes) * 60);
  ctx.fillStyle = 'black';
  ctx.textAlign = "center";
  ctx.font = "40px Arial";
  ctx.textBaseline = "middle";
  ctx.fillText(("0" + minutes).slice(-2) + "'", canvas.width / 2 + 5, canvas.height / 2 - 5);
  ctx.fillStyle = 'grey';
  ctx.font = "15px Arial";
  ctx.textBaseline = "top";
  ctx.fillText(("0" + seconds).slice(-2) + '"', canvas.width / 2 + 2, canvas.height / 2 + 20);
}

function drawTimerdigits(timer, maxMinutes) { // will be called once, when a new timer is created or resized
  maxMinutes = maxMinutes || 60;
  let canvas = timer.querySelector('.analogTimer');
  let ctx = canvas.getContext("2d");

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.fillStyle = 'white';
  ctx.textBaseline = "middle";
  ctx.textAlign = "center";
  ctx.font = "30px Arial";
  ctx.fillText(0, canvas.width / 2, canvas.height / 2);

  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  for (let i = 0; i < 12; i++) {
    if (!(i % 3)) {
      ctx.font = "20px Arial";
      ctx.fillStyle = 'white';
    } else {
      ctx.font = "15px Arial";
      ctx.fillStyle = 'grey';
    }
    ctx.fillText(Math.round(maxMinutes * (1 - i / 12) * 100) / 100, canvas.width / 2 * (1 + 0.9 * Math.cos((i / 6 - 0.5) * Math.PI)), canvas.height / 2 * (1 + 0.9 * Math.sin((i / 6 - 0.5) * Math.PI)));
  }
}

// events

document.addEventListener('mousedown', (event) => {
  if (event.target.className == 'analogTimer' && event.buttons == 1) {
    newRemainingMinutes = getMinutesFromPosition(event.offsetX, event.offsetY, event.target.width, event.target.height, maxMinutes);
    // this.debug.innerText = 'new start time: ' + newRemainingMinutes;
    drawTime(event.target.parentElement, newRemainingMinutes, maxMinutes);
  }
}, false);

document.addEventListener('mousemove', (event) => {
  if (event.target.className == 'analogTimer' && event.buttons == 1) {
    newRemainingMinutes = getMinutesFromPosition(event.offsetX, event.offsetY, event.target.width, event.target.height, maxMinutes);
    // this.debug.innerText = 'new start time: ' + newRemainingMinutes;
    drawTime(event.target.parentElement, newRemainingMinutes, maxMinutes);
  }
}, false);

document.addEventListener('mouseup', (event) => {
  if (event.target.className == 'analogTimer' && newRemainingMinutes > 0) {
    setStartTime(event.target.parentElement, newRemainingMinutes);
    startTimer(event.target.parentElement);
  }
  newRemainingMinutes = 0;
}, false);

window.onload = () => {

};

// utils

function getMinutesFromPosition(x, y, width, height, maxMinutes) {
  maxMinutes = maxMinutes || 60;
  return (Math.atan2(x - width / 2, y - height / 2) * (180 / Math.PI) + 180) / (360 / maxMinutes);
}