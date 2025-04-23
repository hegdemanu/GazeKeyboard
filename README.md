# 👁️ Gaze-Controlled Circular Keyboard

A futuristic, browser-based circular keyboard powered by [WebGazer.js](https://webgazer.cs.brown.edu/) that lets you **type with your eyes**. No mouse. No touch. Just pure gaze-powered input.

---

## 🚀 Demo

> 🔗 **[Run the Live Demo](https://drive.google.com/file/d/1WZJHW_LOzKFLq4eph7la2MD-Uc6XrhX0/view?usp=drive_link)**  
> *(Opens Google Drive link in a new tab)*
> *(Deploy this using GitHub Pages or Replit for instant preview)*

---

## 🧠 Features

- 🔵 **Circular Keyboard Layout** – A radial interface for intuitive visual navigation.
- 👁️ **Eye‑Gaze Tracking** – Uses WebGazer.js to detect where you're looking.
- ⏳ **Dwell‑Based Typing** – Letters are selected when your gaze hovers over them.
- 🎯 **Real‑Time Feedback** – Highlights which key you're currently targeting.
- 🌐 **Client‑Side Only** – No backend, no server, no nonsense.

---

## 📁 Repo Structure

```text
gaze-keyboard/
│
├── public/                     # Static files served as‑is
│   ├── index.html              # Entry point (links CSS & JS bundles)
│   └── favicon.ico
│
├── src/                        # Source code (editable)
│   ├── js/
│   │   ├── webgazer-init.js    # WebGazer configuration & calibration helpers
│   │   ├── keyboard.js         # Circular keyboard generation & dwell‑select logic
│   │   └── main.js             # Bootstraps the app, orchestrates modules
│   ├── css/
│   │   └── styles.css          # Core styling (radial layout, theming)
│   └── assets/
│       └── ui-sounds/          # Optional sound feedback (keypress, hover, etc.)
│
├── docs/                       # Project documentation & design notes
│   └── design‑spec.md
│
├── LICENSE                     # MIT by default (edit if needed)
├── .gitignore                  # Node, macOS, & editor junk
└── README.md                   # You’re reading it
```

---

## ⚙️ Setup Instructions

1. **Clone** or **download** the repository:
   ```bash
   git clone https://github.com/yourusername/gaze-keyboard.git
   cd gaze-keyboard
   ```
2. **Open** `public/index.html` in a modern browser (Chrome recommended).
3. **Allow webcam permissions** when prompted by WebGazer.
4. **Start typing** using your eyes!

---

## 🔍 How It Works

1. The keyboard is rendered as a circular array of keys inside the browser.
2. WebGazer.js continuously infers the `(x, y)` coordinates of your gaze on the page.
3. When your gaze remains over a key for longer than the **dwell threshold** (default `1.5 s`), the key “presses” itself.
4. The character is appended to the on‑screen output buffer.
5. Visual feedback (active ring & highlight) confirms each successful keypress.

---

## 🛠️ Customization

| Feature          | How to Change                                    |
|------------------|--------------------------------------------------|
| **Dwell Time**   | Tweak `const DWELL_THRESHOLD` in `src/js/main.js` |
| **Key Layout**   | Modify `const KEYS` array in `src/js/keyboard.js` |
| **Styling**      | Edit colors, fonts, and animations in `src/css/styles.css` |
| **Sounds**       | Drop new `.wav` files into `src/assets/ui-sounds/` and update paths in `main.js` |

---

## 📦 Dependencies

- **[WebGazer.js](https://webgazer.cs.brown.edu/)** – Eye‑tracking in the browser  
  Included via CDN in `<head>`:
  ```html
  <script src="https://unpkg.com/webgazer/dist/webgazer.min.js"></script>
  ```
- *(Optional)* **Live Server** – Run `npx serve public` for hot‑reload previews.

---

## 🙌 Acknowledgements

Built with ❤️ for futuristic human‑computer interaction. Inspired by accessibility research and the quest for seamless input methods.

---

## 📜 License

This project is licensed under the **MIT License**. Feel free to remix, extend, and share. For commercial use beyond the license, please contact the author.

---

## 👨‍💻 Author

**Manu Hegde**  
Student @ BITS Pilani, Goa  
ML Engineer • Backend Developer • HCI Enthusiast  
🔗 [LinkedIn](https://www.linkedin.com/in/hegdemanu/) • 📧 hegdemanu@gmail.com

