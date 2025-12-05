import { ref } from "vue"
import jaconv from "jaconv"

export function useEasterEgg (
  easyFormState: { text: string },
  getTextarea: () => HTMLTextAreaElement | null
) {
  const savedText = ref<string>("")

  function getSelectionRange (): { start: number; end: number } {
    const textarea = getTextarea()
    let start = 0
    let end = easyFormState.text.length
    if (textarea != null) {
      const selStart = textarea.selectionStart
      const selEnd = textarea.selectionEnd
      if (selStart !== selEnd) {
        start = selStart
        end = selEnd
      }
    }
    return { start, end }
  }

  function applyTransformation (transformer: (text: string) => string) {
    // 変換前にテキストを保存
    savedText.value = easyFormState.text

    const { start, end } = getSelectionRange()
    const before = easyFormState.text.substring(0, start)
    const target = easyFormState.text.substring(start, end)
    const after = easyFormState.text.substring(end)
    easyFormState.text = before + transformer(target) + after
  }

  function invertText () {
    applyTransformation((text) => Array.from(text).reverse().join(""))
  }

  function punctuateText () {
    applyTransformation((text) => Array.from(text).join(" "))
  }

  function makeTextBold () {
    applyTransformation((text) => {
      return Array.from(text).map((char) => {
        const code = char.charCodeAt(0)
        // A-Z → 𝐀-𝐙
        if (code >= 0x41 && code <= 0x5A) {
          return String.fromCodePoint(code - 0x41 + 0x1D400)
        }
        // a-z → 𝐚-𝐳
        if (code >= 0x61 && code <= 0x7A) {
          return String.fromCodePoint(code - 0x61 + 0x1D41A)
        }
        // 0-9 → 𝟎-𝟗
        if (code >= 0x30 && code <= 0x39) {
          return String.fromCodePoint(code - 0x30 + 0x1D7CE)
        }
        return char
      }).join("")
    })
  }

  function italicizeText () {
    applyTransformation((text) => {
      return Array.from(text).map((char) => {
        const code = char.charCodeAt(0)
        // A-Z → 𝐴-𝑍
        if (code >= 0x41 && code <= 0x5A) {
          return String.fromCodePoint(code - 0x41 + 0x1D434)
        }
        // h → ℎ (U+210E) - 数学用斜体小文字の h (U+1D455) は欠番
        if (code === 0x68) {
          return String.fromCodePoint(0x210E)
        }
        // a-g, i-z → 𝑎-𝑔, 𝑖-𝑧
        if (code >= 0x61 && code <= 0x7A) {
          return String.fromCodePoint(code - 0x61 + 0x1D44E)
        }
        return char
      }).join("")
    })
  }

  function strikethroughText () {
    applyTransformation((text) => {
      return Array.from(text).map((char) => char + "\u0336").join("")
    })
  }

  function convertToZenkaku () {
    applyTransformation((text) => {
      let result = jaconv.toZenAscii(text)
      result = jaconv.toZenKana(result)
      return result
    })
  }

  function convertToHankaku () {
    applyTransformation((text) => {
      let result = jaconv.toHanAscii(text)
      result = jaconv.toHanKana(result)
      return result
    })
  }

  function restoreText () {
    if (savedText.value !== "") {
      easyFormState.text = savedText.value
      savedText.value = ""
    }
  }

  function hasSavedText (): boolean {
    return savedText.value !== ""
  }

  function applyEasterEgg (type: string) {
    switch (type) {
      case "invertText":
        invertText()
        break
      case "punctuateText":
        punctuateText()
        break
      case "makeTextBold":
        makeTextBold()
        break
      case "italicizeText":
        italicizeText()
        break
      case "strikethroughText":
        strikethroughText()
        break
      case "convertToZenkaku":
        convertToZenkaku()
        break
      case "convertToHankaku":
        convertToHankaku()
        break
      case "restoreText":
        restoreText()
        break
      default:
        break
    }
  }

  return {
    applyEasterEgg,
    hasSavedText,
  }
}
