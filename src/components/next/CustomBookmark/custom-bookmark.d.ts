interface TICustomBookmarkPack {
  bookmark: TICustomBookmark
  post?: TTPost
}

interface TICustomBookmark {
  createdAt: string
  uri: string
  cid?: string
  tags?: Array<string>
}

interface TICustomBookmarkManagementPopupProps {
  display: boolean
  post?: TTPost
}
