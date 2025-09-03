interface TIBookmarkPack {
  bookmark: TIBookmark
  post?: TTPost
}

interface TIBookmark {
  createdAt: string
  uri: string
  cid?: string
  tags?: Array<string>
}

interface TIBookmarkManagementPopupProps {
  display: boolean
  post?: TTPost
}
