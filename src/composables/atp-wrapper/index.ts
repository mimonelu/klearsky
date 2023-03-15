import { canLogin, hasLogin } from "@/composables/atp-wrapper/states"
import createAgent from "@/composables/atp-wrapper/create-agent"
import createFollow from "@/composables/atp-wrapper/create-follow"
import createPost from "@/composables/atp-wrapper/create-post"
import createRepost from "@/composables/atp-wrapper/create-repost"
import deleteFollow from "@/composables/atp-wrapper/delete-follow"
import deleteRepost from "@/composables/atp-wrapper/delete-repost"
import fetchAuthorFeed from "@/composables/atp-wrapper/fetch-author-feed"
import fetchFileSchema from "@/composables/atp-wrapper/fetch-file-schema"
import fetchFollowers from "@/composables/atp-wrapper/fetch-followers"
import fetchFollowings from "@/composables/atp-wrapper/fetch-followings"
import fetchPostThread from "@/composables/atp-wrapper/fetch-post-thread"
import fetchProfile from "@/composables/atp-wrapper/fetch-profile"
import fetchTimeline from "@/composables/atp-wrapper/fetch-timeline"
import login from "@/composables/atp-wrapper/login"
import logout from "@/composables/atp-wrapper/logout"
import resumeSession from "@/composables/atp-wrapper/resume-session"
import setService from "@/composables/atp-wrapper/set-service"
import updateProfile from "@/composables/atp-wrapper/update-profile"
import updateVote from "@/composables/atp-wrapper/update-vote"

// @ts-ignore // TODO:
class AtpWrapper implements AbstractAtpWrapper {
  contsructor (this: AbstractAtpWrapper) {
    this.service = null
    this.agent = null
    this.session = null
  }
}

;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).canLogin = canLogin
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).createAgent = createAgent
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).createFollow = createFollow
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).createPost = createPost
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).createRepost = createRepost
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).deleteFollow = deleteFollow
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).deleteRepost = deleteRepost
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).fetchAuthorFeed = fetchAuthorFeed
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).fetchFileSchema = fetchFileSchema
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).fetchFollowers = fetchFollowers
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).fetchFollowings = fetchFollowings
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).fetchPostThread = fetchPostThread
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).fetchProfile = fetchProfile
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).fetchTimeline = fetchTimeline
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).hasLogin = hasLogin
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).login = login
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).logout = logout
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).resumeSession = resumeSession
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).setService = setService
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).updateProfile = updateProfile
;(AtpWrapper.prototype as unknown as AbstractAtpWrapper).updateVote = updateVote

export default AtpWrapper
