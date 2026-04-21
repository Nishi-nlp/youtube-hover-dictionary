import phraseDictData from "assets/phraseDict.json";
import wordDictData from "assets/wordDict.json";

type SubtitleData = {
  tStartMs: number;
  dDurationMs: number;
  text: string;
};

let subtitleData: SubtitleData[] = [];

let wordDict: Record<string, any> = {};
let phrasalVerbDict: Record<string, any> = {};

/**
 * Fetches the bundled word and phrase translation JSON assets from the extension package.
 * @returns An object with `wordDict` (per-word entries) and `phraseDict` (phrasal-verb style phrases).
 */
async function loadDict() {
  return {
    wordDict: wordDictData as Record<string, any>,
    phraseDict: phraseDictData as Record<string, any>
  };
}

loadDict().then(({ wordDict: w, phraseDict: p }) => {
  wordDict = w;
  phrasalVerbDict = p;

  console.log("Dictionary load complete");
});

const style = document.createElement("style");

style.innerHTML = `
.ytp-caption-window-container {
  display: none !important;
}
`;

type Settings = {
  fontSize: number;
  bottom: number;
};

let settings: Settings = {
  fontSize: 24,
  bottom: 11,
};

settings.bottom = Math.max(0, Math.min(50, settings.bottom));
settings.fontSize = Math.max(12, Math.min(40, settings.fontSize));

/**
 * Applies the current `settings` values to the subtitle overlay DOM (font size and vertical position).
 */
function applySettings() {
  console.log("apply", settings);
  overlay.style.fontSize = settings.fontSize + "px";
  overlay.style.bottom = settings.bottom + "%";
}

/**
 * Persists `settings` to `localStorage` under the key `subtitleSettings`.
 */
function saveSettings() {
  localStorage.setItem("subtitleSettings", JSON.stringify(settings));
}

document.head.appendChild(style);

const overlay = document.createElement("div");

document.body.appendChild(overlay);

overlay.style.position = "absolute";
overlay.style.bottom = settings.bottom + "%";
overlay.style.left = "50%";
overlay.style.transform = "translateX(-50%)";
overlay.style.transition = "opacity 0.3s ease";
overlay.style.width = "80%";

overlay.style.background = "rgba(0, 0, 0, 0.75)";
overlay.style.color = "white";

overlay.style.padding = "4px 8px";
overlay.style.borderRadius = "4px";

overlay.style.fontSize = "22px";
overlay.style.fontWeight = "bold";
overlay.style.lineHeight = "1.6";

overlay.style.textAlign = "center";
overlay.style.maxWidth = "70%";

overlay.style.zIndex = "9999";

overlay.style.pointerEvents = "none";

document.body.appendChild(overlay);

let isEnabled = true;

window.addEventListener("keydown", (e) => {
  if (e.key === "s") {
    isEnabled = !isEnabled;
    console.log("Subtitles", isEnabled ? "ON" : "OFF");
    showToast(isEnabled ? "ON" : "OFF");
  }

  if (e.key === "ArrowDown") {
    settings.bottom -= 1;
  }

  if (e.key === "+") {
    settings.fontSize += 2;
  }

  if (e.key === "-") {
    settings.fontSize -= 2;
  }

  applySettings();
  saveSettings();
});


/** Debounce timer for showing meanings on hover; cleared on each pointer move to cancel the pending show. */
let hoverTimer: number | null = null;

overlay.addEventListener("mousemove", (e) => {
  const target = e.target as HTMLElement;

  const span = target.closest("[data-word]") as HTMLElement | null;

  if (!span?.dataset.word) return;

  // Clear any pending show from the previous hover position
  if (hoverTimer) {
    clearTimeout(hoverTimer);
  }

  // Delay before showing the popup (avoids flicker when crossing many tokens)
  hoverTimer = window.setTimeout(() => {
    const word = span.dataset.word!;
    showMeaning(word, e.clientX, e.clientY);
  }, 200); // Tuning knob: try 200–400 ms
});

function shouldHidePopup(e: MouseEvent, rect: DOMRect) {
  const margin = 20;

  return (
    e.clientX < rect.left - margin ||
    e.clientX > rect.right + margin ||
    e.clientY < rect.top - margin ||
    e.clientY > rect.bottom + margin
  );
}

