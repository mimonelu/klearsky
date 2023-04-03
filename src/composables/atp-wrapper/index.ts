import {
  canLogin,
  hasLogin,
  saveData,
} from "@/composables/atp-wrapper/services"
import createAgent from "@/composables/atp-wrapper/create-agent"
import createFileBlob from "@/composables/atp-wrapper/create-file-blob"
import createFollow from "@/composables/atp-wrapper/create-follow"
import createLike from "@/composables/atp-wrapper/create-like"
import createPost from "@/composables/atp-wrapper/create-post"
import createRepost from "@/composables/atp-wrapper/create-repost"
import deleteFollow from "@/composables/atp-wrapper/delete-follow"
import deleteLike from "@/composables/atp-wrapper/delete-like"
import deletePost from "@/composables/atp-wrapper/delete-post"
import deleteRepost from "@/composables/atp-wrapper/delete-repost"
import fetchAuthorFeed from "@/composables/atp-wrapper/fetch-author-feed"
import fetchFollowers from "@/composables/atp-wrapper/fetch-followers"
import fetchFollowings from "@/composables/atp-wrapper/fetch-followings"
import fetchKeywordSearch from "@/composables/atp-wrapper/fetch-keyword-search"
import fetchNotificationCount from "@/composables/atp-wrapper/fetch-notification-count"
import fetchNotifications from "@/composables/atp-wrapper/fetch-notifications"
import fetchPostThread from "@/composables/atp-wrapper/fetch-post-thread"
import fetchProfile from "@/composables/atp-wrapper/fetch-profile"
import fetchTimeline from "@/composables/atp-wrapper/fetch-timeline"
import fetchUserSearch from "@/composables/atp-wrapper/fetch-user-search"
import login from "@/composables/atp-wrapper/login"
import logout from "@/composables/atp-wrapper/logout"
import resumeSession from "@/composables/atp-wrapper/resume-session"
import updateNotificationSeen from "@/composables/atp-wrapper/update-notification-seen"
import updateProfile from "@/composables/atp-wrapper/update-profile"
import storage from "@/composables/storage"

// @ts-ignore // TODO:
class AtpWrapper implements TIAtpWrapper {
  // @ts-ignore // TODO:
  constructor(this: TIAtpWrapper) {
    this.agent = null
    this.data = storage.load("atp") ?? {
      did: "",
      sessions: {},
    }
    this.session = undefined
    this.lastFetchNotificationsDate = undefined
  }
}

const prototype = AtpWrapper.prototype as unknown as TIAtpWrapper
prototype.canLogin = canLogin
prototype.createAgent = createAgent
prototype.createFileBlob = createFileBlob
prototype.createFollow = createFollow
prototype.createLike = createLike
prototype.createPost = createPost
prototype.createRepost = createRepost
prototype.deleteFollow = deleteFollow
prototype.deleteLike = deleteLike
prototype.deletePost = deletePost
prototype.deleteRepost = deleteRepost
prototype.fetchAuthorFeed = fetchAuthorFeed
prototype.fetchFollowers = fetchFollowers
prototype.fetchFollowings = fetchFollowings
prototype.fetchKeywordSearch = fetchKeywordSearch
prototype.fetchNotificationCount = fetchNotificationCount
prototype.fetchNotifications = fetchNotifications
prototype.fetchPostThread = fetchPostThread
prototype.fetchProfile = fetchProfile
prototype.fetchTimeline = fetchTimeline
prototype.fetchUserSearch = fetchUserSearch
prototype.hasLogin = hasLogin
prototype.login = login
prototype.logout = logout
prototype.resumeSession = resumeSession
prototype.saveData = saveData
prototype.updateNotificationSeen = updateNotificationSeen
prototype.updateProfile = updateProfile

export default AtpWrapper
