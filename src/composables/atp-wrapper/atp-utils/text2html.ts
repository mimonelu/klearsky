import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default function (text: string): string {
  let html: string = ""
  AtpUtil.splitter(text).forEach((data: any) => {
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
        href="javascript: void 0;"
        onclick="
          event?.stopPropagation();
          window.dispatchEvent(new CustomEvent(
            'klearsky-router-push',
            {
              detail: {
                path: '/profile/post',
                query: {
                  handle: '${data.value.slice(1)}'
                }
              }
            }
          ));"
      >${data.value}</a>`
    }
  })
  return html
}
