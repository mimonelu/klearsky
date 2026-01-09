import { nextTick } from "vue"
import type { Router, RouteLocationNormalizedLoaded, RouteLocationNormalized, LocationQueryValue } from "vue-router"
import { state } from "@/composables/main-state"
import { PROFILE_ERRORS } from "@/consts/errors.json"

type TranslationFn = (key: string) => string

export function useMainViewNavigation (router: Router, $t: TranslationFn) {
  function setupRouteGuards () {
    const removeBeforeEach = router.beforeEach(async (to: RouteLocationNormalized) => {
      if (to.name === "home") {
        return
      }

      state.currentPath = to.path
      state.currentQuery = to.query

      if (to.path.startsWith("/profile")) {
        if (state.currentQuery.account !== state.currentProfile?.handle &&
            state.currentQuery.account !== state.currentProfile?.did) {
          state.profileFolding = false
          state.currentProfile = null
          state.currentLabeler = undefined
        } else {
          state.profileFolding = true
        }

        state.inSameProfilePage = state.currentProfile != null
        if (!state.inSameProfilePage) {
          state.resetProfileState()
        }
      }

      state.currentPosts?.splice(0)

      state.repostUsersPopupDisplay = false
      state.quoteRepostsPopupDisplay = false
      state.likeUsersPopupDisplay = false
    })

    const removeAfterEach = router.afterEach(async (to: RouteLocationNormalizedLoaded) => {
      if (to.name === "home") {
        await moveToDefaultHome()
        return
      }
      state.updatePageTitle()

      if (to.name === "timeline-home" && state.timelineFeeds.length > 0) {
        return
      }

      await processPage(to.name as undefined | null | string)
    })

    return () => {
      removeBeforeEach()
      removeAfterEach()
    }
  }

  function updatePageTitle () {
    const unreadCount = state.notificationCount + state.myChat!.unread
    let title = unreadCount === 0 ? "" : `(${unreadCount}) `
    title += "Klearsky"

    if (state.currentPath.startsWith("/search/"))
      title += ` - ${$t("search")}`

    else if (state.currentPath.startsWith("/profile/") &&
        state.currentProfile?.displayName != null)
      title += ` - ${state.currentProfile.displayName}`

    if (router.currentRoute.value.meta.label != null)
      title += ` - ${$t(router.currentRoute.value.meta.label as string)}`

    if (state.currentPath === "/home/feeds")
      title += ` - ${state.currentQuery.displayName ?? $t("customFeeds")}`

    else if (state.currentPath === "/home/list-feeds")
      title += ` - ${state.currentQuery.displayName ?? $t("listFeeds")}`

    else if (state.currentPath === "/home/list-users")
      title += ` - ${state.currentQuery.displayName ?? $t("listUsers")}`

    else if (state.currentPath.startsWith("/post") &&
        state.currentPosts != null &&
        state.currentPosts.length > 0)
      title += ` - ${state.currentPosts[0].author.displayName}`

    else if (state.currentPath.startsWith("/search/post"))
      title += ` - ${state.currentSearchTerm}`

    window.document.title = title
  }

  async function moveToDefaultHome () {
    const firstPinnedItem = state.myFeeds!.pinnedItems[0]

    if (firstPinnedItem == null) {
      const uri = state.currentFeedPreference?.pinned?.[0]

      if (uri != null) {
        const kind = state.myFeeds!.detectItemKind(uri)
        switch (kind) {
          case "feed": {
            await router.replace({
              path: "/home/feeds",
              query: { feed: uri },
            })
            return
          }
          case "list": {
            await router.replace({
              path: "/home/list-feeds",
              query: { list: uri },
            })
            return
          }
          case "following": {
            await router.push("/home/timeline")
            return
          }
          case "space.aoisora.preference.feed.extra": {
            if (uri === "trending") {
              await router.push("/home/trending")
              return
            } else if (uri === "globalline") {
              await router.push("/home/globalline")
              return
            }
            return
          }
          default: {
            break
          }
        }
      } else {
        await router.replace("/home/timeline")
        return
      }
    } else {
      switch (firstPinnedItem.kind) {
        case "feed": {
          await router.replace({
            path: "/home/feeds",
            query: {
              feed: firstPinnedItem.value.uri,
              displayName: firstPinnedItem.value.displayName,
            },
          })
          return
        }
        case "list": {
          await router.replace({
            path: "/home/list-feeds",
            query: {
              list: firstPinnedItem.value.uri,
              displayName: firstPinnedItem.value.name,
            },
          })
          return
        }
        case "following": {
          await router.push("/home/timeline")
          return
        }
        case "space.aoisora.preference.feed.extra": {
          if (firstPinnedItem.value.uri === "trending") {
            await router.push("/home/trending")
            return
          } else if (firstPinnedItem.value.uri === "globalline") {
            await router.push("/home/globalline")
            return
          }
          return
        }
        default: {
          break
        }
      }
    }

    await router.push("/home/timeline")
  }

  async function processPage (pageName?: null | string) {
    let account: undefined | string
    switch (pageName) {
      case "profile-feeds":
      case "profile-feeds-with-replies":
      case "profile-feeds-with-media":
      case "profile-feeds-with-video":
      case "profile-feed-generators":
      case "profile-repost":
      case "profile-like":
      case "profile-list":
      case "profile-following":
      case "profile-follower":
      case "profile-starter-packs":
      case "profile-suggested-follows": {
        account = (state.currentQuery.account as LocationQueryValue) ?? undefined
        if (!account) {
          await router.push({ name: "home" })
          break
        }
        break
      }
    }

    state.listLoaderDisplay = true
    try {
      switch (pageName) {
        case "profile-feeds": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorFeeds.length === 0) {
            await state.fetchCurrentAuthorFeed("new")
          }
          break
        }
        case "profile-feeds-with-replies": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorFeedsWithReplies.length === 0) {
            await state.fetchCurrentAuthorFeed("new", "posts_with_replies")
          }
          break
        }
        case "profile-feeds-with-media": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorFeedsWithMedia.length === 0) {
            await state.fetchCurrentAuthorFeed("new", "posts_with_media")
          }
          break
        }
        case "profile-feeds-with-video": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorFeedsWithVideo.length === 0) {
            await state.fetchCurrentAuthorFeed("new", "posts_with_video")
          }
          break
        }
        case "profile-repost": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorReposts.length === 0) {
            await state.fetchAuthorReposts("new")
          }
          break
        }
        case "profile-like": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorLikes.length === 0) {
            await state.fetchAuthorLikes("new")
          }
          break
        }
        case "profile-list": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.isMyProfile() && (!state.inSameProfilePage || state.currentAuthorLists.length === 0)) {
            await state.fetchAuthorLists("new")
          }
          break
        }
        case "profile-feed-generators": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorFeedGenerators.length === 0) {
            await state.fetchCurrentAuthorFeedGenerators("new")
          }
          break
        }
        case "profile-starter-packs": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentAuthorStarterPacks.length === 0) {
            await state.fetchAuthorStarterPacks("new")
          }
          break
        }
        case "profile-following": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentFollowings.length === 0) {
            await state.fetchFollowings("new")
          }
          break
        }
        case "profile-follower": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentFollowers.length === 0) {
            await state.fetchFollowers("new")
          }
          break
        }
        case "profile-suggested-follows": {
          const response = await processProfilePage(account)
          if (response instanceof Error) {
            break
          }
          if (!state.inSameProfilePage || state.currentSuggestedFollows.length === 0) {
            await state.fetchSuggestedFollows()
          }
          break
        }
        case "timeline-home": {
          await state.fetchTimeline("new")
          break
        }
        case "feeds-home": {
          if (state.currentCustomFeedsUri !== state.currentQuery.feed ||
              state.currentCustomFeeds.length === 0)
            await state.fetchCustomFeeds("new")
          break
        }
        case "list-feeds-home": {
          await updateCurrentList()
          if (state.currentListFeeds.length === 0)
            await state.fetchCurrentListFeeds("new")
          break
        }
        case "list-users-home": {
          await updateCurrentList()
          if (state.currentListItems.length === 0)
            await state.fetchCurrentListItems("new")
          break
        }
        case "post": {
          await state.fetchPostThread()
          await nextTick()
          scrollToFocused()
          break
        }
      }
    } finally {
      state.listLoaderDisplay = false
    }

    if (pageName?.startsWith("post") ||
        pageName?.startsWith("profile") ||
        pageName?.startsWith("search-post")) {
      setTimeout(state.updatePageTitle, 1)
    }
  }

  async function processProfilePage (account?: string): Promise<Error | undefined> {
    if (account == null) {
      return
    }
    if (account !== state.currentProfile?.handle &&
        account !== state.currentProfile?.did) {
      const response = await state.fetchCurrentProfile(account)
      if (response instanceof Error) {
        return response
      }

      if (state.currentProfile?.handle != null) {
        const profileError = Object.values(PROFILE_ERRORS)
          .find((error) => error === state.currentProfile?.handle)
        if (profileError != null) {
          state.currentProfile.handle = $t(profileError)
        }
      }
    }
    if (state.currentProfile?.associated?.labeler && state.currentLabeler == null) {
      state.myLabeler!.updateCurrentLabeler(state.currentProfile.did)
    }
  }

  async function updateCurrentList () {
    const listUri: undefined | string = state.currentQuery.list
    if (listUri == null) return
    if (state.currentList?.uri === listUri) return

    state.currentListFeeds.splice(0)
    state.currentListFeedsCursor = undefined
    state.currentListItems.splice(0)
    state.currentListItemsCursor = undefined

    state.currentList = undefined
    state.currentList = state.myLists!.items.find((list: TTList) => {
      return list.uri === listUri
    })
    if (state.currentList == null) {
      state.currentList = state.currentAuthorLists.find((list: TTList) => {
        return list.uri === listUri
      })
      if (state.currentList == null) {
        await state.fetchCurrentList(listUri)
      }
    }
  }

  function scrollToFocused () {
    const focusElement = document.querySelector("[data-focus='true']")
    if (focusElement != null) focusElement.scrollIntoView({
      behavior: "smooth",
      block: "start",
    })
  }

  return {
    setupRouteGuards,
    updatePageTitle,
    moveToDefaultHome,
    processPage,
  }
}
