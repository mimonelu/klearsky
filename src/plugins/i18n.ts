import type { App } from "vue"
import Util from "@/composables/util"

interface TITranslationMap {
  [k: string]: {
    [k: string]: string
  }
}

// 翻訳
export default {
  install(app: App, translationMap: TITranslationMap) {
    // 翻訳キー数を検証（開発環境のみ）
    if (import.meta.env.DEV) {
      validateTranslationKeys(translationMap)
    }

    let currentLanguage = Util.getUserLanguage() ?? "en"

    app.provide("$setCurrentLanguage", (newLanguage: string) => {
      currentLanguage = newLanguage
    })

    app.provide("$getCurrentLanguage", (): string => {
      return currentLanguage
    })

    function $t (key: string): string {
      return translationMap[currentLanguage]?.[key] ?? translationMap.en?.[key] ?? key
    }
    app.config.globalProperties.$t = $t
    app.provide("$t", $t)
  },
}

// 翻訳キー数の検証
function validateTranslationKeys (translationMap: TITranslationMap) {
  const languageKeys = Object.entries(translationMap).map(([lang, trans]) => ({
    language: lang,
    keys: new Set(Object.keys(trans)),
    count: Object.keys(trans).length
  }))

  // キー数の統計を表示
  const keyCountsText = languageKeys.map(({ language, count }) => `${language.toUpperCase()}:${count}`).join(', ')
  console.log(`Translation keys count: ${keyCountsText}`)

  // すべてのキーの集合を作成（最も多いキーを持つ言語をベースにする）
  const allKeys = new Set<string>()
  languageKeys.forEach(({ keys }) => {
    keys.forEach(key => allKeys.add(key))
  })

  // 各言語の不足キーをチェック
  const missingKeysReport = languageKeys.map(({ language, keys, count }) => {
    const missing = [...allKeys].filter(key => !keys.has(key))
    return { language, count, missing }
  })

  // 不整合チェック
  const keyCounts = languageKeys.map(item => item.count)
  const maxCount = Math.max(...keyCounts)
  const minCount = Math.min(...keyCounts)

  if (maxCount !== minCount) {
    console.error(`⚠️ Translation key mismatch! Expected: ${allKeys.size}, Found: Min=${minCount}, Max=${maxCount} (diff: ${maxCount - minCount})`)

    // 詳細な不足キー情報を表示
    missingKeysReport.forEach(({ language, count, missing }) => {
      if (missing.length > 0) {
        console.error(`   ❌ ${language.toUpperCase()}: ${count} keys (missing ${missing.length} keys)`)
        if (missing.length <= 10) {
          console.error(`      Missing keys: ${missing.join(', ')}`)
        } else {
          console.error(`      Missing keys: ${missing.slice(0, 10).join(', ')} ... and ${missing.length - 10} more`)
        }
      } else {
        console.log(`   ✅ ${language.toUpperCase()}: ${count} keys`)
      }
    })
  } else {
    console.log(`✅ All translation files have ${maxCount} keys`)
  }
}
