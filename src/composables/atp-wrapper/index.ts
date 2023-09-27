import createAgent from "@/composables/atp-wrapper/create/create-agent"
import createFileBlob from "@/composables/atp-wrapper/create/create-file-blob"
import createFollow from "@/composables/atp-wrapper/create/create-follow"
import createLike from "@/composables/atp-wrapper/create/create-like"
import createPost from "@/composables/atp-wrapper/create/create-post"
import createReport from "@/composables/atp-wrapper/create/create-report"
import createRepost from "@/composables/atp-wrapper/create/create-repost"
import deleteAccount from "@/composables/atp-wrapper/delete/delete-account"
import deleteFollow from "@/composables/atp-wrapper/delete/delete-follow"
import deleteLike from "@/composables/atp-wrapper/delete/delete-like"
import deletePost from "@/composables/atp-wrapper/delete/delete-post"
import deleteRepost from "@/composables/atp-wrapper/delete/delete-repost"
import deleteSession from "@/composables/atp-wrapper/delete/delete-session"
import fetchActorsTypeahead from "@/composables/atp-wrapper/fetch/fetch-actors-typeahead"
import fetchAuthorCustomFeeds from "@/composables/atp-wrapper/fetch/fetch-author-custom-feeds"
import fetchAuthorFeed from "@/composables/atp-wrapper/fetch/fetch-author-feed"
import fetchAuthorLikes from "@/composables/atp-wrapper/fetch/fetch-author-likes"
import fetchAuthorReposts from "@/composables/atp-wrapper/fetch/fetch-author-reposts"
import fetchBlob from "@/composables/atp-wrapper/fetch/fetch-blob"
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
import fetchListFeed from "@/composables/atp-wrapper/fetch/fetch-list-feed"
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
import updateMuteToDisable from "@/composables/atp-wrapper/update/update-mute-to-disable"
import updateMuteToEnable from "@/composables/atp-wrapper/update/update-mute-to-enable"
import updateNotificationSeen from "@/composables/atp-wrapper/update/update-notification-seen"
import updatePreferences from "@/composables/atp-wrapper/update/update-preferences"
import updateProfile from "@/composables/atp-wrapper/update/update-profile"
import Util from "@/composables/util"

// @ts-ignore
class AtpWrapper implements TIAtpWrapper {
  // @ts-ignore
  constructor (this: TIAtpWrapper) {
    this.agent = null
    this.data = Util.loadStorage("atp") ?? {
      did: "",
      sessions: {},
    }

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

    this.session = undefined
    this.lastFetchNotificationsDate = undefined
  }
}

const prototype = AtpWrapper.prototype as unknown as TIAtpWrapper
prototype.canLogin = function (this: TIAtpWrapper): boolean { return this.data.sessions[this.data.did] != null }
prototype.createAgent = createAgent
prototype.createFileBlob = createFileBlob
prototype.createFollow = createFollow
prototype.createLike = createLike
prototype.createPost = createPost
prototype.createReport = createReport
prototype.createRepost = createRepost
prototype.deleteAccount = deleteAccount
prototype.deleteFollow = deleteFollow
prototype.deleteLike = deleteLike
prototype.deletePost = deletePost
prototype.deleteRepost = deleteRepost
prototype.deleteSession = deleteSession
prototype.fetchActorsTypeahead = fetchActorsTypeahead
prototype.fetchAuthorCustomFeeds = fetchAuthorCustomFeeds
prototype.fetchAuthorFeed = fetchAuthorFeed
prototype.fetchAuthorLikes = fetchAuthorLikes
prototype.fetchAuthorReposts = fetchAuthorReposts
prototype.fetchBlob = fetchBlob
prototype.fetchBlockingUsers = fetchBlockingUsers
prototype.fetchCustomFeeds = fetchCustomFeeds
prototype.fetchDid = fetchDid
prototype.fetchFeedGenerator = fetchFeedGenerator
prototype.fetchFeedGenerators = fetchFeedGenerators
prototype.fetchFirstPost = fetchFirstPost
prototype.fetchFollowers = fetchFollowers
prototype.fetchFollowings = fetchFollowings
prototype.fetchInviteCodes = fetchInviteCodes
prototype.fetchLabels = fetchLabels
prototype.fetchLikeUsers = fetchLikeUsers
prototype.fetchListFeed = fetchListFeed
prototype.fetchMutingUsers = fetchMutingUsers
prototype.fetchNotificationCount = fetchNotificationCount
prototype.fetchNotifications = fetchNotifications
prototype.fetchOfficialFeedGenerators = fetchOfficialFeedGenerators
prototype.fetchPopularFeedGenerators = fetchPopularFeedGenerators
prototype.fetchPosts = fetchPosts
prototype.fetchPostSearch = fetchPostSearch
prototype.fetchPostThread = fetchPostThread
prototype.fetchPreferences = fetchPreferences
prototype.fetchProfile = fetchProfile
prototype.fetchRepostUsers = fetchRepostUsers
prototype.fetchSuggestions = fetchSuggestions
prototype.fetchTimeFeeds = fetchTimeFeeds
prototype.fetchTimeline = fetchTimeline
prototype.fetchUserSearch = fetchUserSearch
prototype.hasLogin = function (this: TIAtpWrapper): boolean { return this.session != null }
prototype.login = login
prototype.logout = logout
prototype.refreshSession = refreshSession
prototype.resetSession = resetSession
prototype.resumeSession = resumeSession
prototype.saveData = function (this: TIAtpWrapper) { Util.saveStorage("atp", this.data) }
prototype.updateBlockToDisable = updateBlockToDisable
prototype.updateBlockToEnable = updateBlockToEnable
prototype.updateMuteToDisable = updateMuteToDisable
prototype.updateMuteToEnable = updateMuteToEnable
prototype.updateNotificationSeen = updateNotificationSeen
prototype.updatePreferences = updatePreferences
prototype.updateProfile = updateProfile

export default AtpWrapper
