import type { AtpAgent } from "@atproto/api"
import createAgent from "@/composables/atp-wrapper/create/create-agent"
import createChatDeclaration from "@/composables/atp-wrapper/chat/create-chat-declaration"
import createChatMessage  from "@/composables/atp-wrapper/chat/create-chat-message"
import createFileBlobRef from "@/composables/atp-wrapper/create/create-file-blob-ref"
import createFollow from "@/composables/atp-wrapper/create/create-follow"
import createLike from "@/composables/atp-wrapper/create/create-like"
import createList from "@/composables/atp-wrapper/create/create-list"
import createListUser from "@/composables/atp-wrapper/create/create-list-user"
import createPost from "@/composables/atp-wrapper/create/create-post"
import createRecord from "@/composables/atp-wrapper/create/create-record"
import createReport from "@/composables/atp-wrapper/create/create-report"
import createRepost from "@/composables/atp-wrapper/create/create-repost"
import createStarterPack from "@/composables/atp-wrapper/create/create-starter-pack"
import createVideo from "@/composables/atp-wrapper/create/create-video"
import deleteAccount from "@/composables/atp-wrapper/delete/delete-account"
import deleteChatDeclaration from "@/composables/atp-wrapper/chat/delete-chat-declaration"
import deleteChatMessage from "@/composables/atp-wrapper/chat/delete-chat-message"
import deleteCustomBookmark from "@/composables/atp-wrapper/delete/delete-custom-bookmark"
import deleteFollow from "@/composables/atp-wrapper/delete/delete-follow"
import deleteLike from "@/composables/atp-wrapper/delete/delete-like"
import deleteList from "@/composables/atp-wrapper/delete/delete-list"
import deleteListUser from "@/composables/atp-wrapper/delete/delete-list-user"
import deletePost from "@/composables/atp-wrapper/delete/delete-post"
import deleteRecord from "@/composables/atp-wrapper/delete/delete-record"
import deleteRepost from "@/composables/atp-wrapper/delete/delete-repost"
import deleteSession from "@/composables/atp-wrapper/delete/delete-session"
import deleteStarterPack from "@/composables/atp-wrapper/delete/delete-starter-pack"
import deleteThreadgate from "@/composables/atp-wrapper/delete/delete-threadgate"
import fetchActorLists from "@/composables/atp-wrapper/fetch/fetch-actor-lists"
import fetchActorStarterPacks from "@/composables/atp-wrapper/fetch/fetch-actor-starter-packs"
import fetchActorsTypeahead from "@/composables/atp-wrapper/fetch/fetch-actors-typeahead"
import fetchAuthorFeedGenerators from "@/composables/atp-wrapper/fetch/fetch-author-feed-generators"
import fetchAuthorFeed from "@/composables/atp-wrapper/fetch/fetch-author-feed"
import fetchAuthorLikes from "@/composables/atp-wrapper/fetch/fetch-author-likes"
import fetchAuthorReposts from "@/composables/atp-wrapper/fetch/fetch-author-reposts"
import fetchBlob from "@/composables/atp-wrapper/fetch/fetch-blob"
import fetchBlobUrl from "@/composables/atp-wrapper/fetch/fetch-blob-url"
import fetchBlockingUsers from "@/composables/atp-wrapper/fetch/fetch-blocking-users"
import fetchChatConvo from "@/composables/atp-wrapper/chat/fetch-chat-convo"
import fetchChatConvos from "@/composables/atp-wrapper/chat/fetch-chat-convos"
import fetchChatDeclarations from "@/composables/atp-wrapper/chat/fetch-chat-declarations"
import fetchChatLogs from "@/composables/atp-wrapper/chat/fetch-chat-logs"
import fetchChatMessages from "@/composables/atp-wrapper/chat/fetch-chat-messages"
import fetchCustomBookmarkPacks from "@/composables/atp-wrapper/fetch/fetch-custom-bookmark-packs"
import fetchCustomFeeds from "@/composables/atp-wrapper/fetch/fetch-custom-feeds"
import fetchDid from "@/composables/atp-wrapper/fetch/fetch-did"
import fetchFeedGenerator from "@/composables/atp-wrapper/fetch/fetch-feed-generator"
import fetchFeedGenerators from "@/composables/atp-wrapper/fetch/fetch-feed-generators"
import fetchFirstPost from "@/composables/atp-wrapper/fetch/fetch-first-post"
import fetchFollowers from "@/composables/atp-wrapper/fetch/fetch-followers"
import fetchFollowings from "@/composables/atp-wrapper/fetch/fetch-followings"
import fetchInviteCodes from "@/composables/atp-wrapper/fetch/fetch-invite-codes"
import fetchLabelers from "@/composables/atp-wrapper/fetch/fetch-labelers"
import fetchLabels from "@/composables/atp-wrapper/fetch/fetch-labels"
import fetchLikeUsers from "@/composables/atp-wrapper/fetch/fetch-like-users"
import fetchList from "@/composables/atp-wrapper/fetch/fetch-list"
import fetchListBlocks from "@/composables/atp-wrapper/fetch/fetch-list-blocks"
import fetchListItems from "@/composables/atp-wrapper/fetch/fetch-list-items"
import fetchListMutes from "@/composables/atp-wrapper/fetch/fetch-list-mutes"
import fetchListFeeds from "@/composables/atp-wrapper/fetch/fetch-list-feeds"
import fetchLists from "@/composables/atp-wrapper/fetch/fetch-lists"
import fetchLogAudit from "@/composables/atp-wrapper/fetch/fetch-log-audit"
import fetchMutingUsers from "@/composables/atp-wrapper/fetch/fetch-muting-users"
import fetchNotificationCount from "@/composables/atp-wrapper/fetch/fetch-notification-count"
import fetchNotifications from "@/composables/atp-wrapper/fetch/fetch-notifications"
import fetchOfficialFeedGenerators from "@/composables/atp-wrapper/fetch/fetch-official-feed-generators"
import fetchPopularFeedGenerators from "@/composables/atp-wrapper/fetch/fetch-popular-feed-generators"
import fetchPostedImageRefs from "@/composables/atp-wrapper/fetch/fetch-posted-image-refs"
import fetchPostgate from "@/composables/atp-wrapper/fetch/fetch-postgate"
import fetchPosts from "@/composables/atp-wrapper/fetch/fetch-posts"
import fetchPostSearch from "@/composables/atp-wrapper/fetch/fetch-post-search"
import fetchPostThread from "@/composables/atp-wrapper/fetch/fetch-post-thread"
import fetchPreferences from "@/composables/atp-wrapper/fetch/fetch-preferences"
import fetchProfile from "@/composables/atp-wrapper/fetch/fetch-profile"
import fetchProfiles from "@/composables/atp-wrapper/fetch/fetch-profiles"
import fetchQuoteReposts from "@/composables/atp-wrapper/fetch/fetch-quote-reposts"
import fetchRecord from "@/composables/atp-wrapper/fetch/fetch-record"
import fetchRecords from "@/composables/atp-wrapper/fetch/fetch-records"
import fetchRepo from "@/composables/atp-wrapper/fetch/fetch-repo"
import fetchRepostUsers from "@/composables/atp-wrapper/fetch/fetch-repost-users"
import fetchServerInfo from "@/composables/atp-wrapper/fetch/fetch-server-info"
import fetchServiceAuth from "@/composables/atp-wrapper/fetch/fetch-service-auth"
import fetchStarterPackSharedUrl from "@/composables/atp-wrapper/fetch/fetch-starter-pack-shared-url"
import fetchStarterPack from "@/composables/atp-wrapper/fetch/fetch-starter-pack"
import fetchStarterPacks from "@/composables/atp-wrapper/fetch/fetch-starter-packs"
import fetchSuggestedFollows from "@/composables/atp-wrapper/fetch/fetch-suggested-follows"
import fetchSuggestions from "@/composables/atp-wrapper/fetch/fetch-suggestions"
import fetchTimeFeeds from "@/composables/atp-wrapper/fetch/fetch-time-feeds"
import fetchTimeline from "@/composables/atp-wrapper/fetch/fetch-timeline"
import fetchTimelineNewArrival from "@/composables/atp-wrapper/fetch/fetch-timeline-new-arrival"
import fetchUserSearch from "@/composables/atp-wrapper/fetch/fetch-user-search"
import fetchVideoLimits from "@/composables/atp-wrapper/fetch/fetch-video-limits"
import fetchWithoutAgent from "@/composables/atp-wrapper/fetch/fetch-without-agent"
import leaveChatConvo from "@/composables/atp-wrapper/chat/leave-chat-convo"
import login from "@/composables/atp-wrapper/session/login"
import logout from "@/composables/atp-wrapper/session/logout"
import muteChatConvo from "@/composables/atp-wrapper/chat/mute-chat-convo"
import refreshSession from "@/composables/atp-wrapper/session/refresh-session"
import resetSession from "@/composables/atp-wrapper/session/reset-session"
import resumeSession from "@/composables/atp-wrapper/session/resume-session"
import signUp from "@/composables/atp-wrapper/session/sign-up"
import unmuteChatConvo from "@/composables/atp-wrapper/chat/unmute-chat-convo"
import updateBlockToDisable from "@/composables/atp-wrapper/update/update-block-to-disable"
import updateBlockToEnable from "@/composables/atp-wrapper/update/update-block-to-enable"
import updateChatConvoRead from "@/composables/atp-wrapper/chat/update-chat-convo-read"
import updateCustomBookmarks from "@/composables/atp-wrapper/update/update-custom-bookmark"
import updateJwt from "@/composables/atp-wrapper/session/update-jwt"
import updateList from "@/composables/atp-wrapper/update/update-list"
import updateListBlockToDisable from "@/composables/atp-wrapper/update/update-list-block-to-disable"
import updateListBlockToEnable from "@/composables/atp-wrapper/update/update-list-block-to-enable"
import updateListMuteToDisable from "@/composables/atp-wrapper/update/update-list-mute-to-disable"
import updateListMuteToEnable from "@/composables/atp-wrapper/update/update-list-mute-to-enable"
import updateMuteToDisable from "@/composables/atp-wrapper/update/update-mute-to-disable"
import updateMuteToEnable from "@/composables/atp-wrapper/update/update-mute-to-enable"
import updateNotificationSeen from "@/composables/atp-wrapper/update/update-notification-seen"
import updatePinnedPost from "@/composables/atp-wrapper/update/update-pinned-post"
import updatePostgate from "@/composables/atp-wrapper/update/update-postgate"
import updatePreferences from "@/composables/atp-wrapper/update/update-preferences"
import updateProfile from "@/composables/atp-wrapper/update/update-profile"
import updateRecord from "@/composables/atp-wrapper/update/update-record"
import updateThreadgate from "@/composables/atp-wrapper/update/update-threadgate"
import updateThreadMuteToDisable from "@/composables/atp-wrapper/update/update-thread-mute-to-disable"
import updateThreadMuteToEnable from "@/composables/atp-wrapper/update/update-thread-mute-to-enable"
import updateStarterPack from "@/composables/atp-wrapper/update/update-starter-pack"
import Util from "@/composables/util"

