interface TICustomBookmarkPack {
  bookmark: TICustomBookmark
  post?: TTPost
}

interface TICustomBookmark {
  createdAt: string
  uri: string
  cid?: string
  category?: TICustomBookmarkCategory
}

interface TICustomBookmarkCategory {
  label: string
  code?: string
}
