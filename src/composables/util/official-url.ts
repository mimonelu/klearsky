import getRkey from "@/composables/util/get-rkey"
import safeUrl from "@/composables/util/safe-url"

const HOST = "https://bsky.app"

export default {
  // 公式URLの組み立てメソッド

  post (handle?: string, uri?: string): string {
    return `${HOST}/profile/${handle}/post/${getRkey(uri)}`
  },

  profile (handle?: string): string {
    return `${HOST}/profile/${handle}`
  },

  feed (uri?: string): string {
    const path = (uri ?? "")
      .replace("at://", "")
      .replace("app.bsky.feed.generator", "feed")
    return `${HOST}/profile/${path}`
  },

  list (handle?: string, uri?: string): string {
    return `${HOST}/profile/${handle}/lists/${getRkey(uri)}`
  },

  starterPack (identifier?: string, uri?: string): string {
    return `${HOST}/starter-pack/${identifier}/${getRkey(uri)}`
  },

  // 公式URLをKlearskyのパスに変換するメソッド
  // `allowUnresolved: false` の場合、ハンドル→DID解決待ちのマーカー `{{handle}}` を含むパスは `undefined` を返す
  parseToInternalPath (text: string, allowUnresolved: boolean = false): undefined | string {
    const path = parseToInternalPathCore(text)
    if (path != null && !allowUnresolved && path.includes("{{")) {
      return undefined
    }
    return path
  },
}

function parseToInternalPathCore (text: string): undefined | string {
  const url = safeUrl(text)
  if (url == null || url.hostname !== "bsky.app") {
    return
  }
  const paths = url.pathname.split("/")
  switch (paths[1]) {
    // プロフィール関連
    case "profile": {
      if (paths[2] == null) {
        return
      }

      // プロフィールページ
      if (paths[3] == null) {
        return `/profile/feeds?account=${paths[2]}`
      }

      // プロフィールページ以外
      switch (paths[3]) {
        // カスタムフィードページ
        case "feed": {
          if (!paths[4]) {
            return
          }
          if (!paths[2].startsWith("did:")) {
            // ハンドル指定の場合はクリック時に DID を取得できるようマークアップ
            return `/home/feeds?feed=at://{{${paths[2]}}}/app.bsky.feed.generator/${paths[4]}`
          }
          return `/home/feeds?feed=at://${paths[2]}/app.bsky.feed.generator/${paths[4]}`
        }

        // リストフィードページ
        case "lists": {
          if (!paths[4]) {
            return
          }
          if (!paths[2].startsWith("did:")) {
            // ハンドル指定の場合はクリック時に DID を取得できるようマークアップ
            return `/home/list-feeds?list=at://{{${paths[2]}}}/app.bsky.graph.list/${paths[4]}`
          }
          return `/home/list-feeds?list=at://${paths[2]}/app.bsky.graph.list/${paths[4]}`
        }

        // フォロイー一覧ページ
        case "follows": {
          return `/profile/following?account=${paths[2]}`
        }

        // フォロワー一覧ページ
        case "followers": {
          return `/profile/follower?account=${paths[2]}`
        }

        // ポストスレッドページ
        case "post": {
          if (!paths[4]) {
            return
          }
          return `/post?handle=${paths[2]}&rkey=${paths[4]}`
        }
      }
      break
    }

    // 検索関連
    case "search": {
      const q = url.searchParams.get("q")
      if (!q) {
        return
      }
      return `/search/post?text=${q}`
    }

    // スターターパック
    case "starter-pack": {
      if (!paths[2] || !paths[3]) {
        return
      }
      return `/home/starter-pack?uri=at://${paths[2]}/app.bsky.graph.starterpack/${paths[3]}`
    }
  }
}
