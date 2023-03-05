export const getFileAsUint8Array = (file: File): Promise<null | Uint8Array> =>
  new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event: ProgressEvent) => {
      if (event.target == null) reject(null)
      const buffer: null | string | ArrayBuffer = (event.target as FileReader).result ?? null
      if (buffer == null) reject(null)
      resolve(new Uint8Array(buffer as ArrayBuffer))
    }
    fileReader.readAsArrayBuffer(file)
  })
