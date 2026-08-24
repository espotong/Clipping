# Klipin — Template Landing Page Pemotong Video

Template halaman landing statis (HTML + CSS + JS murni) untuk produk
bertema "pemotong video jadi klip pendek". Dibuat dari nol sebagai
alternatif bersih tanpa:

- **Watermark / logo pihak ketiga** — semua aset di sini original.
- **Login Google / OAuth pihak ketiga** — tidak ada tombol atau skrip
  autentikasi apa pun.
- **Token / kunci API** — tidak ada pemanggilan API berbayar,
  Mixpanel, Google Tag Manager, atau skrip pelacakan lain.

Cocok dipakai sebagai titik awal untuk proyekmu sendiri, lalu
disambungkan ke backend/pemrosesan videomu sendiri.

## Struktur berkas

```
clipforge/
├── index.html          # Halaman utama
├── css/
│   └── style.css       # Semua gaya, token warna & tipografi di bagian atas
├── js/
│   └── script.js       # Menu mobile, accordion FAQ, animasi scroll — vanilla JS
├── assets/
│   └── favicon.svg     # Ikon tab browser
├── README.md
├── LICENSE
└── .gitignore
```

Tidak ada proses build, package manager, atau dependency. Buka
`index.html` langsung di browser sudah bisa jalan.

## Menjalankan secara lokal

Karena tidak ada build step, cukup buka filenya langsung, atau jalankan
server statis sederhana (disarankan agar path relatif berjalan mulus):

```bash
# Python
python3 -m http.server 8000

# atau Node
npx serve .
```

Lalu buka `http://localhost:8000`.

## Unggah ke GitHub & aktifkan GitHub Pages

1. Buat repositori baru di GitHub (kosongkan, tanpa README bawaan).
2. Di folder proyek ini, jalankan:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: landing page pemotong video"
   git branch -M main
   git remote add origin https://github.com/<username>/<nama-repo>.git
   git push -u origin main
   ```
3. Di repositori GitHub: buka **Settings → Pages**.
4. Pada **Source**, pilih branch `main` dan folder `/ (root)`, lalu **Save**.
5. Tunggu beberapa menit — halaman akan tersedia di
   `https://<username>.github.io/<nama-repo>/`.

## Menyesuaikan

- **Teks & konten**: langsung di `index.html`.
- **Warna, font, radius**: variabel `:root` di baris paling atas
  `css/style.css`.
- **Interaksi (menu, accordion, form)**: `js/script.js` — tidak ada
  dependency eksternal, aman diubah sesuai kebutuhan.
- **Form pada bagian hero** (`#video-url`) saat ini hanya tampilan;
  sambungkan `submit` handler di `js/script.js` ke logika/pemrosesan
  videomu sendiri.

## Lisensi

Lihat berkas [LICENSE](LICENSE) — bebas dipakai, diubah, dan
didistribusikan ulang.
