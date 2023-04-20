import createAgent from "@/composables/atp-wrapper/create-agent"
import createFileBlob from "@/composables/atp-wrapper/create-file-blob"
import createFollow from "@/composables/atp-wrapper/create-follow"
import createLike from "@/composables/atp-wrapper/create-like"
import createPost from "@/composables/atp-wrapper/create-post"
import createRepost from "@/composables/atp-wrapper/create-repost"
import deleteAccount from "@/composables/atp-wrapper/delete-account"
import deleteFollow from "@/composables/atp-wrapper/delete-follow"
import deleteLike from "@/composables/atp-wrapper/delete-like"
import deletePost from "@/composables/atp-wrapper/delete-post"
import deleteRepost from "@/composables/atp-wrapper/delete-repost"
import deleteSession from "@/composables/atp-wrapper/delete-session"
import disableMute from "@/composables/atp-wrapper/disable-mute"
import enableMute from "@/composables/atp-wrapper/enable-mute"
import fetchAuthorFeed from "@/composables/atp-wrapper/fetch-author-feed"
import fetchAuthorReposts from "@/composables/atp-wrapper/fetch-author-reposts"
import fetchAuthorLikes from "@/composables/atp-wrapper/fetch-author-likes"
import fetchBlob from "@/composables/atp-wrapper/fetch-blob"
import fetchFollowers from "@/composables/atp-wrapper/fetch-followers"
import fetchFollowings from "@/composables/atp-wrapper/fetch-followings"
import fetchHotFeeds from "@/composables/atp-wrapper/fetch-hot-feeds"
import fetchInviteCodes from "@/composables/atp-wrapper/fetch-invite-codes"
import fetchLikeUsers from "@/composables/atp-wrapper/fetch-like-users"
import fetchKeywordSearch from "@/composables/atp-wrapper/fetch-keyword-search"
import fetchNotificationCount from "@/composables/atp-wrapper/fetch-notification-count"
import fetchNotifications from "@/composables/atp-wrapper/fetch-notifications"
import fetchPost from "@/composables/atp-wrapper/fetch-post"
import fetchPostThread from "@/composables/atp-wrapper/fetch-post-thread"
import fetchProfile from "@/composables/atp-wrapper/fetch-profile"
import fetchRepostUsers from "@/composables/atp-wrapper/fetch-repost-users"
import fetchTimeline from "@/composables/atp-wrapper/fetch-timeline"
import fetchUserSearch from "@/composables/atp-wrapper/fetch-user-search"
import login from "@/composables/atp-wrapper/login"
import logout from "@/composables/atp-wrapper/logout"
import resumeSession from "@/composables/atp-wrapper/resume-session"
import updateNotificationSeen from "@/composables/atp-wrapper/update-notification-seen"
import updateProfile from "@/composables/atp-wrapper/update-profile"
import Util from "@/composables/util/index"

// @ts-ignore // TODO:
class AtpWrapper implements TIAtpWrapper {
  // @ts-ignore // TODO:
  constructor(this: TIAtpWrapper) {
    this.agent = null
    this.data = Util.loadStorage("atp") ?? {
      did: "",
      sessions: {},
    }
    this.session = undefined
    this.lastFetchNotificationsDate = undefined
  }
}

const prototype = AtpWrapper.prototype as unknown as TIAtpWrapper
prototype.canLogin = function (this: TIAtpWrapper): boolean {
  return this.data.sessions[this.data.did] != null
}
prototype.hasLogin = function hasLogin(this: TIAtpWrapper): boolean {
  return this.session != null
}
prototype.createAgent = createAgent
prototype.createFileBlob = createFileBlob
prototype.createFollow = createFollow
prototype.createLike = createLike
prototype.createPost = createPost
prototype.createRepost = createRepost
prototype.deleteAccount = deleteAccount
prototype.deleteFollow = deleteFollow
prototype.deleteLike = deleteLike
prototype.deletePost = deletePost
prototype.deleteRepost = deleteRepost
prototype.deleteSession = deleteSession
prototype.disableMute = disableMute
prototype.enableMute = enableMute
prototype.fetchAuthorFeed = fetchAuthorFeed
prototype.fetchAuthorReposts = fetchAuthorReposts
prototype.fetchAuthorLikes = fetchAuthorLikes
prototype.fetchBlob = fetchBlob
prototype.fetchFollowers = fetchFollowers
prototype.fetchFollowings = fetchFollowings
prototype.fetchHotFeeds = fetchHotFeeds
prototype.fetchInviteCodes = fetchInviteCodes
prototype.fetchKeywordSearch = fetchKeywordSearch
prototype.fetchNotificationCount = fetchNotificationCount
prototype.fetchNotifications = fetchNotifications
prototype.fetchPost = fetchPost
prototype.fetchPostThread = fetchPostThread
prototype.fetchProfile = fetchProfile
prototype.fetchRepostUsers = fetchRepostUsers
prototype.fetchLikeUsers = fetchLikeUsers
prototype.fetchTimeline = fetchTimeline
prototype.fetchUserSearch = fetchUserSearch
prototype.login = login
prototype.logout = logout
prototype.resumeSession = resumeSession
prototype.saveData = function saveData(this: TIAtpWrapper) {
  Util.saveStorage("atp", this.data)
}
prototype.updateNotificationSeen = updateNotificationSeen
prototype.updateProfile = updateProfile

export default AtpWrapper
