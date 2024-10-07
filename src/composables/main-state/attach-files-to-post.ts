export default function (this: MainState, items: DataTransferItemList): boolean {
  const attachingItems = Array.from(items)
    .filter((item: DataTransferItem) => {
      // 対象はメディアファイルのみ
      return item.kind === "file" && (
        item.type.startsWith("image/") ||
        item.type.startsWith("video/")
      )
    })
  if (attachingItems.length === 0) {
    return false
  }
  const fileList = attachingItems
    .map((item: DataTransferItem) => {
      return item.getAsFile()
    }) as unknown as FileList
  if (this.sendPostPopupProps.visibility) {
    this.sendPostPopupProps.fileList = fileList
  } else {
    this.openSendPostPopup({
      type: "post",
      fileList,
    })
  }
  return true
}
