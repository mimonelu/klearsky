type TTOfficialBookmark = TTPost | {
  $type: "app.bsky.feed.defs#notFoundPost"
  uri: string
  notFound: true
}
