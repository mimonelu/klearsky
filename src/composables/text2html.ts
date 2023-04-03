import splitter from "@/composables/splitter"

export default function (text: string): string {
  let html: string = ""
  splitter(text).forEach((data: any) => {
    if (data.type === "text") {
      html += data.value
    } else if (data.type === "url") {
      html += `<a
        class="textlink"
        href="${data.value}"
        rel="noreferrer"
        target="_blank"
        onclick="event?.stopPropagation()"
      >${data.value}</a>`
    } else if (data.type === "tag") {
      // TODO: タグが機能し出したら変更すること
      html += data.value
    } else if (data.type === "mention") {
      html += `<a
        class="textlink"
        href="#/profile/post?handle=${data.value.slice(1)}"
        onclick="event?.stopPropagation()"
      >${data.value}</a>`
    }
  })
  return html
}
