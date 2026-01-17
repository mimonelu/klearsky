// Klearsky独自のATProtocol拡張ドメイン
export default {
  // カスタムブックマーク
  // ※ ❗️変更不可❗️
  OWN_DOMAIN_BOOKMARK: "space.aoisora.bookmark",

  // 特殊フィード
  // ※ 変更可能。ただし「不明なアイテム」がPreferencesに生成される
  OWN_DOMAIN_EXTRA_FEED: "net.mimonelu.klearsky.extraFeed",

  // ポスト編集機能用ポスト更新日時
  // ※ 変更可能
  OWN_DOMAIN_POST_UPDATEDAT: "net.mimonelu.klearsky.updatedAt",

  // Lightning (Zapリンク）
  // ※ 変更可能。過去のポストは無効化されるが利用率は低いため問題なし
  OWN_DOMAIN_LIGHTNING: "net.mimonelu.klearsky.lightning",

  // リポストミュート
  // ※ ❗️変更不可❗️
  OWN_DOMAIN_REPOST_MUTES: "net.mimonelu.klearsky.repostMutes",

  // クライアント種別
  // ※ 変更可能
  OWN_DOMAIN_VIA: "net.mimonelu.klearsky.via",
} as const
