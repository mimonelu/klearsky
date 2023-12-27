import createAgent from "@/composables/atp-wrapper/create/create-agent"
import createFileBlobRef from "@/composables/atp-wrapper/create/create-file-blob-ref"
import createFollow from "@/composables/atp-wrapper/create/create-follow"
import createLike from "@/composables/atp-wrapper/create/create-like"
import createList from "@/composables/atp-wrapper/create/create-list"
import createListUser from "@/composables/atp-wrapper/create/create-list-user"
import createPost from "@/composables/atp-wrapper/create/create-post"
import createReport from "@/composables/atp-wrapper/create/create-report"
import createRepost from "@/composables/atp-wrapper/create/create-repost"
import deleteAccount from "@/composables/atp-wrapper/delete/delete-account"
import deleteFollow from "@/composables/atp-wrapper/delete/delete-follow"
import deleteLike from "@/composables/atp-wrapper/delete/delete-like"
import deleteList from "@/composables/atp-wrapper/delete/delete-list"
import deleteListUser from "@/composables/atp-wrapper/delete/delete-list-user"
import deletePost from "@/composables/atp-wrapper/delete/delete-post"
import deleteRepost from "@/composables/atp-wrapper/delete/delete-repost"
import deleteSession from "@/composables/atp-wrapper/delete/delete-session"
import deleteThreadgate from "@/composables/atp-wrapper/delete/delete-threadgate"
import fetchActorsTypeahead from "@/composables/atp-wrapper/fetch/fetch-actors-typeahead"
import fetchAuthorCustomFeeds from "@/composables/atp-wrapper/fetch/fetch-author-custom-feeds"
import fetchAuthorFeed from "@/composables/atp-wrapper/fetch/fetch-author-feed"
import fetchAuthorLikes from "@/composables/atp-wrapper/fetch/fetch-author-likes"
import fetchAuthorReposts from "@/composables/atp-wrapper/fetch/fetch-author-reposts"
import fetchBlob from "@/composables/atp-wrapper/fetch/fetch-blob"
import fetchBlobUrl from "@/composables/atp-wrapper/fetch/fetch-blob-url"
import fetchBlockingUsers from "@/composables/atp-wrapper/fetch/fetch-blocking-users"
import fetchCustomFeeds from "@/composables/atp-wrapper/fetch/fetch-custom-feeds"
import fetchDid from "@/composables/atp-wrapper/fetch/fetch-did"
import fetchFeedGenerator from "@/composables/atp-wrapper/fetch/fetch-feed-generator"
import fetchFeedGenerators from "@/composables/atp-wrapper/fetch/fetch-feed-generators"
import fetchFirstPost from "@/composables/atp-wrapper/fetch/fetch-first-post"
import fetchFollowers from "@/composables/atp-wrapper/fetch/fetch-followers"
import fetchFollowings from "@/composables/atp-wrapper/fetch/fetch-followings"
import fetchInviteCodes from "@/composables/atp-wrapper/fetch/fetch-invite-codes"
import fetchLabels from "@/composables/atp-wrapper/fetch/fetch-labels"
import fetchLikeUsers from "@/composables/atp-wrapper/fetch/fetch-like-users"
import fetchList from "@/composables/atp-wrapper/fetch/fetch-list"
import fetchListItems from "@/composables/atp-wrapper/fetch/fetch-list-items"
import fetchLists from "@/composables/atp-wrapper/fetch/fetch-lists"
import fetchListFeed from "@/composables/atp-wrapper/fetch/fetch-list-feed"
import fetchLogAudit from "@/composables/atp-wrapper/fetch/fetch-log-audit"
import fetchMutingUsers from "@/composables/atp-wrapper/fetch/fetch-muting-users"
import fetchNotificationCount from "@/composables/atp-wrapper/fetch/fetch-notification-count"
import fetchNotifications from "@/composables/atp-wrapper/fetch/fetch-notifications"
import fetchOfficialFeedGenerators from "@/composables/atp-wrapper/fetch/fetch-official-feed-generators"
import fetchPopularFeedGenerators from "@/composables/atp-wrapper/fetch/fetch-popular-feed-generators"
import fetchPosts from "@/composables/atp-wrapper/fetch/fetch-posts"
import fetchPostSearch from "@/composables/atp-wrapper/fetch/fetch-post-search"
import fetchPostThread from "@/composables/atp-wrapper/fetch/fetch-post-thread"
import fetchPreferences from "@/composables/atp-wrapper/fetch/fetch-preferences"
import fetchProfile from "@/composables/atp-wrapper/fetch/fetch-profile"
import fetchRepostUsers from "@/composables/atp-wrapper/fetch/fetch-repost-users"
import fetchSuggestedFollows from "@/composables/atp-wrapper/fetch/fetch-suggested-follows"
import fetchSuggestions from "@/composables/atp-wrapper/fetch/fetch-suggestions"
import fetchTimeFeeds from "@/composables/atp-wrapper/fetch/fetch-time-feeds"
import fetchTimeline from "@/composables/atp-wrapper/fetch/fetch-timeline"
import fetchUserSearch from "@/composables/atp-wrapper/fetch/fetch-user-search"
import login from "@/composables/atp-wrapper/session/login"
import logout from "@/composables/atp-wrapper/session/logout"
import refreshSession from "@/composables/atp-wrapper/session/refresh-session"
import resetSession from "@/composables/atp-wrapper/session/reset-session"
import resumeSession from "@/composables/atp-wrapper/session/resume-session"
import updateBlockToDisable from "@/composables/atp-wrapper/update/update-block-to-disable"
import updateBlockToEnable from "@/composables/atp-wrapper/update/update-block-to-enable"
import updateList from "@/composables/atp-wrapper/update/update-list"
import updateListBlockToDisable from "@/composables/atp-wrapper/update/update-list-block-to-disable"
import updateListBlockToEnable from "@/composables/atp-wrapper/update/update-list-block-to-enable"
import updateListMuteToDisable from "@/composables/atp-wrapper/update/update-list-mute-to-disable"
import updateListMuteToEnable from "@/composables/atp-wrapper/update/update-list-mute-to-enable"
import updateMuteToDisable from "@/composables/atp-wrapper/update/update-mute-to-disable"
import updateMuteToEnable from "@/composables/atp-wrapper/update/update-mute-to-enable"
import updateNotificationSeen from "@/composables/atp-wrapper/update/update-notification-seen"
import updatePreferences from "@/composables/atp-wrapper/update/update-preferences"
import updateProfile from "@/composables/atp-wrapper/update/update-profile"
import updateThreadgate from "@/composables/atp-wrapper/update/update-threadgate"
import Util from "@/composables/util"

