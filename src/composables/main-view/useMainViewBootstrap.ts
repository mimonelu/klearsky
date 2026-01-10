import type { Router } from "vue-router"
import CONSTS from "@/consts/consts.json"
import { state } from "@/composables/main-state"
import Util from "@/composables/util"

type Options = {
  router: Router
  moveToDefaultHome: () => Promise<void>
  processPage: (pageName?: null | string) => Promise<void>
  changeSetting: () => void
  onRefreshSession: () => void
  setupUpdateJwtInterval: () => void
}

export function useMainViewBootstrap (options: Options) {
  const {
    router,
    moveToDefaultHome,
    processPage,
    changeSetting,
    onRefreshSession,
    setupUpdateJwtInterval,
  } = options

  async function processAfterLogin () {
    onRefreshSession()
    setupUpdateJwtInterval()
    setupNotificationInterval()

    window.scrollTo(0, 0)

    const tasks: Array<Promise<unknown>> = []

    const cachedPreferences = loadCachedPreferences()
    if (cachedPreferences != null) {
      applyCachedPreferences(cachedPreferences)
    }
    const preferencesPromise = fetchPreferencesFromNetwork()
    if (state.currentPreferences.length === 0) {
      tasks.push(preferencesPromise)
    } else {
      preferencesPromise.catch((error) => {
        $error("useMainViewBootstrap", "Failed to update preferences in background", error)
      })
    }

    const cachedUserProfile = loadCachedUserProfile()
    if (cachedUserProfile != null) {
      applyCachedUserProfile(cachedUserProfile)
    }
    const userProfilePromise = fetchUserProfileFromNetwork()
    if (state.userProfile == null) {
      tasks.push(userProfilePromise)
    } else {
      userProfilePromise.catch((error) => {
        $error("useMainViewBootstrap", "Failed to update user profile in background", error)
      })
    }

    await Promise.allSettled(tasks)

    state.fetchNotificationPreferences()
      .catch((error) => {
        $error("useMainViewBootstrap", "Failed to fetch notification preferences", error)
      })

    state.atp.fetchActivitySubscriptions(
      state.activitySubscriptions as Array<TTUser>,
      CONSTS.LIMIT_OF_FETCH_ACTIVITY_SUBSCRIPTIONS
    )
      .catch((error) => {
        $error("useMainViewBootstrap", "Failed to fetch activity subscriptions", error)
      })

    if (state.myLabeler!.labelers.length === 0) {
      await state.myLabeler!.updateMyLabelers()
        .then(() => {
          state.myLabeler!.setAtprotoAcceptLabelers()
          state.myWorker?.setSessionCache("myLabeler", state.myLabeler!.labelers)
        })
    }

    if (state.myFeeds!.items.length === 0) {
      state.myFeeds!.fetchItems()
        .then(() => {
          state.myFeeds!.synchronizeToMyList()
          state.myWorker?.setSessionCache("myFeedsItems", state.myFeeds!.items)
        })
        .catch((error) => {
          $error("useMainViewBootstrap", "Failed to fetch my feeds", error)
        })
    }

    if (state.myLists!.items.length === 0) {
      state.myLists!.fetchAll()
        .then(() => {
          state.myFeeds!.synchronizeToMyList()
          state.myWorker?.setSessionCache("myList", state.myLists!.items)
        })
        .catch((error) => {
          $error("useMainViewBootstrap", "Failed to fetch my lists", error)
        })
    }

    state.myChat!.updateDisabled()
      .then(() => {
        if (state.myChat!.disabled) {
          return
        }
        state.myChat!.updateConvosAll()
          .then((value) => {
            if (!value) {
              return
            }
            state.startChatListTimer()
            state.updatePageTitle()
          })
          .catch((error) => {
            $error("useMainViewBootstrap", "Failed to update chat conversations", error)
          })
      })
      .catch((error) => {
        $error("useMainViewBootstrap", "Failed to update chat disabled status", error)
      })

    if (state.currentCustomBookmarkPacks.length === 0) {
      state.atp.fetchCustomBookmarkPacks(
        state.currentCustomBookmarkPacks,
        state.atp.session!.did,
        100,
        undefined
      )
        .then(() => {
          state.myWorker?.setSessionCache("customBookmarkPacks", state.currentCustomBookmarkPacks)
        })
        .catch((error) => {
          $error("useMainViewBootstrap", "Failed to fetch custom bookmark packs", error)
        })
    }

    if (state.inviteCodes.length === 0) {
      state.updateInviteCodes()
        .then(() => {
          state.myWorker?.setSessionCache("inviteCodes", state.inviteCodes)
        })
        .catch((error) => {
          $error("useMainViewBootstrap", "Failed to update invite codes", error)
        })
    }

    state.fetchCurrentServerInfo()

    changeSetting()
    if (router.currentRoute.value.name === "home") {
      await moveToDefaultHome()
      return
    }
    await processPage(router.currentRoute.value.name as undefined | null | string)
    setupTimelineInterval()
  }

  async function setupNotificationInterval () {
    state.updateNotificationInterval()
    await state.updateNotifications()
  }

  function setupTimelineInterval () {
    state.updateTimelineInterval()
  }

  return {
    processAfterLogin,
  }
}

const STORAGE_KEYS = {
  currentPreferences: "cache:preferences",
  userProfile: "cache:profile",
}

function getCurrentDid (): string | undefined {
  return state.atp.session?.did ?? state.atp.data.did
}

function loadCachedPreferences (): Array<TTPreference> | null {
  return loadCachedData<Array<TTPreference>>(STORAGE_KEYS.currentPreferences)
}

function loadCachedUserProfile (): TTProfile | null {
  return loadCachedData<TTProfile>(STORAGE_KEYS.userProfile)
}

function loadCachedData<T> (key: string): T | null {
  const did = getCurrentDid()
  if (did == null) return null
  const cached = Util.loadStorage(key)
  if (cached?.did !== did) return null
  return cached.payload as T
}

function saveCachedData (key: string, payload: unknown) {
  const did = getCurrentDid()
  if (did == null) return
  Util.saveStorage(key, { did, payload })
}

function applyCachedPreferences (preferences: Array<TTPreference>) {
  state.currentPreferences.splice(0, state.currentPreferences.length, ...preferences)
  state.myWorker?.setSessionCache("currentPreferences", state.currentPreferences)
}

function applyCachedUserProfile (profile: TTProfile) {
  state.userProfile = profile
  state.myWorker?.setSessionCache("userProfile", state.userProfile)
}

function fetchPreferencesFromNetwork () {
  return state.fetchPreferences()
    .then((result) => {
      state.myWorker?.setSessionCache("currentPreferences", state.currentPreferences)
      saveCachedData(STORAGE_KEYS.currentPreferences, state.currentPreferences)
      return result
    })
}

function fetchUserProfileFromNetwork () {
  return state.fetchUserProfile()
    .then((result) => {
      state.myWorker?.setSessionCache("userProfile", state.userProfile)
      if (state.userProfile != null) {
        saveCachedData(STORAGE_KEYS.userProfile, state.userProfile)
      }
      return result
    })
}
