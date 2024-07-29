export default {
  isPostAtUri (uri: string): boolean {
    return uri.match(/^at:\/\/did:\w+:[\w\.\-]+\/app\.bsky\.feed\.post\/[\w\.\-]+$/) != null
  },

  isFeedGeneratorAtUri (uri: string): boolean {
    return uri.match(/^at:\/\/did:\w+:[\w\.\-]+\/app\.bsky\.feed\.generator\/[\w\.\-]+$/) != null
  },

  isListAtUri (uri: string): boolean {
    return uri.match(/^at:\/\/did:\w+:[\w\.\-]+\/app\.bsky\.graph\.list\/[\w\.\-]+$/) != null
  },

  isStarterPackAtUri (uri: string): boolean {
    return uri.match(/^at:\/\/did:\w+:[\w\.\-]+\/app\.bsky\.graph\.starterpack\/[\w\.\-]+$/) != null
  },
}
