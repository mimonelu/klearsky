export default async (url: string): Promise<undefined | Error> => {
  const anchorElement: HTMLAnchorElement = document.createElement("a")
  if (url.startsWith("blob:")) {
    const response = await fetch(url)
    if (!response.ok) {
      return Error("downloadImageError")
    }
    const blobData: Blob = await response.blob()
    url = URL.createObjectURL(blobData)
  }
  anchorElement.href = url
  let fileName: undefined | string = getFileNameFromUrl(url)
  if (fileName == null) {
    return Error("downloadImageError")
  }
  anchorElement.download = fileName
  anchorElement.target = "_blank"
  anchorElement.style.display = "none"
  document.body.appendChild(anchorElement)
  anchorElement.click()
  document.body.removeChild(anchorElement)
}

function getFileNameFromUrl (url: string): undefined | string {
  const parts: string[] = url.split("/")
  return parts.at(- 1)
}