// @ts-ignore
class AtpWrapper implements TIAtpWrapper {
  agent: null | any
  data: any
  session?: TTSession
  lastFetchNotificationsDate?: Date

  // @ts-ignore
  constructor (this: TIAtpWrapper) {
    this.agent = null
    this.data = Util.loadStorage("atp") ?? {
      did: "",
      sessions: {},
    }
    this.session = undefined
    this.lastFetchNotificationsDate = undefined

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
  createFileBlobRef = createFileBlobRef
  createFollow = createFollow
  createLike = createLike
  createList = createList
  createListUser = createListUser
  createPost = createPost
  createReport = createReport
  createRepost = createRepost
  deleteAccount = deleteAccount
  deleteFollow = deleteFollow
  deleteLike = deleteLike
  deleteList = deleteList
  deleteListUser = deleteListUser
  deletePost = deletePost
  deleteRepost = deleteRepost
  deleteSession = deleteSession
  deleteThreadgate = deleteThreadgate
  fetchActorsTypeahead = fetchActorsTypeahead
  fetchAuthorCustomFeeds = fetchAuthorCustomFeeds
  fetchAuthorFeed = fetchAuthorFeed
  fetchAuthorLikes = fetchAuthorLikes
  fetchAuthorReposts = fetchAuthorReposts
  fetchBlob = fetchBlob
  fetchBlobUrl = fetchBlobUrl
  fetchBlockingUsers = fetchBlockingUsers
  fetchCustomFeeds = fetchCustomFeeds
  fetchDid = fetchDid
  fetchFeedGenerator = fetchFeedGenerator
  fetchFeedGenerators = fetchFeedGenerators
  fetchFirstPost = fetchFirstPost
  fetchFollowers = fetchFollowers
  fetchFollowings = fetchFollowings
  fetchInviteCodes = fetchInviteCodes
  fetchLabels = fetchLabels
  fetchLikeUsers = fetchLikeUsers
  fetchList = fetchList
  fetchListItems = fetchListItems
  fetchLists = fetchLists
  fetchListFeed = fetchListFeed
  fetchLogAudit = fetchLogAudit
  fetchMutingUsers = fetchMutingUsers
  fetchNotificationCount = fetchNotificationCount
  fetchNotifications = fetchNotifications
  fetchOfficialFeedGenerators = fetchOfficialFeedGenerators
  fetchPopularFeedGenerators = fetchPopularFeedGenerators
  fetchPosts = fetchPosts
  fetchPostSearch = fetchPostSearch
  fetchPostThread = fetchPostThread
  fetchPreferences = fetchPreferences
  fetchProfile = fetchProfile
  fetchRepostUsers = fetchRepostUsers
  fetchSuggestedFollows = fetchSuggestedFollows
  fetchSuggestions = fetchSuggestions
  fetchTimeFeeds = fetchTimeFeeds
  fetchTimeline = fetchTimeline
  fetchUserSearch = fetchUserSearch
  hasLogin (this: TIAtpWrapper): boolean {
    return this.session != null
  }
  login = login
  logout = logout
  refreshSession = refreshSession
  resetSession = resetSession
  resumeSession = resumeSession
  saveData (this: TIAtpWrapper) {
    Util.saveStorage("atp", this.data)
  }
  updateBlockToDisable = updateBlockToDisable
  updateBlockToEnable = updateBlockToEnable
  updateList = updateList
  updateListBlockToDisable = updateListBlockToDisable
  updateListBlockToEnable = updateListBlockToEnable
  updateListMuteToDisable = updateListMuteToDisable
  updateListMuteToEnable = updateListMuteToEnable
  updateMuteToDisable = updateMuteToDisable
  updateMuteToEnable = updateMuteToEnable
  updateNotificationSeen = updateNotificationSeen
  updatePreferences = updatePreferences
  updateProfile = updateProfile
  updateThreadgate = updateThreadgate
}

export default AtpWrapper
