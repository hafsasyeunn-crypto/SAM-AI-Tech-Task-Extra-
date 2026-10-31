const audio = document.getElementById("audio");
const cover = document.getElementById("cover");
const imageError = document.getElementById("imageError");
const title = document.getElementById("songTitle");
const artist = document.getElementById("artist");
const playBtn = document.getElementById("playBtn");
const progress = document.getElementById("progress");
const currentTimeEl = document.getElementById("currentTime");
const durationEl = document.getElementById("duration");
const volume = document.getElementById("volume");
const muteBtn = document.getElementById("muteBtn");
const playlistEl = document.getElementById("playlist");
const visualizer = document.getElementById("visualizer");
const trackNumber = document.getElementById("trackNumber");

// Add more songs when you have their audio files.
const songs = [
  { title: "3D", artist: "Jung Kook", src: "3D.mp3" },
  {
    title: "Standing Next to You",
    artist: "Jung Kook",
    src: "Standing Next to You.mp3"
  },
  { title: "Seven", artist: "Jung Kook", src: "Seven.mp3" },
  {
    title: "Still With You",
    artist: "Jung Kook",
    src: "Still With You.mp3"
  }
];

let songIndex = 0;
let shuffle = false;
let repeat = false;
let lastVolume = 0.7;

// Show a helpful message if the photo cannot load.
cover.addEventListener("error", () => {
  cover.style.display = "none";
  imageError.hidden = false;
});

cover.addEventListener("load", () => {
  cover.style.display = "block";
  imageError.hidden = true;
});

function formatTime(seconds) {
  if (!Number.isFinite(seconds)) return "0:00";

  const minutes = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);

  return `${minutes}:${String(secs).padStart(2, "0")}`;
}

function renderPlaylist() {
  playlistEl.replaceChildren();

  songs.forEach((song, index) => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "track";

    const icon = document.createElement("span");
    icon.className = "track-art";
    icon.textContent = "♫";

    const info = document.createElement("span");
    info.className = "track-info";

    const name = document.createElement("strong");
    name.textContent = song.title;

    const singer = document.createElement("small");
    singer.textContent = song.artist;

    const time = document.createElement("span");
    time.className = "track-time";
    time.textContent = "—";

    info.append(name, singer);
    button.append(icon, info, time);

    button.addEventListener("click", () => {
      loadSong(index);
      playSong();
    });

    playlistEl.appendChild(button);
  });

  updatePlaylist();
}

function updatePlaylist() {
  [...playlistEl.children].forEach((item, index) => {
    item.classList.toggle("active", index === songIndex);
  });
}

function loadSong(index) {
  songIndex = (index + songs.length) % songs.length;
  const song = songs[songIndex];

  audio.pause();
  audio.src = song.src;
  audio.load();

  title.textContent = song.title;
  artist.textContent = song.artist;
  trackNumber.textContent =
    `TRACK ${String(songIndex + 1).padStart(2, "0")}`;

  currentTimeEl.textContent = "0:00";
  durationEl.textContent = "0:00";
  progress.value = 0;

  updatePlaylist();
  updatePlayState();
}

async function playSong() {
  try {
    await audio.play();
  } catch (error) {
    console.error("Music playback failed:", error);

    if (error.name === "NotAllowedError") {
      alert("Please tap Play to start the music.");
    } else {
      alert(
        `Could not play ${songs[songIndex].src}.\n\n` +
        "Check that the audio file exists in your music player folder " +
        "and its name matches the code."
      );
    }
  }
}

function updatePlayState() {
  const playing = !audio.paused;

  playBtn.textContent = playing ? "Ⅱ" : "▶";
  playBtn.title = playing ? "Pause" : "Play";
  playBtn.setAttribute("aria-label", playing ? "Pause" : "Play");

  cover.classList.toggle("playing", playing);
  visualizer.classList.toggle("active", playing);
}

function nextSong() {
  let nextIndex = songIndex + 1;

  if (shuffle && songs.length > 1) {
    do {
      nextIndex = Math.floor(Math.random() * songs.length);
    } while (nextIndex === songIndex);
  }

  loadSong(nextIndex);
  playSong();
}

function previousSong() {
  if (audio.currentTime > 3) {
    audio.currentTime = 0;
    return;
  }

  loadSong(songIndex - 1);
  playSong();
}

playBtn.addEventListener("click", () => {
  if (audio.paused) {
    playSong();
  } else {
    audio.pause();
  }
});

document.getElementById("nextBtn").addEventListener("click", nextSong);
document.getElementById("prevBtn").addEventListener("click", previousSong);

document.getElementById("shuffleBtn").addEventListener("click", event => {
  shuffle = !shuffle;
  event.currentTarget.classList.toggle("selected", shuffle);
});

document.getElementById("repeatBtn").addEventListener("click", event => {
  repeat = !repeat;
  audio.loop = repeat;
  event.currentTarget.classList.toggle("selected", repeat);
});

audio.addEventListener("loadedmetadata", () => {
  durationEl.textContent = formatTime(audio.duration);

  const time = playlistEl.children[songIndex]?.querySelector(".track-time");
  if (time) time.textContent = formatTime(audio.duration);
});

audio.addEventListener("timeupdate", () => {
  if (!Number.isFinite(audio.duration) || audio.duration <= 0) return;

  progress.value = (audio.currentTime / audio.duration) * 100;
  currentTimeEl.textContent = formatTime(audio.currentTime);
});

progress.addEventListener("input", () => {
  if (Number.isFinite(audio.duration) && audio.duration > 0) {
    audio.currentTime = (Number(progress.value) / 100) * audio.duration;
  }
});

volume.addEventListener("input", () => {
  audio.volume = Number(volume.value) / 100;
  audio.muted = false;

  if (audio.volume > 0) lastVolume = audio.volume;
  muteBtn.textContent = "MUTE";
});

muteBtn.addEventListener("click", () => {
  if (audio.muted || audio.volume === 0) {
    audio.muted = false;
    audio.volume = lastVolume || 0.7;
    volume.value = audio.volume * 100;
    muteBtn.textContent = "MUTE";
  } else {
    lastVolume = audio.volume;
    audio.muted = true;
    muteBtn.textContent = "UNMUTE";
  }
});

audio.addEventListener("play", updatePlayState);
audio.addEventListener("pause", updatePlayState);

audio.addEventListener("ended", () => {
  if (!repeat) nextSong();
});

audio.addEventListener("error", () => {
  console.error("Unable to load audio:", songs[songIndex].src);
});

renderPlaylist();
audio.volume = 0.7;
loadSong(0);