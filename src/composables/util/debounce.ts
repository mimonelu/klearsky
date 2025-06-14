/**
 * 関数の実行を遅延させ、連続する呼び出しをキャンセルするdebounce関数
 * @param func 実行する関数
 * @param delay 遅延時間（ミリ秒）
 * @returns debounceされた関数（cancelメソッド付き）
 */
export default function debounce<T extends (...args: any[]) => any>(
  func: T,
  delay: number
): T & { cancel: () => void } {
  let timeoutId: number | null = null

  const debouncedFunction = ((...args: Parameters<T>) => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
    }
    timeoutId = window.setTimeout(() => {
      func(...args)
      timeoutId = null
    }, delay)
  }) as T & { cancel: () => void }

  debouncedFunction.cancel = () => {
    if (timeoutId !== null) {
      clearTimeout(timeoutId)
      timeoutId = null
    }
  }

  return debouncedFunction
}
