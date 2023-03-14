import { watch } from "vue"
import format from "date-fns/format"

export function blurElement () {
  (document.activeElement as null | HTMLElement)?.blur()
}

export function formatDate (date: string): string {
  return format(new Date(date), "MM/dd HH:mm:ss")
}

export function getFileAsUint8Array (file: File): Promise<null | Uint8Array> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader()
    fileReader.onload = (event: ProgressEvent) => {
      if (event.target == null) reject(null)
      const buffer: null | string | ArrayBuffer = (event.target as FileReader).result ?? null
      if (buffer == null) reject(null)
      resolve(new Uint8Array(buffer as ArrayBuffer))
    }
    fileReader.readAsArrayBuffer(file)
  })
}

export function showJson (json: unknown) {
  const windowObject = window.open()
  const jsonHtml = JSON.stringify(json, null, 2).replace('<', '&lt;').replace('>', '&gt;')
  windowObject?.document.write(`
<style>
* {
  margin: 0;
  padding: 0;
}
body {
  background-color: #202020;
  color: #f0f0f0;
  font-family: monospace;
  padding: 1rem;
}
pre {
  word-break: break-all;
  white-space: pre-wrap;
}
</style>
<pre>${jsonHtml}</pre>`)
}

export function waitProp (getter: Function, value: any): Promise<boolean> {
  return new Promise((resolve) => {
    watch(getter, (newValue: any) => {
      if (newValue === value) resolve(true)
    })
  })
}
