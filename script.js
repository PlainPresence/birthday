// Firebase Initialization
firebase.initializeApp({
  apiKey: "AIzaSyAkz4PQrN8jYqA4TzAdeosW_jfJO5wjXCA",
  authDomain: "birthday-c1189.firebaseapp.com",
  databaseURL: "https://birthday-c1189-default-rtdb.firebaseio.com",
  projectId: "birthday-c1189",
  storageBucket: "birthday-c1189.appspot.com",
  messagingSenderId: "665261107966",
  appId: "1:665261107966:web:aff1b7a7c21fa7a851d3af",
  measurementId: "G-6LLKM749PE"
});

const db = firebase.database();
const storage = firebase.storage();

// Music Toggle
function toggleMusic() {
  const music = document.getElementById('bgMusic');
  music.muted = !music.muted;
}

// Countdown Update
function updateCountdown() {
  const countdown = document.getElementById("countdown");
  const birthday = new Date("2025-06-02T00:00:00").getTime();
  const now = new Date().getTime();
  const days = Math.floor((birthday - now) / (1000 * 60 * 60 * 24));
  countdown.textContent = days < 0 ? "🎉 It's her special day!" : `🎈 ${days} day(s) left!`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

// Popup
function closePopup() {
  document.getElementById('popupCard').style.display = 'none';
}

// Message Saving
function saveMessage(msg) {
  db.ref("messages").push({ text: msg, timestamp: Date.now() });
}
function saveGuestbook(msg) {
  db.ref("guestbook").push({ text: msg, timestamp: Date.now() });
}

// Message Loading
function loadMessages() {
  const container = document.getElementById("messageList");
  db.ref("messages").on("child_added", snap => {
    const div = document.createElement("div");
    div.textContent = `💌 ${snap.val().text}`;
    container.appendChild(div);
  });
}
function loadGuestbook() {
  const container = document.getElementById("guestbookList");
  db.ref("guestbook").on("child_added", snap => {
    const div = document.createElement("div");
    div.textContent = `📝 ${snap.val().text}`;
    container.appendChild(div);
  });
}

// Photo Loading
function loadPhotos() {
  const gallery = document.getElementById("photoGallery");
  if (!gallery) return;
  gallery.innerHTML = ""; // Clear the gallery

  // List all images in the 'photos/' directory
  storage.ref('photos').listAll()
    .then(res => {
      if (res.items.length === 0) {
        gallery.innerHTML = "<p>No photos yet.</p>";
      } else {
        res.items.forEach(itemRef => {
          itemRef.getDownloadURL().then(url => {
            const img = document.createElement("img");
            img.src = url;
            img.alt = "Uploaded photo";
            img.style.maxWidth = "100px";
            img.style.margin = "10px";
            gallery.appendChild(img);
          });
        });
      }
    })
    .catch(error => {
      console.error("Failed to load photos", error);
      gallery.innerHTML = "<p>Could not load photos.</p>";
    });
}

// DOM Ready Main Logic
document.addEventListener("DOMContentLoaded", () => {
  // Message Form
  if (document.getElementById("submitMessage")) {
    document.getElementById("submitMessage").addEventListener("click", () => {
      const msg = document.getElementById("messageInput").value.trim();
      if (msg) {
        saveMessage(msg);
        document.getElementById("messageInput").value = '';
      }
    });
  }

  // Guestbook Form
  if (document.getElementById("submitGuestbook")) {
    document.getElementById("submitGuestbook").addEventListener("click", () => {
      const msg = document.getElementById("guestbookInput").value.trim();
      if (msg) {
        saveGuestbook(msg);
        document.getElementById("guestbookInput").value = '';
      }
    });
  }

  // Upload Photo
  if (document.getElementById("uploadPhoto")) {
    document.getElementById("uploadPhoto").addEventListener("click", () => {
      const fileInput = document.getElementById("photoInput");
      const file = fileInput.files[0];

      if (!file || !file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
      }

      const fileName = `photos/${Date.now()}_${file.name}`;
      const storageRef = storage.ref(fileName);
      storageRef.put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
          loadPhotos(); // Refresh gallery
          fileInput.value = ""; // Clear the file input
        })
        .catch(error => {
          console.error("Upload failed:", error);
          alert("Failed to upload image. Check console for details.");
        });
    });
  }

  // Floating Hearts Animation
  setInterval(() => {
    const heart = document.createElement("div");
    heart.textContent = "💖";
    heart.style.position = "fixed";
    heart.style.left = Math.random() * 100 + "vw";
    heart.style.top = "100vh";
    heart.style.fontSize = "24px";
    heart.style.opacity = 0.7;
    heart.style.zIndex = "0";
    heart.style.animation = "floatUp 4s ease-in forwards";
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 4000);
  }, 1000);

  // Floating Hearts CSS
  const style = document.createElement("style");
  style.textContent = `
    @keyframes floatUp {
      0% { transform: translateY(0); opacity: 0.7; }
      100% { transform: translateY(-120vh); opacity: 0; }
    }
  `;
  document.head.appendChild(style);

  // Animation On Scroll (AOS)
  if (window.AOS && AOS.init) AOS.init();

  // Load Data
  loadMessages();
  loadGuestbook();
  loadPhotos();

  // ===== Background Music Autoplay Logic =====
  var music = document.getElementById("bgMusic");
  if (music) {
    // Try to play on load (may fail due to browser policies)
    music.play().catch(function () {
      // Wait for user interaction
      document.body.addEventListener('click', function () {
        music.play();
      }, { once: true });
    });
  }
  // ===== End Background Music Autoplay =====

  // ================= Voice Notes Logic ===================
  const recordBtn = document.getElementById('recordBtn');
  const stopBtn = document.getElementById('stopBtn');
  const uploadBtn = document.getElementById('uploadBtn');
  const audioPlayback = document.getElementById('audioPlayback');
  const vnStatus = document.getElementById('vn-status');
  const vnName = document.getElementById('vnName');
  const vnList = document.getElementById('vnList');

  let mediaRecorder = null;
  let audioChunks = [];
  let currentAudioBlob = null;

  function escapeHtml(str) {
    return str.replace(/[&<>"']/g, ch =>
      ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[ch])
    );
  }

  function addVoiceNoteToList({ name, url }) {
    const item = document.createElement('div');
    item.className = "vn-item";
    item.innerHTML = `<strong>${escapeHtml(name)}:</strong> <audio src="${url}" controls></audio>`;
    vnList.prepend(item);
  }

  function loadVoiceNotes() {
    db.ref('voiceNotes').orderByChild('ts').on('value', snapshot => {
      vnList.innerHTML = '';
      const notes = [];
      snapshot.forEach(child => notes.push(child.val()));
      notes.reverse().forEach(addVoiceNoteToList);
    });
  }

  if (
    recordBtn && stopBtn && uploadBtn &&
    audioPlayback && vnStatus && vnName && vnList
  ) {
    recordBtn.onclick = async () => {
      if (!vnName.value.trim()) {
        vnStatus.textContent = "Please enter your name!";
        vnName.focus();
        return;
      }
      if (navigator.mediaDevices?.getUserMedia) {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        mediaRecorder = new MediaRecorder(stream);
        audioChunks = [];
        mediaRecorder.start();

        vnStatus.textContent = "Recording...";
        recordBtn.disabled = true;
        stopBtn.disabled = false;
        uploadBtn.disabled = true;
        audioPlayback.style.display = 'none';

        mediaRecorder.ondataavailable = e => audioChunks.push(e.data);
        mediaRecorder.onstop = () => {
          currentAudioBlob = new Blob(audioChunks, { type: 'audio/webm' });
          audioPlayback.src = URL.createObjectURL(currentAudioBlob);
          audioPlayback.style.display = 'block';
          uploadBtn.disabled = false;
          vnStatus.textContent = "Ready to upload!";
        };
      } else {
        alert("Audio recording is not supported in this browser.");
      }
    };

    stopBtn.onclick = () => {
      if (mediaRecorder && mediaRecorder.state !== "inactive") {
        mediaRecorder.stop();
        recordBtn.disabled = false;
        stopBtn.disabled = true;
        vnStatus.textContent = "Recording stopped.";
      }
    };

    uploadBtn.onclick = () => {
      if (!currentAudioBlob) return;
      vnStatus.textContent = "Uploading...";

      const name = vnName.value.trim();
      const fileName = `voice-notes/${Date.now()}_${name.replace(/\s+/g, '_')}.webm`;
      const storageRef = storage.ref(fileName);
      const uploadTask = storageRef.put(currentAudioBlob);

      uploadTask.on('state_changed', null,
        error => {
          vnStatus.textContent = "Upload failed. Please try again.";
          console.error(error);
        },
        () => {
          uploadTask.snapshot.ref.getDownloadURL().then(downloadURL => {
            const noteData = { name, url: downloadURL, ts: Date.now() };
            db.ref('voiceNotes').push(noteData, err => {
              if (!err) {
                vnStatus.textContent = "Voice note uploaded!";
                addVoiceNoteToList(noteData);
                audioPlayback.style.display = 'none';
                uploadBtn.disabled = true;
                vnName.value = "";
              } else {
                vnStatus.textContent = "Failed to save voice note info.";
              }
            });
          });
        }
      );
    };

    // Load all existing voice notes on page load
    loadVoiceNotes();
  }
  // ================= End Voice Notes Logic ===================
});
