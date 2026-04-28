/// <reference types="react" />

import { useEffect, useState, type ChangeEvent } from "react"

type Word = {
  word: string
  meaning: string
}


type Settings = {
  fontSize: number
  bottom: number
}


function Popup() {
  const [fontSize, setFontSize] = useState<number>(24)
  const [bottom, setBottom] = useState<number>(5)

  const [words, setWords] = useState<Word[]>([])

  useEffect(() => {
    const loadWords = () => {
      chrome.storage.local.get(["words"]).then((result) => {
        const next: Word[] = Array.isArray(result.words)
          ? result.words
          : []
        setWords(next)
      })
    }

    loadWords()

    const onStorage = (
      changes: Record<string, chrome.storage.StorageChange>,
      areaName: string
    ) => {
      if (areaName !== "local" || changes.words === undefined) return

      const v = changes.words.newValue
      if (Array.isArray(v)) {
        setWords(v as Word[])
      } else {
        loadWords()
      }
    }

    chrome.storage.onChanged.addListener(onStorage)

    return () => {
      chrome.storage.onChanged.removeListener(onStorage)
    }
  }, [])

  const deleteWord = async (word: string) => {
    const result = await chrome.storage.local.get(["words"])

    const words: Word[] = Array.isArray(result.words)
      ? result.words
      : []

    const newWords = words.filter((w) => w.word !== word)

    await chrome.storage.local.set({ words: newWords })
    setWords(newWords)
  }

  useEffect(() => {
    if (!chrome?.storage?.sync) return

    chrome.storage.sync.get(["settings"], (res) => {
      const s = res.settings as Settings | undefined

      if (s) {
        setFontSize(s.fontSize)
        setBottom(s.bottom)
      }
    })
  }, [])

  const save = () => {
    if (!chrome?.storage?.sync) return

    const settings: Settings = { fontSize, bottom }
    chrome.storage.sync.set({ settings })
  }

  return (
    <div>
      <div>
        サイズ: {fontSize}
        <input
          type="range"
          min="12"
          max="40"
          value={fontSize}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setFontSize(Number(e.target.value))
          }
        />
      </div>

      <div>
        位置: {bottom}
        <input
          type="range"
          min="0"
          max="50"
          value={bottom}
          onChange={(e: ChangeEvent<HTMLInputElement>) =>
            setBottom(Number(e.target.value))
          }
        />
      </div>
      <button onClick={save}>保存</button>

<hr />

<h3>Saved Words</h3>

{words.length === 0 && <p>No words yet</p>}

<ul style={{ listStyle: "none", padding: 0 }}>
  {words.map((w, i) => (
    <li key={i} style={{ marginBottom: "6px" }}>
      <b>{w.word}</b>
      {w.meaning ? ` — ${w.meaning}` : ""}

      <button
        onClick={() => deleteWord(w.word)}
        style={{ marginLeft: "8px", fontSize: "10px" }}
      >
        x
      </button>
    </li>
  ))}
</ul>

    </div>


  )
}

export default Popup

