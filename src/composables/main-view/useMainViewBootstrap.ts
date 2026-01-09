import type { Router } from "vue-router"
import CONSTS from "@/consts/consts.json"
import { state } from "@/composables/main-state"

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

    const tasks: { [k: string]: any } = {}
    if (state.currentPreferences.length === 0) {
      tasks.currentPreferences = state.fetchPreferences()
    }
    if (state.userProfile == null) {
      tasks.userProfile = state.fetchUserProfile()
    }
    await Promise.allSettled(Object.values(tasks))

    if (tasks.currentPreferences != null) {
      state.myWorker?.setSessionCache("currentPreferences", state.currentPreferences)
    }
    if (tasks.userProfile != null) {
      state.myWorker?.setSessionCache("userProfile", state.userProfile)
    }

    state.fetchNotificationPreferences()

    state.atp.fetchActivitySubscriptions(
      state.activitySubscriptions as Array<TTUser>,
      CONSTS.LIMIT_OF_FETCH_ACTIVITY_SUBSCRIPTIONS
    )

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
    }

    if (state.myLists!.items.length === 0) {
      state.myLists!.fetchAll()
        .then(() => {
          state.myFeeds!.synchronizeToMyList()
          state.myWorker?.setSessionCache("myList", state.myLists!.items)
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
    }

    if (state.inviteCodes.length === 0) {
      state.updateInviteCodes()
        .then(() => {
          state.myWorker?.setSessionCache("inviteCodes", state.inviteCodes)
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