/**
 * Shows a fixed-position popup with the Japanese gloss for a word or phrase at the given coordinates.
 * Looks up `phrasalVerbDict` first, then `wordDict`; shows `"error"` if neither matches.
 * @param raw - Raw token from `data-word` (casing/whitespace may vary)
 * @param x - Viewport X for the popup’s `left`
 * @param y - Viewport Y for the popup’s `top`
 */
function showMeaning(raw: string, x: number, y: number) {
  const word = raw.toLowerCase().trim();
  const meaning =
    phrasalVerbDict[word]?.ja ||
    wordDict[word]?.ja ||
    "error";

  let meaningPopup = document.getElementById("meaning-popup");

  if (!meaningPopup) {
    meaningPopup = document.createElement("div");
    meaningPopup.id = "meaning-popup";
    document.body.appendChild(meaningPopup);
  }

  meaningPopup.innerText = `${word}: ${meaning}`;

  meaningPopup.style.position = "fixed";
  meaningPopup.style.left = x + "px";
  meaningPopup.style.top = y + "px";
  meaningPopup.style.background = "black";
  meaningPopup.style.color = "white";
  meaningPopup.style.padding = "10px 14px";
  meaningPopup.style.fontSize = "16px";
  meaningPopup.style.borderRadius = "6px";
  meaningPopup.style.zIndex = "999999";
  meaningPopup.style.boxShadow = "0 4px 12px rgba(0,0,0,0.3)";

}

const ytCaption = document.querySelector(".ytp-caption-window-container");
if (ytCaption) {
  (ytCaption as HTMLElement).style.display = "none";
}

overlay.addEventListener("mouseleave", () => {
  const popup = document.getElementById("meaning-popup");
  if (popup) popup.remove();
});

document.addEventListener("mousemove", (e) => {
  const popup = document.getElementById("meaning-popup");

  if (!popup) return;

  const rect = popup.getBoundingClientRect();

  if (shouldHidePopup(e, rect)) {
    popup.remove();
  }
});

/**
 * Loads subtitle overlay settings from `chrome.storage.sync` and reapplies them to the DOM when present.
 */
function loadSettings() {
  if (!chrome?.storage?.sync) {
    return;
  }

  chrome.storage.sync.get(["settings"], (res) => {
    if (res.settings) {
      settings = res.settings as Settings;
      applySettings();
    }
  });
}

if (chrome?.storage?.onChanged) {
  chrome.storage.onChanged.addListener((changes) => {
    if (changes.settings) {
      const next = changes.settings.newValue as Partial<Settings> | undefined;

      if (typeof next?.fontSize === "number" && typeof next?.bottom === "number") {
        settings = { fontSize: next.fontSize, bottom: next.bottom };
        applySettings();
      }
    }
  });
}

/**
 * Displays a short message in the top-right corner for one second, then removes the node.
 * @param msg - Text to show (e.g. toggle state for subtitles)
 */
function showToast(msg: string) {
  const toast = document.createElement("div");
  toast.innerText = msg;

  toast.style.position = "fixed";
  toast.style.top = "20px";
  toast.style.right = "20px";
  toast.style.background = "black";
  toast.style.color = "white";
  toast.style.padding = "8px";

  document.body.appendChild(toast);

  setTimeout(() => toast.remove(), 1000);
}

/**
 * If `text` is longer than 60 characters, inserts a `<br>` near the middle for line breaking.
 * Otherwise returns the string unchanged.
 * @param text - Raw caption line
 */
function formatText(text: string) {
  if (text.length > 60) {
    const mid = Math.floor(text.length / 2);
    return text.slice(0, mid) + "<br>" + text.slice(mid);
  }
  return text;
}

type SubtitleEventData = {
  type: string;
  lang?: string;
  tlang?: string;
  data: any;
};

// Holds the last merged caption string so we only append to subtitleData when it changes (module scope).
let lastSubtitleText = "";

/**
 * Returns which phrase keys from `phrasalVerbDict` appear as whole words in `text` (after `normalize`).
 * @param text - Caption segment text to scan
 */
function findPhrases(text: string) {
  const phrases: string[] = [];
  const normalizedText = normalize(text);

  for (let key in phrasalVerbDict) {
    const regex = new RegExp(`\\b${key}\\b`, "gi");

    if (regex.test(normalizedText)) {
      phrases.push(key);
    }
  }

  return phrases;
}

