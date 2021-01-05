var state = {
  words: ["intro", "get ready"],
  wordIndex: 0,
  playing: false,
  currentTime: 0,
  currentBar: 0,
  currentSegment: {},
  song: songs[0]
};

// Freestyle Code
function generateWordPairs(dictionary, totalWords) {
  // iterate through dictionary
  let shuffled = dictionary.map(element => {
    // shuffle words in each entry
    element = element.sort(() => 0.5 - Math.random());
    // pair up rhyming words
    let paired = element.reduce(function(result, value, index, array) {
      if (index % 2 === 0)
        result.push(array.slice(index, index + 2));
      return result;
    }, []);
    // return word pairs
    return paired;
  });
  // randomly sort all pairs and flatten into single list
  // pull desired number of words
  let results = shuffled.flat().sort(() => 0.5 - Math.random()).flat().slice(0, totalWords);
  // add an end message
  results.push(":)");
  return results;
}

function findSongSegment(song) {
  return song.sections.find(segment => audioPlayer.currentTime < segment.endTime)
}

function calculateBarPercentage(segment) {
  // calculate elapsed segment time
  let elapsedSegmentTime = audioPlayer.currentTime - (segment.endTime - segment.duration) 
  // calculate duration of individual bar
  let barDuration = segment.duration / segment.totalSegments;
  // current bar of segment
  let currentBar = Math.floor(elapsedSegmentTime / barDuration);
  if (currentBar !== state.currentBar && segment.type !== "outro") {
    state.currentBar = currentBar;
    state.wordIndex += 1;
    updateWords();
    // console.log("Bar " + (currentBar + 1));
  }
  // calculate remaining duration of current bar
  let segmentRemainder = elapsedSegmentTime % barDuration;
  // calculate percentage of elapsed time 
  return segmentRemainder / barDuration;
}

//
// DOM Manipulation
//

// toggle audio player
function togglePlay() {
  state.playing ? audioPlayer.pause() : audioPlayer.play()
}

// listen for spacebar and toggle play
document.addEventListener('keyup', (e) => {
  e.code === 'Space' ? togglePlay() : null
});

function updateWords() {
  document.getElementById('current-word').innerText = state.words[state.wordIndex];
  document.getElementById('next-word').innerText = state.words[state.wordIndex + 1];
}

function loadSong(song) {
  audioPlayer.src = song.url
}

// get width of progress bar for later calculations
var progressBorder = document.getElementById('container');
var progressBarWidth = parseInt(window.getComputedStyle(progressBorder).width);

// get audio player and add listeners
var audioPlayer = document.getElementById('audio-player');
audioPlayer.addEventListener('playing', playBars);
audioPlayer.addEventListener('pause', stopBars);

var barsInterval;

function playBars() {
  state.playing = true;
  barsInterval = setInterval(() => update(state.song), 7);
}
function stopBars() {
  state.playing = false;
  clearInterval(barsInterval);
  state.currentTime = audioPlayer.currentTime
}

function drawProgressBar(id, percent) {
  let progressEl = document.getElementById(id);
  var progressInPixels = Math.floor(progressBarWidth * percent);
  progressEl.style.width = progressInPixels + "px";
}

function update(song) {
  // find current song segment
  let segment = findSongSegment(song);
  if (segment !== state.currentSegment) {
    if (segment.type === "intro") {
      document.getElementById("inner-progress-text").innerHTML = "This is the intro... get ready."
    }
    state.currentSegment = segment;
    console.log(segment.title)
  }
  let percent = calculateBarPercentage(segment)
  drawProgressBar("current-rhyme-progress", percent);  
}
state.words = generateWordPairs(dictionary, songs[0].totalBars);
loadSong(songs[0]);
updateWords(); 