class AtpWrapper implements TIAtpWrapper {
  agent: null | AtpAgent

  proxies: { [k: string]: undefined | string }

  data: { did: string; sessions: { [did: string]: TTSession } }

  session?: TTSession

  constructor () {
    this.agent = null
    this.proxies = {
      chat: "did:web:api.bsky.chat#bsky_chat",
    }
    this.data = Util.loadStorage("atp") ?? {
      did: "",
      sessions: {},
    }
    this.session = undefined

    // 不正なアカウントデータの修復
    // TODO: このような処理が不要になるように再実装すること
    if (this.data?.sessions != null) {
      for (const did in this.data.sessions) {
        if (!did) {
          const session = this.data.sessions[did]
          this.data.sessions[session.did] = session
          delete this.data.sessions[did]
        }
      }
    }
  }

  canLogin (this: TIAtpWrapper): boolean {
    return this.data.sessions[this.data.did] != null
  }
  createAgent = createAgent
  createChatDeclaration = createChatDeclaration
  createChatMessage = createChatMessage
  createFileBlobRef = createFileBlobRef
  createFollow = createFollow
  createLike = createLike
  createList = createList
  createListUser = createListUser
  createPost = createPost
  createRecord = createRecord
  createReport = createReport
  createRepost = createRepost
  createStarterPack = createStarterPack
  createVideo = createVideo
  deleteAccount = deleteAccount
  deleteChatDeclaration = deleteChatDeclaration
  deleteChatMessage = deleteChatMessage
  deleteCustomBookmark = deleteCustomBookmark
  deleteFollow = deleteFollow
  deleteLike = deleteLike
  deleteList = deleteList
  deleteListUser = deleteListUser
  deletePost = deletePost
  deleteRecord = deleteRecord
  deleteRepost = deleteRepost
  deleteSession = deleteSession
  deleteStarterPack = deleteStarterPack
  deleteThreadgate = deleteThreadgate
  fetchActorLists = fetchActorLists
  fetchActorStarterPacks = fetchActorStarterPacks
  fetchActorsTypeahead = fetchActorsTypeahead
  fetchAuthorFeedGenerators = fetchAuthorFeedGenerators
  fetchAuthorFeed = fetchAuthorFeed
  fetchAuthorLikes = fetchAuthorLikes
  fetchAuthorReposts = fetchAuthorReposts
  fetchBlob = fetchBlob
  fetchBlobUrl = fetchBlobUrl
  fetchBlockingUsers = fetchBlockingUsers
  fetchChatConvo = fetchChatConvo
  fetchChatConvos = fetchChatConvos
  fetchChatDeclarations = fetchChatDeclarations
  fetchChatLogs = fetchChatLogs
  fetchChatMessages = fetchChatMessages
  fetchCustomBookmarkPacks = fetchCustomBookmarkPacks
  fetchCustomFeeds = fetchCustomFeeds
  fetchDid = fetchDid
  fetchFeedGenerator = fetchFeedGenerator
  fetchFeedGenerators = fetchFeedGenerators
  fetchFirstPost = fetchFirstPost
  fetchFollowers = fetchFollowers
  fetchFollowings = fetchFollowings
  fetchInviteCodes = fetchInviteCodes
  fetchLabelers = fetchLabelers
  fetchLabels = fetchLabels
  fetchLikeUsers = fetchLikeUsers
  fetchList = fetchList
  fetchListBlocks = fetchListBlocks
  fetchListItems = fetchListItems
  fetchListMutes = fetchListMutes
  fetchListFeeds = fetchListFeeds
  fetchLists = fetchLists
  fetchLogAudit = fetchLogAudit
  fetchMutingUsers = fetchMutingUsers
  fetchNotificationCount = fetchNotificationCount
  fetchNotifications = fetchNotifications
  fetchOfficialFeedGenerators = fetchOfficialFeedGenerators
  fetchPopularFeedGenerators = fetchPopularFeedGenerators
  fetchPostedImageRefs = fetchPostedImageRefs
  fetchPostgate = fetchPostgate
  fetchPosts = fetchPosts
  fetchPostSearch = fetchPostSearch
  fetchPostThread = fetchPostThread
  fetchPreferences = fetchPreferences
  fetchProfile = fetchProfile
  fetchProfiles = fetchProfiles
  fetchQuoteReposts = fetchQuoteReposts
  fetchRecord = fetchRecord
  fetchRecords = fetchRecords
  fetchRepo = fetchRepo
  fetchRepostUsers = fetchRepostUsers
  fetchServerInfo = fetchServerInfo
  fetchServiceAuth = fetchServiceAuth
  fetchStarterPackSharedUrl = fetchStarterPackSharedUrl
  fetchStarterPack = fetchStarterPack
  fetchStarterPacks = fetchStarterPacks
  fetchSuggestedFollows = fetchSuggestedFollows
  fetchSuggestions = fetchSuggestions
  fetchTimeFeeds = fetchTimeFeeds
  fetchTimeline = fetchTimeline
  fetchTimelineNewArrival = fetchTimelineNewArrival
  fetchUserSearch = fetchUserSearch
  fetchVideoLimits = fetchVideoLimits
  fetchWithoutAgent = fetchWithoutAgent
  hasLogin (this: TIAtpWrapper): boolean {
    return this.session != null
  }
  leaveChatConvo = leaveChatConvo
  login = login
  logout = logout
  muteChatConvo = muteChatConvo
  refreshSession = refreshSession
  resetSession = resetSession
  resumeSession = resumeSession
  saveData (this: TIAtpWrapper) {
    Util.saveStorage("atp", this.data)
  }
  signUp = signUp
  unmuteChatConvo = unmuteChatConvo
  updateBlockToDisable = updateBlockToDisable
  updateBlockToEnable = updateBlockToEnable
  updateChatConvoRead = updateChatConvoRead
  updateCustomBookmarks = updateCustomBookmarks
  updateJwt = updateJwt
  updateList = updateList
  updateListBlockToDisable = updateListBlockToDisable
  updateListBlockToEnable = updateListBlockToEnable
  updateListMuteToDisable = updateListMuteToDisable
  updateListMuteToEnable = updateListMuteToEnable
  updateMuteToDisable = updateMuteToDisable
  updateMuteToEnable = updateMuteToEnable
  updateNotificationSeen = updateNotificationSeen
  updatePinnedPost = updatePinnedPost
  updatePostgate = updatePostgate
  updatePreferences = updatePreferences
  updateProfile = updateProfile
  updateRecord = updateRecord
  updateThreadgate = updateThreadgate
  updateThreadMuteToDisable = updateThreadMuteToDisable
  updateThreadMuteToEnable = updateThreadMuteToEnable
  updateStarterPack = updateStarterPack
}

export default AtpWrapper
