import {
  canLogin,
  hasLogin,
  saveData,
} from "@/composables/atp-wrapper/services"
import createAgent from "@/composables/atp-wrapper/create-agent"
import createFileSchema from "@/composables/atp-wrapper/create-file-schema"
import createFollow from "@/composables/atp-wrapper/create-follow"
import createPost from "@/composables/atp-wrapper/create-post"
import createRepost from "@/composables/atp-wrapper/create-repost"
import deleteFollow from "@/composables/atp-wrapper/delete-follow"
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
import updateVote from "@/composables/atp-wrapper/update-vote"
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
  }
}

;(AtpWrapper.prototype as unknown as TIAtpWrapper).canLogin = canLogin
;(AtpWrapper.prototype as unknown as TIAtpWrapper).createAgent =
  createAgent
;(AtpWrapper.prototype as unknown as TIAtpWrapper).createFileSchema =
  createFileSchema
;(AtpWrapper.prototype as unknown as TIAtpWrapper).createFollow =
  createFollow
;(AtpWrapper.prototype as unknown as TIAtpWrapper).createPost = createPost
;(AtpWrapper.prototype as unknown as TIAtpWrapper).createRepost =
  createRepost
;(AtpWrapper.prototype as unknown as TIAtpWrapper).deleteFollow =
  deleteFollow
;(AtpWrapper.prototype as unknown as TIAtpWrapper).deletePost = deletePost
;(AtpWrapper.prototype as unknown as TIAtpWrapper).deleteRepost =
  deleteRepost
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchAuthorFeed =
  fetchAuthorFeed
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchFollowers =
  fetchFollowers
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchFollowings =
  fetchFollowings
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchKeywordSearch =
  fetchKeywordSearch
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchNotificationCount =
  fetchNotificationCount
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchNotifications =
  fetchNotifications
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchPostThread =
  fetchPostThread
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchProfile =
  fetchProfile
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchTimeline =
  fetchTimeline
;(AtpWrapper.prototype as unknown as TIAtpWrapper).fetchUserSearch =
  fetchUserSearch
;(AtpWrapper.prototype as unknown as TIAtpWrapper).hasLogin = hasLogin
;(AtpWrapper.prototype as unknown as TIAtpWrapper).login = login
;(AtpWrapper.prototype as unknown as TIAtpWrapper).logout = logout
;(AtpWrapper.prototype as unknown as TIAtpWrapper).resumeSession =
  resumeSession
;(AtpWrapper.prototype as unknown as TIAtpWrapper).saveData =
  saveData
;(AtpWrapper.prototype as unknown as TIAtpWrapper).updateNotificationSeen =
  updateNotificationSeen
;(AtpWrapper.prototype as unknown as TIAtpWrapper).updateProfile =
  updateProfile
;(AtpWrapper.prototype as unknown as TIAtpWrapper).updateVote = updateVote

export default AtpWrapper
