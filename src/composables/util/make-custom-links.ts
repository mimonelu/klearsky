import type { Facet } from "@atproto/api"

const CUSTOM_LINK_REGEXP = /\[([^\[\]]+)\]\(((?:https?:\/\/|lightning:)[^\(\)\s]+)\)/g

export default function (text: string): { text: string; facets: Array<Facet> } {
  const customLinks = []
  const matches = text.matchAll(CUSTOM_LINK_REGEXP)
  for (const match of matches) {
    if (!match[0] || !match[1] || !match[2] || match.index == null) continue
    customLinks.push(match)
  }
  const facets = []
  let currentText = text
  let diff = 0
  for (const match of customLinks) {
    currentText = currentText.replace(match[0], match[1])
    const indexByte = getByteLength(text.substring(0, match.index))
    const match0Byte = getByteLength(match[0])
    const match1Byte = getByteLength(match[1])
    facets.push({
      features: [
        {
          $type: "app.bsky.richtext.facet#link",
          uri: match[2],
        },
      ],
      index: {
        byteStart: indexByte - diff,
        byteEnd: indexByte - diff + match1Byte,
      }
    })
    diff += match0Byte - match1Byte
  }
  return { text: currentText, facets }
}

const BYTE_LENGTH_REGEXP = /%../g

function getByteLength (text: string): number {
  return encodeURIComponent(text).replace(BYTE_LENGTH_REGEXP, "x").length
}