/**
 * Lowercases `word` and strips a trailing inflection suffix (`ing`, `ed`, or `s`) for dictionary lookup.
 * @param word - A single token or phrase fragment
 */
function normalize(word: string) {
  return word
    .toLowerCase()
    .replace(/(ing|ed|s)$/, "");
}

/**
 * Polls the page for YouTube caption segments, mirrors the latest line into `subtitleData`,
 * repositions the overlay under the caption window, and renders HTML with difficult words (red) and
 * phrasal matches (blue) wrapped in interactive spans for hover lookup.
 */
function update() {
  if (!isEnabled) {
    overlay.style.display = "none";
    return;
  }

  overlay.style.display = "block";

  const captions = document.querySelectorAll(".ytp-caption-segment");

  const captionTextCombined = Array.from(captions)
    .map((el) => el.textContent)
    .join(" ");

  if (captionTextCombined && captionTextCombined !== lastSubtitleText) {
    lastSubtitleText = captionTextCombined;

    subtitleData.push({
      text: captionTextCombined,
      tStartMs: Date.now(),
      dDurationMs: 3000,
    });

    // console.log(subtitleData)
  }

  //     console.log('update');
  const video = document.querySelector("video") as HTMLVideoElement | null;
  const player = document.querySelector(".html5-video-player");

  const captionContainer = document.querySelector(".ytp-caption-window-container");
  captionContainer?.parentElement?.appendChild(overlay);
  // console.log(video)
  // console.log(player)
  // console.log(subtitleData.en)

  if (!video || !player || subtitleData.length === 0) return;

  const latestSubtitleEntry = subtitleData[subtitleData.length - 1];

  if (!latestSubtitleEntry) return;

  let highlightWorking = latestSubtitleEntry.text;

  // Step 1: tokenize and collect dictionary "difficult" words
  const words = latestSubtitleEntry.text.split(/\s+/);

  const difficultWords = words.filter((word) => {
    const withoutPunctuation = word.toLowerCase().replace(/[.,!?;:()"]/g, "");
    const base = normalize(withoutPunctuation);
    return wordDict[base];
  });

  // Step 2: wrap phrase matches with placeholders before per-word highlighting
  const matchedPhrases = findPhrases(highlightWorking);

  matchedPhrases.forEach((phrase) => {
    const [verb, ...rest] = phrase.split(" ");
    const verbPattern = `${verb}(ing|ed|s)?`;
    const restPattern = rest.join(" ");

    const regex = new RegExp(`\\b${verbPattern} ${restPattern}\\b`, "gi");

    highlightWorking = highlightWorking.replace(regex, (match) => {
      return `__PHRASE__${match}__PHRASE__`;
    });
  });

  // Step 3: split by phrase placeholders, then mark difficult words inside non-phrase segments
  const highlightSegments = highlightWorking.split(/(__PHRASE__.*?__PHRASE__)/g);

  highlightSegments.forEach((segment, segmentIndex) => {
    if (segment.startsWith("__PHRASE__")) return;

    let segmentWithWordMarkers = segment;

    difficultWords.forEach((word) => {
      const withoutPunctuation = word.toLowerCase().replace(/[.,!?;:()"]/g, "");
      const regex = new RegExp(`\\b${withoutPunctuation}\\b`, "gi");

      segmentWithWordMarkers = segmentWithWordMarkers.replace(regex, (match) => {
        return `__WORD__${match}__WORD__`;
      });
    });

    highlightSegments[segmentIndex] = segmentWithWordMarkers;
  });

  highlightWorking = highlightSegments.join("");

  highlightWorking = highlightWorking.replace(
    /__WORD__(.*?)__WORD__/g,
    (_, word) => {
      const withoutPunctuation = word.toLowerCase().replace(/[.,!?;:()"]/g, "");
      const base = normalize(withoutPunctuation);

      return `<span style="color:red; pointer-events:auto;" data-word="${base}">${word}</span>`;
    }
  );

  highlightWorking = highlightWorking.replace(
    /__PHRASE__(.*?)__PHRASE__/g,
    (_, phrase) => {
      const base = normalize(phrase.toLowerCase());

      return `<span style="color:blue; pointer-events:auto;" data-word="${base}">${phrase}</span>`;
    }
  );

  overlay.innerHTML = highlightWorking;
}

loadSettings();
applySettings();

setInterval(update, 100);
