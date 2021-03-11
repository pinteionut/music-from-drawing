// CANVAS
const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

// BOOLEANS
let isDrawing = false;
let isPlaying = false;

// CONSTANTS
const points = [];
const synth = new Tone.Synth().toDestination();

const notes = [
    'A4', 'G4', 'E4', 'D4', 'C4',
]
const notesAreasColors = ["#AFE9DA", "#90E0CC", "#70D7BD", "#50CEAE", "#36BF9D", "#2D9F83"]
const timeLength = 25;
const timeSpeed = 0.5;

const noteDuration = 0.2;

// Last played note & time
let lastPlayed = {
  note: null,
  time: null,
  x: null,
  y: null
}

let notesForPart = [];
let lastTime = 0;

// Get the height of a note area
const noteAreaHeight = () => {
  return canvas.height / notes.length;
}

// Draw notes' areas on canvas
const drawNotesAreas = () => {
  let areaHeight = noteAreaHeight();
  for(let i = 0; i < notes.length; i++) {
    ctx.fillStyle = notesAreasColors[i % 5];
    ctx.fillRect(0, i * areaHeight, canvas.width, areaHeight);
  }
}
drawNotesAreas();

// Draw time grid
const drawTimeGrid = () => {
  let c = 0;
  ctx.fillStyle = 'gray';

  while (c <= canvas.width) {
    c += timeLength;
    ctx.fillRect(c, 0, 1, canvas.height);
  }
}
drawTimeGrid();

// Find the specific note for the point's y coordonate on canvas
const findNoteAtY = (y) => {
  return notes[Math.floor(y / noteAreaHeight())];
}

// Find the specific time for the point's x coordonate on canvas
const findTimeAtX = (x) => {
  return Math.floor(x / timeLength);
}

// Event Listeners
canvas.addEventListener('mousedown', startDrawingEvent);
canvas.addEventListener('mousemove', drawEvent);
document.addEventListener('mouseup', stopDrawingEvent);
document.getElementById('playBtn').addEventListener('click', play);

// Trigerred when the user clicks on the canvas
function startDrawingEvent(event) {
  isDrawing = true;
  let x = event.clientX - canvas.offsetLeft;
  let y = event.clientY - canvas.offsetTop;
  ctx.beginPath();
  ctx.moveTo(x, y);
  draw(x, y, 'black');
}

// Play the music
function play() {
  playNoteTest();
  isPlaying = true;
  let time = 0;
  let totalTime = notesForPart.length * noteDuration * 1000;
  ctx.beginPath();
  ctx.moveTo(points[0].x, points[0].y);
  points.forEach((point, index) => {

    setTimeout(
      function() {
        // if (point.note) {
        //   playNote(point);
        // }
        draw(point.x, point.y, 'white');
      },
      time
    )
    time += totalTime / points.length
  });
}

function drawEvent(event) {
  if (!isDrawing) { return; };
  let x = event.clientX - canvas.offsetLeft;
  let y = event.clientY - canvas.offsetTop;
  draw(x, y);
}

// Draw on Canvas and update the points array
function draw(x, y, color) {
  if (!(isDrawing || isPlaying)) return;
  ctx.lineTo(x, y);
  ctx.strokeStyle = color;
  ctx.lineWidth = 3;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';
  ctx.stroke();
  if (isPlaying) return;

  const note = findNoteAtY(y);
  const time = findTimeAtX(x);
  // If the note is the same and at the same time we don't want to play it
  if (
    (note == lastPlayed.note && time == lastPlayed.time)
  ) {
    points.push({ x, y });
  } else {
    notesForPart.push({ note: note, time: lastTime })
    lastTime += noteDuration;
    points.push({ x, y, note, time })
    lastPlayed.note = findNoteAtY(y);
    lastPlayed.time = findTimeAtX(x);
    lastPlayed.x = x;
    lastPlayed.y = y;
  }
}

function stopDrawingEvent() {
  isDrawing = false;
}

function playNote(point) {
  ctx.fillStyle = 'red';
  ctx.fillRect(point.x, point.y, 5, 5);
  if (lastPlayed.note) {
    synth.triggerRelease(Tone.now());
  }
  synth.triggerAttack(point.note, '8n');
}

function playNoteTest() {
  new Tone.Part(((time, value) => {
    synth.triggerAttackRelease(value.note, "8n", time, 1);
  }), notesForPart).start(0);
  Tone.start()
  Tone.Transport.start();
};
