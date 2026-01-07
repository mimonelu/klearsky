export default async function writeTextToClipboard (text: string): Promise<boolean> {
  // Clipboard API が使えない場合（HTTP接続時など）は処理をスキップ
  if (
    !navigator.clipboard ||
    !navigator.clipboard.writeText
  ) {
    $warn("Clipboard API is not available (HTTPS required)")
    return false
  }

  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (error) {
    $error("Failed to copy to clipboard:", error)
    return false
  }
}
