import { ComAtprotoRepoGetRecord } from "@atproto/api"
import type { AppBskyActorLink, AppBskyActorProfile } from "@atproto/api"
import Util from "@/composables/util"

// 自分のプロフィールリンクを、プロフィールレコードの `links` の順にリポジトリから直接取得する
// NOTICE: `getProfile` の `links` には favicon の blob がなく、そのままでは保存し直せないため
export default async function (
  this: TIAtpWrapper
): Promise<Error | Array<TTProfileLinkDraft>> {
  if (this.agent == null) {
    return Error("noAgentError")
  }
  if (this.session == null) {
    return Error("noSessionError")
  }
  const repo = this.session.did

  // プロフィールレコードの取得
  const profile = await getRecord(this, repo, "app.bsky.actor.profile", "self")
  if (profile instanceof Error) {
    return profile
  }
  const refs = (profile?.value as undefined | AppBskyActorProfile.Record)?.links ?? []

  // リンクレコードの取得
  const prefix = `at://${repo}/app.bsky.actor.link/`
  const uris = Array.from(new Set(refs.map((ref) => ref.uri)))
    .filter((uri) => uri.startsWith(prefix))
  const records = await Promise.all(uris.map((uri) => {
    return getRecord(this, repo, "app.bsky.actor.link", Util.getRkey(uri))
  }))
  const links: Array<TTProfileLinkDraft> = []
  for (const record of records) {
    if (record instanceof Error) {
      return record
    }

    // プロフィールから参照されているが削除済みのリンクは除外する
    if (record?.cid == null) {
      continue
    }

    const value = record.value as AppBskyActorLink.Record
    links.push({
      uri: record.uri,
      cid: record.cid,
      value,
      url: value.url,
      title: value.title,
      icon: value.icon,
      iconUrl: value.icon != null
        ? `https://cdn.bsky.app/img/avatar_thumbnail/plain/${repo}/${value.icon.ref.toString()}@png`
        : undefined,
    })
  }
  return links
}

// レコードが存在しない場合は `undefined` を返す
async function getRecord (
  atp: TIAtpWrapper,
  repo: string,
  collection: string,
  rkey: string
): Promise<Error | undefined | ComAtprotoRepoGetRecord.OutputSchema> {
  const response: Error | ComAtprotoRepoGetRecord.Response =
    await atp.agent!.com.atproto.repo.getRecord({ repo, collection, rkey })
      .then((value) => value)
      .catch((error) => error)
  $log("getRecord", response)
  if (response instanceof ComAtprotoRepoGetRecord.RecordNotFoundError) {
    return
  }
  if (response instanceof Error) {
    return response
  }
  if (!response.success) {
    return Error("apiError")
  }
  return response.data
}
