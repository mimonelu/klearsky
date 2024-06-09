import Util from "@/composables/util"

export default function (responses: Array<any>) {
  // __custom プロパティの作成
  // TODO: 確実にポスト直下に作成するようにすること
  Util.traverseJson(responses, (key: string, child: any, parent: any) => {
    if ((key === "cid" || key === "record") && child != null && parent.__custom == null) {
      parent.__custom = {}
    }
  })

  // PARENT.embeds[0] -> PARENT.embed
  // おそらく三段階目の引用RP
  Util.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "embeds" && child[0] != null && parent.embed == null) {
      // parent.embed = Util.cloneJson(child[0])
      parent.embed = child[0]
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.value.embed -> PARENT.embed
  Util.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "value" && child.embed != null && parent.embed == null) {
      // parent.embed = Util.cloneJson(child.embed)
      parent.embed = child.embed
      parent.embed.__comment = "❗ This 'embed' was duplicated by Klearsky."
    }
  })

  // PARENT.embed.media.external/images -> PARENT.embed.external/images
  Util.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "media") {
      if (child.external != null && parent.external == null) {
        parent.external = child.external // Util.cloneJson(child.external)
        parent.external.__comment = "❗ This 'external' was duplicated by Klearsky."
      }
      if (child.images != null && parent.images == null) {
        parent.images = child.images // Util.cloneJson(child.images)
        parent.images.__comment = "❗ This 'images' was duplicated by Klearsky."
      }
    }
  })

  // PARENT.record.record -> PARENT.record
  Util.traverseJson(responses, (key: string, child: any, parent: any) => {
    if (key === "record" && child.record != null) {
      parent.record = child.record // Util.cloneJson(child.record)
      parent.record.__comment = "❗ This 'record' was duplicated by Klearsky."
    }
  })

  // PARENT.record/value.embed.external/images -> PARENT.embed.external/images
  Util.traverseJson(responses, (key: string, child: any, parent: any) => {
    if ((key === "record" || key === "value") && child.embed != null) {
      /* // TODO: 生レコード用。不要であれば削除すること
      if (child.embed.external != null && parent.embed?.external == null) {
        if (parent.embed == null) parent.embed = {}
        parent.embed.external = Util.cloneJson(child.embed.external)
        parent.embed.external.__comment = "❗ This 'external' was duplicated by Klearsky."
      }
      */
      if (child.embed.images != null) {
        /* // TODO: 生レコード用。不要であれば削除すること
        if (parent.embed?.images == null) {
          if (parent.embed == null) parent.embed = {}
          parent.embed.images = Util.cloneJson(child.embed.images)
          parent.embed.images.__comment = "❗ This 'images' was duplicated by Klearsky."
        }
        */

        // アニメーション画像向けに BlobRef をコピー
        if (parent.embed?.images != null) {
          parent.embed.images.forEach((image: any, index: number) => {
            if (image.image == null && child.embed.images[index]?.image != null)
              image.image = child.embed.images[index].image
              image.__comment = "❗ This 'image' was duplicated by Klearsky."
          })
        }
      }
    }
  })

  // Reason
  Util.traverseJson(responses, (key: string, value: any, parent: any) => {
    if (key === "reason" && value != null && parent?.post != null) {
      parent.post.__custom.reason = value
    }
  })
}
