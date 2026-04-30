# youtube-hover-dictionary

A lightweight Chrome extension for learning English while watching YouTube — without interrupting playback.

---

## ✨ Features

- Custom subtitle overlay on YouTube
- Highlights important words and phrases
- Hover to instantly see meanings (no pause needed)
- Save words by clicking on them
- View saved words in the popup
- Delete saved words
- Adjust display settings using keyboard shortcuts

Currently optimized for Japanese learners (Japanese translations included).
---

## 🆕 New Feature: Word Saving

Added a feature to save words by clicking on them.

**What you can do**
- Save words directly from subtitles by clicking
- View saved words in the popup
- Delete unnecessary words

---

## 💡 Concept

> Stop pausing videos. Understand while watching.

Most language learners struggle with:

* Pausing videos repeatedly
* Looking up words manually
* Losing focus during learning

This extension solves that by showing meanings instantly on hover, allowing continuous and natural learning.

---

## 🛠️ Tech Stack

* TypeScript
* React (for popup)
* Chrome Extension (Manifest V3)
* DOM manipulation

---

## 🚀 How It Works

- Captures YouTube subtitles in real-time
- Wraps each word to make it interactive
- Highlights important words and phrases
- Displays meanings on hover

---

## 📝 How to Use
1. Enable English subtitles on YouTube
2. Click any word you want to save
3. Open the extension popup to view saved word

---

## ⌨️ Keyboard Shortcuts

| Key         | Action                    |
| ----------- | ------------------------- |
| `S`         | Toggle subtitles ON / OFF |
| `ArrowDown` | Move subtitles downward   |
| `+`         | Increase font size        |
| `-`         | Decrease font size        |

---

## ⚙️ Installation

1. Clone this repository
2. Run:

   ```
   npm install
   npm run build
   ```
3. Open Chrome Extensions
4. Enable Developer Mode
5. Load the `build/chrome-mv3-prod` folder

---

## 📌 Future Improvements

* Save words for review
* Pronunciation feature
* Better NLP-based phrase detection
* UI customization options

---

## 🤔 Why I Built This

I wanted a simpler and more focused alternative to existing tools.

Instead of adding many features, I focused on:

* Speed
* Simplicity
* Learning efficiency

---

## 📷 Demo

![Demo](./assets/demo.gif)
![Demo](./assets/demo2.gif)

---

## 📚 Dictionary Data

The dictionary data is **not included** in this repository due to licensing reasons.

Please prepare your own dataset and add it.

---

### 📂 Dictionary Setup

This extension uses two separate dictionaries:

- `assets/wordDict.json` → single words (highlighted in **red**)
- `assets/PhraseDict.json` → phrases (highlighted in **blue**)

Please provide your own data in the following format:

```json
{
  "run": { "ja": "走る" },
  "take off": { "ja": "離陸する" }
}

```
---

## 📄 License

MIT
