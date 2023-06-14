// Klearsky SVG List
// USAGE:
// $ npm i -D glob
// $ node svg-list.js

const { glob } = require("glob")
const fs = require("fs")
const path = require("path")

const svgDir = `${__dirname}/../src/svg/**/*.svg`
const htmlPath = `${__dirname}/svg-list.html`
const template = `<html lang="en">
  <head>
    <style>
*, * > * {
  margin: 0;
  padding: 0;
}
body {
  background-color: #202020;
  color: #f0f0f0;
  padding: 2em;
}
h1 {
  font-size: 2em;
  margin-bottom: 1em;
}
main {
  display: flex;
  flex-wrap: wrap;
  grid-gap: 0.5rem;
}
main > dl {
  background-color: #404040;
  display: flex;
  flex-direction: column;
  align-items: center;
  grid-gap: 1rem;
  overflow: hidden;
  padding: 1rem;
  width: 8rem;
}
main > dl > dt {
  font-size: small;
  line-height: 1;
  text-overflow: ellipsis;
  white-space: nowrap;
}
main > dl > dd > svg {
  background-color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 2em;
  height: 2em;
}
    </style>
  </head>
  <body>
    <h1>Klearsky SVG List</h1>
    <main>
__HTML__
    </main>
  </body>
</html>
`

main()

async function main () {
  const files = (await glob(svgDir)).reverse()
  const svgHtml = []
  for (const file of files) {
    const svg = fs.readFileSync(file, { encoding: "utf-8" })
    const name = path.basename(file)
    svgHtml.push(`<dl><dt>${name}</dt><dd>${svg}</dd></dl>`)
  }
  const dstHtml = template.replace("__HTML__", svgHtml.join("\n"))
  fs.writeFileSync(htmlPath, dstHtml, { encoding: "utf-8" })
}
