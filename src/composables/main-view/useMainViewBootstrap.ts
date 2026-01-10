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

    window.scrollTo(0, 0)

    const tasks: Array<Promise<unknown>> = []

    // プリファレンスの取得
    const cachedPreferences = loadCachedPreferences()
    if (cachedPreferences != null) {
      applyPreferences(cachedPreferences)
    }
    const preferencesPromise = fetchPreferencesFromNetwork()
    if (cachedPreferences == null) {
      tasks.push(preferencesPromise)
    } else {
      preferencesPromise.catch((error) => {
        $error("useMainViewBootstrap", "Failed to update preferences in background", error)
      })
    }

    // ユーザープロフィールの取得
    const cachedUserProfile = loadCachedUserProfile()
    if (cachedUserProfile != null) {
      applyUserProfile(cachedUserProfile)
    }
    const userProfilePromise = fetchUserProfileFromNetwork()
    if (cachedUserProfile == null) {
      tasks.push(userProfilePromise)
    } else {
      userProfilePromise.catch((error) => {
        $error("useMainViewBootstrap", "Failed to update user profile in background", error)
      })
    }

    await Promise.allSettled(tasks)

    // 通知設定の取得
    state.fetchNotificationPreferences()
      .catch((error) => {
        $error("useMainViewBootstrap", "Failed to fetch notification preferences", error)
      })

    // ラベラーの取得
    if (state.myLabeler!.labelers.length === 0) {
      // `atproto-accept-labelers` 構築のために非同期としている
      // TODO: これもキャッシュで制御したい
      await state.myLabeler!.updateMyLabelers()
        .then(() => {
          state.myLabeler!.setAtprotoAcceptLabelers()
          state.myWorker?.setSessionCache("myLabeler", state.myLabeler!.labelers)
        })
    }

    // カスタムフィードの取得
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

    // リストの取得
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

    // チャットの利用可能状態を取得
    state.myChat!.updateDisabled()
      .then(() => {
        if (state.myChat!.disabled) {
          return
        }

        // チャットを取得
        state.myChat!.updateConvosAll()
          .then((value) => {
            if (!value) {
              return
            }
            state.startChatListTimer()

            // ページタイトルの更新
            // チャット通知があれば表示するため
            state.updatePageTitle()
          })
          .catch((error) => {
            $error("useMainViewBootstrap", "Failed to update chat conversations", error)
          })
      })
      .catch((error) => {
        $error("useMainViewBootstrap", "Failed to update chat disabled status", error)
      })

    // 購読リストの取得
    state.atp.fetchActivitySubscriptions(
      state.activitySubscriptions as Array<TTUser>,
      CONSTS.LIMIT_OF_FETCH_ACTIVITY_SUBSCRIPTIONS
    )
      .catch((error) => {
        $error("useMainViewBootstrap", "Failed to fetch activity subscriptions", error)
      })
      .finally(() => {
        state.updateNotificationInterval()
        state.updateNotifications()
      })

    // 拡張ブックマークの取得
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

    // 招待コードの取得
    if (state.inviteCodes.length === 0) {
      state.updateInviteCodes()
        .then(() => {
          state.myWorker?.setSessionCache("inviteCodes", state.inviteCodes)
        })
        .catch((error) => {
          $error("useMainViewBootstrap", "Failed to update invite codes", error)
        })
    }

    // サーバ情報の取得
    state.fetchCurrentServerInfo()

    changeSetting()
    if (router.currentRoute.value.name === "home") {
      await moveToDefaultHome()
      return
    }
    await processPage(router.currentRoute.value.name as undefined | null | string)
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

function applyPreferences (preferences: Array<TTPreference>) {
  state.currentPreferences.splice(0, state.currentPreferences.length, ...preferences)
  state.myWorker?.setSessionCache("currentPreferences", state.currentPreferences)
}

function applyUserProfile (profile: TTProfile) {
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
