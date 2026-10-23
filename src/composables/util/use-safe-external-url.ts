import { inject } from "vue"
import safeExternalUrl from "@/composables/util/safe-external-url"

// 許可されないスキームの URL を開こうとしたときの処理
// リンクを無効にするだけだと押しても反応がなくバグに見えるため、URL をエラーポップアップで表示する
export function useSafeExternalUrl () {
  const mainState = inject("state") as MainState

  function openInvalidUrlPopup (url?: string) {
    mainState.openErrorPopup("invalidUrlError", url)
  }

  // `href` に `Util.safeExternalUrl()` を通したリンクの click ハンドラー
  // 内側の要素（検索ボタン等）で既に処理済みの click は無視する
  function onClickExternalLink (event: MouseEvent, url?: string) {
    if (event.defaultPrevented || safeExternalUrl(url) != null) {
      return
    }
    event.preventDefault()
    openInvalidUrlPopup(url)
  }

  return {
    openInvalidUrlPopup,
    onClickExternalLink,
  }
}
