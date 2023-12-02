export default async (url: string): Promise<void> => {
  const anchorElement: HTMLAnchorElement = document.createElement("a")
  if (url.startsWith("blob:")) {
    const response = await fetch(url)
    if (!response.ok) {
      throw { error: `Failed to fetch Blob data. Status: ${response.status}` }
    }
    const blobData: Blob = await response.blob()
    url = URL.createObjectURL(blobData)
  }
  anchorElement.href = url
  let fileName: undefined | string = getFileNameFromUrl(url)
  if (fileName == null) {
    throw { error: "Invalid URL: Unable to extract filename." }
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
