import type { AppBskyActorLink } from "@atproto/api"

// 編集内容に合わせてプロフィールリンクのレコードを作成／更新し、プロフィールの `links` に設定する参照を返す
// 変更のないリンクは既存の参照をそのまま使う。並べ替えのみの場合はレコードを書き換えない
export default async function (
  this: TIAtpWrapper,
  links: Array<TTProfileLinkDraft>
): Promise<Error | Array<TTCidUri>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const repo = this.session.did
  const results = await Promise.all(links.map(async (link): Promise<Error | TTCidUri> => {
    if (link.uri != null && link.cid != null && !isModified(link)) {
      return { uri: link.uri, cid: link.cid }
    }

    // favicon のアップロード
    // NOTICE: アップロードに失敗しても favicon なしで保存する（公式クライアントと同様）
    let icon = link.icon
    if (link.iconFile != null) {
      const blobRef = await this.createFileBlobRef({ file: link.iconFile as File })
      icon = blobRef instanceof Error ? undefined : blobRef
    }

    // 未対応のフィールドは既存の値を引き継ぐ
    const record: AppBskyActorLink.Record = {
      ...link.value,
      $type: "app.bsky.actor.link",
      url: link.url,
      createdAt: link.value?.createdAt ?? new Date().toISOString(),
    }
    if (link.title) {
      record.title = link.title
    } else {
      delete record.title
    }
    if (icon != null) {
      record.icon = icon
    } else {
      delete record.icon
    }

    return link.uri != null
      ? await this.updateRecord(repo, "app.bsky.actor.link", link.uri, record)
      : await this.createRecord(repo, "app.bsky.actor.link", record)
  }))
  const error = results.find((result) => result instanceof Error)
  if (error != null) {
    return error
  }
  return results as Array<TTCidUri>
}

function isModified (link: TTProfileLinkDraft): boolean {
  return (
    link.value == null ||
    link.iconFile != null ||
    link.url !== link.value.url ||
    (link.title || undefined) !== (link.value.title || undefined) ||
    link.icon?.ref.toString() !== link.value.icon?.ref.toString()
  )
}
