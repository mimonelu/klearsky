import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default function (responses: Array<any>) {
  // __custom プロパティの作成
  // TODO: 確実にポスト直下に作成するようにすること
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if ((key === "cid" || key === "record") && value != null) {
      parent.__custom = {}
    }
  })

  // Blob な image は暫定的に削除
  // TODO: 対応すること
  /*
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (value.images != null && value.images.some((image: any) => image.image != null)) {
      const images = value.images
      delete value.images
      value.__images = images
    }
  })
  */

  // embeds[0] -> embed
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "embeds" && value[0] != null) {
      parent.embed = JSON.parse(JSON.stringify(value[0]))
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.value.embed -> PARENT.embed
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "value" && value.embed != null && parent.embed == null) {
      parent.embed = JSON.parse(JSON.stringify(value.embed))
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.embed.media.external -> PARENT.embed.external
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "media" && value.external != null) {
      parent.external = JSON.parse(JSON.stringify(value.external))
      parent.external.__comment =
        "❗ This 'external' was duplicated by Klearsky."
    }
  })

  // PARENT.embed.media.images -> PARENT.embed.images
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "media" && value.images != null && parent.images == null) {
      parent.images = JSON.parse(JSON.stringify(value.images))
      parent.images.__comment = "❗ This 'images' was duplicated by Klearsky."
    }
  })

  // PARENT.record.record -> PARENT.record
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "record" && value.record != null) {
      parent.record = JSON.parse(JSON.stringify(value.record))
      parent.record.__comment = "❗ This 'record' was duplicated by Klearsky."
    }
  })

  // PARENT.record.embed.external/images -> PARENT.embed.external/images
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "record" && value.embed != null) {
      if (value.embed.external != null && parent.embed?.external == null) {
        if (parent.embed == null) parent.embed = {}
        parent.embed.external = JSON.parse(JSON.stringify(value.embed.external))
        parent.embed.external.__comment =
          "❗ This 'external' was duplicated by Klearsky."
      }
      if (value.embed.images != null && parent.embed?.images == null) {
        if (parent.embed == null) parent.embed = {}
        parent.embed.images = JSON.parse(JSON.stringify(value.embed.images))
        parent.embed.images.__comment =
          "❗ This 'images' was duplicated by Klearsky."
      }
    }
  })

  // Reason
  AtpUtil.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "reason" && value != null && parent?.post != null) {
      parent.post.__custom.reason = value
    }
  })
}
