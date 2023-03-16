export default function (json: unknown) {
  const windowObject = window.open()
  const jsonHtml = JSON.stringify(json, null, 2).replace(/</g, '&lt;').replace(/>/g, '&gt;')
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
