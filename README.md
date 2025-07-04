# HerbScanner

Aplikasi web untuk **deteksi tanamn herbal** menggunakan kamera dan model AI berbasis Teachable Machine.

---

## Fitur

- Deteksi tujuh jenis tanaman herbal: **Daun Jambu Biji, Daun Kelor, Daun Pepaya, Daun Sirih, Kumis Kucing, Lidah Buaya, Patikan Kebo**.
- Menggunakan kamera perangkat (HP/laptop) secara langsung.
- Tampilan modern, responsif, dan mudah digunakan.

---

## Struktur Proyek

```
HerbScanner_prototipe/
│
├── index.html                // Halaman utama aplikasi web
├── style.css                 // Gaya/tampilan aplikasi
├── logo.png                  // Logo aplikasi
├── teachablemachine-image.min.js // Library untuk model Teachable Machine
│
├── model/                    // Model AI hasil training Teachable Machine
│   ├── model.json
│   ├── metadata.json
│   └── weights.bin
│
├── data/
    └── tanaman_herbal.csv      // Data sampel tanaman (jika diperlukan)

```

---

## Cara Menjalankan

1. **Download/clone** seluruh isi folder ini ke komputer Anda.
2. **Buka file `index.html`** di browser modern (Chrome, Edge, Firefox, dsb).
3. **Izinkan akses kamera** saat diminta.
4. Arahkan kamera ke tanaman herbal yang ingin dideteksi, lalu klik tombol **"Scan"**.
5. Hasil deteksi dan penjelasan terkait tanaman herbal yang terdeteksi akan muncul di bawah tombol.

> **Catatan:**  
> Tidak perlu instalasi server atau library tambahan. Semua berjalan di sisi client (browser).

---

## Penjelasan Teknis & Contoh Kode

### 1. **index.html** (Kode utama)

