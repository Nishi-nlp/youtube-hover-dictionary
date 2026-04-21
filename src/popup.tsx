/// <reference types="react" />

import { useEffect, useState, type ChangeEvent } from "react"

type Settings = {
  fontSize: number
  bottom: number
}

function Popup() {
  const [fontSize, setFontSize] = useState<number>(24)
  const [bottom, setBottom] = useState<number>(5)

  useEffect(() => {
    chrome.storage.sync.get(["settings"], (res) => {
      const s = res.settings as Settings | undefined

      if (s) {
        setFontSize(s.fontSize)
        setBottom(s.bottom)
      }
    })
  }, [])

  const save = () => {
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
    </div>
  )
}

export default Popup