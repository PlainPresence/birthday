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

function toggleMusic() {
  const music = document.getElementById('bgMusic');
  music.muted = !music.muted;
}

function updateCountdown() {
  const countdown = document.getElementById("countdown");
  const birthday = new Date("2025-06-02T00:00:00").getTime();
  const now = new Date().getTime();
  const days = Math.floor((birthday - now) / (1000 * 60 * 60 * 24));
  countdown.textContent = days < 0 ? "🎉 It's her special day!" : `🎈 ${days} day(s) left!`;
}
setInterval(updateCountdown, 1000);
updateCountdown();

function closePopup() {
  document.getElementById('popupCard').style.display = 'none';
}

function saveMessage(msg) {
  db.ref("messages").push({ text: msg, timestamp: Date.now() });
}
function saveGuestbook(msg) {
  db.ref("guestbook").push({ text: msg, timestamp: Date.now() });
}

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

// Ensure elements exist before adding event listeners
document.addEventListener("DOMContentLoaded", () => {
  if (document.getElementById("submitMessage")) {
    document.getElementById("submitMessage").addEventListener("click", () => {
      const msg = document.getElementById("messageInput").value.trim();
      if (msg) {
        saveMessage(msg);
        document.getElementById("messageInput").value = '';
      }
    });
  }

  if (document.getElementById("submitGuestbook")) {
    document.getElementById("submitGuestbook").addEventListener("click", () => {
      const msg = document.getElementById("guestbookInput").value.trim();
      if (msg) {
        saveGuestbook(msg);
        document.getElementById("guestbookInput").value = '';
      }
    });
  }

  // 📸 Upload Photo to Firebase Storage and display it
  if (document.getElementById("uploadPhoto")) {
    document.getElementById("uploadPhoto").addEventListener("click", () => {
      const fileInput = document.getElementById("photoInput");
      const file = fileInput.files[0];

      if (!file || !file.type.startsWith("image/")) {
        alert("Please select a valid image.");
        return;
      }

      const fileName = `photos/${Date.now()}_${file.name}`;
      const storageRef = firebase.storage().ref(fileName);

      storageRef.put(file)
        .then(snapshot => snapshot.ref.getDownloadURL())
        .then(url => {
          const img = document.createElement("img");
          img.src = url;
          img.alt = "Uploaded photo";
          img.style.maxWidth = "100px";
          img.style.margin = "10px";
          document.getElementById("photoGallery").appendChild(img);
        })
        .catch(error => {
          console.error("Upload failed:", error);
          alert("Failed to upload image. Check console for details.");
        });
    });
  }

  // Floating hearts
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

  const style = document.createElement("style");
  style.textContent = `
  @keyframes floatUp {
    0% { transform: translateY(0); opacity: 0.7; }
    100% { transform: translateY(-120vh); opacity: 0; }
  }`;
  document.head.appendChild(style);

  if (window.AOS && AOS.init) AOS.init();

  loadMessages();
  loadGuestbook();

  // Stub for missing loadPhotos function
  if (typeof loadPhotos !== "function") {
    window.loadPhotos = function() {
      // If you want to load previously uploaded photos, implement here.
      // For now, this avoids runtime errors.
    };
  }
  loadPhotos();
});