```html
<!DOCTYPE html>
<html lang="id">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Deteksi Tanaman Herbal</title>
  <link rel="icon" href="logo.png">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Poppins:wght@400;600;700&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="style.css">
</head>
<body class="preloading">
  <div id="preloader"><img src="logo.png" alt="Logo" id="preloader-logo"></div>
  <!-- Hapus hiasan kiri dan kanan -->
  <!--<img class="hiasan hiasan-kiri" src="hiasan.png" alt="hiasan kiri" ... >-->
  <!--<img class="hiasan hiasan-kanan" src="hiasan.png" alt="hiasan kanan" ... >-->
  <header class="ai-header">
    <!-- Hapus logo dan label AI Scan -->
    <!--<img src="logo.png" alt="Logo" class="ai-logo">-->
    <span class="ai-title"> Deteksi Tanaman Herbal</span>
  </header>
  <main class="ai-main">
    <div class="ai-scan-container">
      <div class="ai-video-wrapper">
        <video id="video" autoplay playsinline></video>
        <button id="detectBtn" class="ai-scan-btn">
          <svg width="26" height="26" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="11" cy="11" r="8" stroke="#ffffff" stroke-width="2" fill="#1e1e1e"/><line x1="17" y1="17" x2="22" y2="22" stroke="#ffffff" stroke-width="2" stroke-linecap="round"/></svg>
          Scan
        </button>
      </div>
      <div id="result" class="ai-result-card">Arahkan kamera ke tanaman herbal yang ingin dikenali</div>
    </div>
  </main>
  <footer class="ai-footer">
    <span>Powered by <b>Soma & Darma</b> &copy; 2025</span>
  </footer>
  <script src="https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@1.7.4/dist/tf.min.js"></script>
  <script src="teachablemachine-image.min.js"></script>
  <script>
    // Fungsi untuk membaca CSV dan mengubah ke objek
    async function loadCSVData() {
      const response = await fetch('data/tanaman_herbal.csv');
      const text = await response.text();
      const lines = text.trim().split('\n');
      const headers = lines[0].split(';');
      const data = {};
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(';');
        data[row[1].toLowerCase().replace(/ /g, '_')] = {
          nama: row[1],
          namalatin: row[2],
          daerahutama: row[3],
          khasiat: row[4],
          bagianyangdigunakan: row[5],
          carapengolahan: row[6]
        };
      }
      return data;
    }

    const URL = "model/";
    let model, webcam, maxPredictions, herbalData;
    let video = document.getElementById('video');
    let detectBtn = document.getElementById('detectBtn');
    let resultDiv = document.getElementById('result');

    // Normalisasi label model ke key herbalData
    function normalizeLabel(label) {
      return label.toLowerCase().replace(/ /g, '_');
    }

    // Minta akses kamera saat halaman dibuka
    async function setupCamera() {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: "environment" }, audio: false });
        video.srcObject = stream;
      } catch (err) {
        resultDiv.innerHTML = 'Tidak dapat mengakses kamera: ' + err.message;
        detectBtn.disabled = true;
      }
    }

    // Load model teachable machine
    async function loadModel() {
      model = await tmImage.load(URL + "model.json", URL + "metadata.json");
      maxPredictions = model.getTotalClasses();
    }

    // Deteksi Tanaman Herbal dari frame video
    async function predict() {
      if (!model) {
        resultDiv.innerHTML = 'Model belum siap.';
        return;
      }
      resultDiv.innerHTML = `
        <div class="ai-loading">
          <span class="ai-loading-text">Mendeteksi Tanaman Herbal</span>
          <span class="ai-dots"><span class="ai-dot">.</span><span class="ai-dot">.</span><span class="ai-dot">.</span></span>
        </div>
      `;
      await new Promise(resolve => setTimeout(resolve, 1200));
      const prediction = await model.predict(video);
      let best = prediction[0];
      for (let i = 1; i < prediction.length; i++) {
        if (prediction[i].probability > best.probability) best = prediction[i];
      }
      if (best.probability > 0.7) {
        const key = normalizeLabel(best.className);
        const data = herbalData[key];
        if (data) {
          resultDiv.innerHTML = '<div class="herbal-card" id="herbalCard"></div>';
          const card = document.getElementById('herbalCard');
          const parts = [
            `<div class=\"herbal-title\">${data.nama}</div>`,
            `<div class=\"herbal-section\"><b>Nama Latin</b><br>${data.namalatin}</div>`,
            `<div class=\"herbal-section\"><b>Daerah Utama</b><br>${data.daerahutama}</div>`,
            `<div class=\"herbal-section\"><b>Khasiat</b><br>${data.khasiat}</div>`,
            `<div class=\"herbal-section\"><b>Bagian yang Digunakan</b><br>${data.bagianyangdigunakan}</div>`,
            `<div class=\"herbal-section\"><b>Cara Pengolahan</b><br>${data.carapengolahan}</div>`,
            
          ];
          function typeWriter(target, html, cb) {
            let i = 0;
            function typing() {
              target.innerHTML = html.slice(0, i) + '<span class="ai-cursor">|</span>';
              i++;
              if (i <= html.length) { 
                setTimeout(typing, 18);
              } else {
                target.innerHTML = html;
                if (cb) cb();
              }
            }
            typing();
          }
          let i = 0;
          function showPartTypewriter() {
            const wrapper = document.createElement('div');
            card.appendChild(wrapper);
            typeWriter(wrapper, parts[i], function() {
              i++;
              if (i < parts.length) setTimeout(showPartTypewriter, 350);
            });
          }
          showPartTypewriter();
        } else {
          resultDiv.innerHTML = `<span class="label">${best.className}</span><br>Data detail tidak ditemukan.`;
        }
      } else {
        resultDiv.innerHTML = 'Tanaman herbal tidak terdeteksi dengan yakin. Coba ulangi.';
      }
    }

    // Inisialisasi
    window.addEventListener('DOMContentLoaded', async () => {
      await setupCamera();
      await loadModel();
      herbalData = await loadCSVData();
      detectBtn.disabled = false;
    });
    detectBtn.onclick = predict;

    window.addEventListener('DOMContentLoaded', function() {
      setTimeout(function() {
        document.getElementById('preloader').style.display = 'none';
        document.body.classList.remove('preloading');
      }, 2000);
    });
  </script>
</body>
</html> 
```

### 2. **style.css** (Contoh style utama)

```css
@import url('https://fonts.googleapis.com/css2?family=Helvetica:wght@400;500;600;700&display=swap');

/* === Root Variables === */
:root {
  --primary: #1c3934;
  --primary-dark: #162c28;
  --secondary: #2a2a2a;
  --light: #e2e8ea;
  --dark: #1e1e1e; 
  --gray: #d1d5db;
  --shadow-sm: 0 2px 4px rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 12px #0000001a;
  --shadow-lg: 0 8px 24px rgba(0, 0, 0, 0.15);
  --transition: all 0.3s ease;
}

/* === Global Styles === */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
  font-family: 'Helvetica', sans-serif;
}

