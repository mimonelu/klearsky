import type { /* Entity, */Facet } from "@atproto/api"
import { RichText } from "@atproto/api"
import { Buffer } from "buffer"

function substring (text: string, start: number, end?: number): string {
  const buffer = new (Buffer as any)(text)
  return buffer.slice(start, end).toString()
}

function makeLink (text: string, uri: string): string {
  return `<a
    class="textlink"
    href="${uri}"
    rel="noreferrer"
    target="_blank"
    onclick="event?.stopPropagation()"
  >${text}</a>`
}

function makeMention (text: string, did: string): string {
  return `<a
    class="textlink"
    href="javascript: void 0;"
    onclick="
      event?.stopPropagation();
      window.dispatchEvent(new CustomEvent(
        'klearsky-router-push',
        {
          detail: {
            path: '/profile/post',
            query: {
              handle: '${did}'
            }
          }
        }
      ));"
  >${text}</a>`
}

export default function (
  text: string,
  facets?: Facet[],
  // entities?: Entity[]
): string {
  let html: string = ""

  if (facets != null && facets.length > 0) {
    html = text
    const reversedFacets = Array.from(facets).reverse()
    for (const facet of reversedFacets) {
      if ((facet.features ?? [])[0] == null) continue
      const feature = facet.features[0]
      const innerText = substring(text, facet.index.byteStart, facet.index.byteEnd)
      let innerHtml = innerText
      if (feature.$type === "app.bsky.richtext.facet#link") {
        innerHtml = makeLink(innerText, feature.uri as string)
      } else if (feature.$type === "app.bsky.richtext.facet#mention") {
        innerHtml = makeMention(innerText, feature.did as string)
      } else {
        console.warn("[klearsky/text2html]", `Unknown feature.$type: "${feature.$type}"`)
      }
      html = substring(html, 0, facet.index.byteStart)
        + innerHtml
        + substring(html, facet.index.byteEnd)
    }
    return html
  }

  const richText = new RichText({
    text,
    facets,
    // entities,
  })
  richText.detectFacetsWithoutResolution()
  for (const segment of richText.segments()) {
    if (segment.isLink()) {
      html += makeLink(segment.text, segment.link?.uri ?? "")
    } else if (segment.isMention()) {
      html += makeMention(segment.text, segment.mention?.did ?? "")
    } else {
      html += segment.text
    }
  }

  return html
}
