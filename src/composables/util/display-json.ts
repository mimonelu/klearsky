export default function (json: unknown, title?: string) {
  const windowObject = window.open()
  const jsonHtml = JSON.stringify(json, null, 2)
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
  windowObject?.document.write(`
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="format-detection" content="telephone=no">
    <title>Klearsky - Source Viewer</title>
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
    h1 {
      font-size: 1rem;
      margin-bottom: 1rem;
    }
    pre {
      word-break: break-all;
      white-space: pre-wrap;
    }
    </style>
  </head>
  <body>
    ${title ? "<h1>" + title + "</h1>" : ""}
    <pre>${jsonHtml}</pre>
  </body>
</html>`)
}