body {
  background: linear-gradient(270deg, #e2e8ea, #1c3934 50%, #162c28);
  background-size: 800% 800%;
  animation: gradientShift 20s ease infinite;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 16px;
  line-height: 1.5;
  transition: background 0.3s ease;
}

@keyframes gradientShift {
  0% { background-position: 0% 50%; }
  50% { background-position: 100% 50%; }
  100% { background-position: 0% 50%; }
}

/* === Header === */
.ai-header {
  width: 100%;
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #ffffff;
  padding: 1.25rem 2rem;
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 1rem;
  box-shadow: 0 4px 20px rgba(28, 57, 52, 0.6);
  position: sticky;
  top: 0;
  z-index: 100;
}

.ai-logo {
  width: 48px;
  height: 48px;
  object-fit: contain;
  filter: drop-shadow(0 2px 4px rgba(0, 0, 0, 0.15));
}

.ai-title {
  font-size: 1.75rem;
  font-weight: 700;
  letter-spacing: 0.03em;
  text-align: center;
  max-width: 80%;
  flex-grow: 1;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.ai-badge {
  background: linear-gradient(90deg, #a78b3a, #d4c07a);
  color: #ffffff;
  padding: 0.35rem 0.9rem;
  border-radius: 12px;
  font-size: 0.9rem;
  font-weight: 600;
  box-shadow: var(--shadow-sm);
}

/* === Main Content === */
.ai-main {
  flex: 1;
  padding: 2rem 1.5rem;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
  width: 100%;
  max-width: 1200px;
}

.ai-scan-container {
  width: 100%;
  max-width: 640px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
  animation: fadeIn 0.6s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.ai-video-wrapper {
  position: relative;
  width: 100%;
  max-width: 640px;
  border-radius: 12px;
  overflow: hidden;
  box-shadow: var(--shadow-lg);
  aspect-ratio: 4 / 3;
  background-color: var(--dark);
}

#video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.ai-scan-btn {
  position: absolute;
  bottom: 1.5rem;
  left: 50%;
  transform: translateX(-50%);
  background: linear-gradient(135deg, var(--primary), var(--primary-dark));
  color: #ffffff;
  border: none;
  padding: 0.75rem 1.75rem;
  border-radius: 50px;
  font-size: 1rem;
  font-weight: 600;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  box-shadow: 0 0 12px var(--primary);
  transition: var(--transition);
  z-index: 2;
}

.ai-scan-btn:hover {
  transform: translateX(-50%) scale(1.05);
  box-shadow: 0 0 24px var(--primary-dark);
}

.ai-scan-btn:active {
  transform: translateX(-50%) scale(0.98);
}

.ai-scan-btn svg {
  width: 20px;
  height: 20px;
}

.ai-result-card, #result {
  color: var(--dark);
  font-size: 1rem;
  width: 100%;
  max-width: 640px;
  text-align: center;
}

/* === Content Cards === */
.herbal-card {
  background: #ffffff;
  border-radius: 12px;
  box-shadow: var(--shadow-md);
  padding: 1.5rem 2rem;
  margin: 1rem auto;
  max-width: 640px;
  width: 100%;
  text-align: center;
}

.herbal-title {
  font-size: 2rem;
  font-weight: 700;
  margin-bottom: 0.75rem;
  color: var(--primary);
  text-align: center;
  max-width: 100%;
  letter-spacing: 0.02em;
  text-shadow: 1px 1px 3px rgba(0, 0, 0, 0.2);
}

.herbal-section {
  margin-bottom: 0.4rem;
  font-size: 1.1rem;
  color: var(--dark);
  text-align: center;
}

.desc {
  color: var(--dark);
  font-size: 1rem;
  line-height: 1.6;
  text-align: center;
  max-width: 90%;
}

/* === Loading Animation === */
.ai-loading {
  color: var(--dark);
  font-size: 0.95rem;
  font-weight: 500;
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
}

.ai-dots {
  display: inline-block;
  width: 24px;
}

.ai-dot {
  opacity: 0.3;
  animation: aiDotBlink 1.2s infinite;
  font-weight: bold;
  font-size: 1.1em;
  color: var(--dark);
}

.ai311
.ai-dot:nth-child(2) { animation-delay: 0.2s; }
.ai-dot:nth-child(3) { animation-delay: 0.4s; }

@keyframes aiDotBlink {
  0%, 80%, 100% { opacity: 0.3; }
  40% { opacity: 1; }
}

/* === Scrollbar === */
::-webkit-scrollbar {
  width: 10px;
  background: var(--light);
}

::-webkit-scrollbar-thumb {
  background: var(--gray);
  border-radius: 10px;
}

/* === Responsive Design === */
@media (max-width: 600px) {
  body {
    font-size: 0.9rem;
  }
  .ai-header {
    padding: 1rem 1.25rem;
    gap: 0.5rem;
  }
  .ai-logo {
    width: 36px;
    height: 36px;
  }
  .ai-title {
    font-size: 1.25rem;
    max-width: 100%;
    letter-spacing: 0.025em;
  }
  .ai-badge {
    font-size: 0.8rem;
    padding: 0.25rem 0.6rem;
  }
  .ai-main {
    padding: 1rem;
    gap: 1rem;
  }
  .ai-scan-container {
    max-width: 100%;
    gap: 1rem;
  }
  .ai-video-wrapper {
    max-width: 100%;
    aspect-ratio: 1 / 1;
    border-radius: 8px;
  }
  .ai-scan-btn {
    font-size: 0.85rem;
    padding: 0.5rem 1.25rem;
    bottom: 1rem;
  }
  .herbal-card {
    padding: 1rem 1.25rem;
  }
  .herbal-title {
    font-size: 1.1rem;
    max-width: 100%;
  }
  .ai-footer {
    font-size: 0.85rem;
    padding: 0.75rem;
  }
}

@media (max-width: 768px) {
  .ai-header {
    padding: 1rem 2rem;
  }
  .ai-main {
    padding: 1.25rem 1.5rem;
  }
  .ai-scan-btn {
    padding: 0.6rem 1.5rem;
    font-size: 0.9rem;
  }
}

/* === Pulse Animation === */
@keyframes pulse {
  0% { box-shadow: 0 0 0 0 rgba(28, 57, 52, 0.4); }
  70% { box-shadow: 0 0 0 12px rgba(28, 57, 52, 0); }
  100% { box-shadow: 0 0 0 0 rgba(28, 57, 52, 0); }
}

.detected {
  animation: pulse 1.5s ease-out;
}

/* === Permission Overlay === */
.permission-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(28, 57, 52, 0.95);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
  z-index: 1000;
  color: #ffffff;
  text-align: center;
}

.permission-overlay h2 {
  font-size: 1.5rem;
  margin-bottom: 1rem;
  color: #ffffff;
}

.permission-overlay p {
  margin-bottom: 1.5rem;
  max-width: 480px;
  font-size: 0.95rem;
}

.permission-btn {
  background-color: var(--primary);
  color: #ffffff;
  border: none;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  font-size: 0.95rem;
  font-weight: 600;
  cursor: pointer;
  transition: var(--transition);
}

.permission-btn:hover {
  background-color: var(--primary-dark);
  transform: translateY(-2px);
}

/* === Loading Text Animation === */
.ai-loading-text {
  margin-right: 0.5rem;
  animation: bounce 1.5s infinite ease-in-out;
}

.ai-cursor {
  display: inline-block;
  width: 2px;
  background: var(--dark);
  animation: blink-cursor 0.8s steps(1) infinite;
  height: 1.2em;
  vertical-align: middle;
}

@keyframes blink-cursor {
  0%, 100% { opacity: 1; }
  50% { opacity: 0; }
}

/* === Decorative Elements === */
.hiasan {
  position: fixed;
  top: 50%;
  transform: translateY(-50%);
  width: 80px;
  opacity: 0.8;
  z-index: 1;
  pointer-events: none;
}

.hiasan-kiri {
  left: 0;
}

.hiasan-kanan {
  right: 0;
}

@media (max-width: 700px) {
  .hiasan { display: none; }
}

/* === Preloader === */
#preloader {
  position: fixed;
  z-index: 9999;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: var(--light);
  display: flex;
  align-items: center;
  justify-content: center;
  transition: opacity 0.5s ease-out;
}

#preloader-logo {
  width: 500px;
  height: 500px;
  animation: zoom-logo 1.5s ease-in-out infinite;
}

@keyframes zoom-logo {
  0%, 100% { transform: scale(1); }
  50% { transform: scale(1.2); }
}
```

### 3. **model/**
- Berisi file model hasil training Teachable Machine: `model.json`, `metadata.json`, `weights.bin`.
- Model ini digunakan untuk mendeteksi gambar tanaman herbal dari kamera.

---

## Kustomisasi

- Untuk menambah jenis tanaman herbal baru:
  1. Latih ulang model di Teachable Machine.
  2. Ganti file model di folder `model/`.
  3. Tambahkan data tanaman baru di file tanaman_herbal.csv, sesuaikan dengan kolom yang sudah ditentukan
- Untuk mengubah tampilan, edit file `style.css`.

---
## Lisensi

Aplikasi ini dibuat untuk edukasi dan pelestarian tanaman herbal.  
Silakan gunakan, modifikasi, dan distribusikan dengan tetap mencantumkan sumber. 