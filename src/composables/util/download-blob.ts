export default function (blobData: any, blobOption: { [k: string]: any }, fileName: string) {
  const blob = new Blob(blobData, blobOption)
  const objectURL = URL.createObjectURL(blob)
  const linkElement = document.createElement("a")
  linkElement.setAttribute("href", objectURL)
  linkElement.setAttribute("download", fileName)
  linkElement.click()
}
