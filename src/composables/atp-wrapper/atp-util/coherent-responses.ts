import AtpUtil from "@/composables/atp-wrapper/atp-util"

export default function (responses: Array<any>) {
  // __custom プロパティの作成
  // TODO: 確実にポスト直下に作成するようにすること
  AtpUtil.traverseJson(responses, (key: string, child: any, parent: any) => {
    if ((key === "cid" || key === "record") && child != null) {
      parent.__custom = {}
    }
  })

  // embeds[0] -> embed
  AtpUtil.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "embeds" && child[0] != null) {
      parent.embed = JSON.parse(JSON.stringify(child[0]))
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.value.embed -> PARENT.embed
  AtpUtil.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "value" && child.embed != null && parent.embed == null) {
      parent.embed = JSON.parse(JSON.stringify(child.embed))
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.embed.media.external -> PARENT.embed.external
  AtpUtil.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "media" && child.external != null) {
      parent.external = JSON.parse(JSON.stringify(child.external))
      parent.external.__comment =
        "❗ This 'external' was duplicated by Klearsky."
    }
  })

  // PARENT.embed.media.images -> PARENT.embed.images
  AtpUtil.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "media" && child.images != null && parent.images == null) {
      parent.images = JSON.parse(JSON.stringify(child.images))
      parent.images.__comment = "❗ This 'images' was duplicated by Klearsky."
    }
  })

  // PARENT.record.record -> PARENT.record
  AtpUtil.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "record" && child.record != null) {
      parent.record = JSON.parse(JSON.stringify(child.record))
      parent.record.__comment = "❗ This 'record' was duplicated by Klearsky."
    }
  })

  // PARENT.record/value.embed.external/images -> PARENT.embed.external/images
  AtpUtil.traverseJson(responses, (key: string, child: any, parent: any) => {
    if ((key === "record" || key === "value") && child.embed != null) {
      if (child.embed.external != null && parent.embed?.external == null) {
        if (parent.embed == null) parent.embed = {}
        parent.embed.external = JSON.parse(JSON.stringify(child.embed.external))
        parent.embed.external.__comment =
          "❗ This 'external' was duplicated by Klearsky."
      }
      if (child.embed.images != null) {
        if (parent.embed?.images == null) {
          if (parent.embed == null) parent.embed = {}
          parent.embed.images = JSON.parse(JSON.stringify(child.embed.images))
          parent.embed.images.__comment =
            "❗ This 'images' was duplicated by Klearsky."
        }

        // アニメーション画像向けに BlobRef をコピー
        if (parent.embed?.images != null) {
          parent.embed.images.forEach((image: any, index: number) => {
            if (image.image == null && child.embed.images[index]?.image != null)
              image.image = child.embed.images[index].image
          })
        }
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
