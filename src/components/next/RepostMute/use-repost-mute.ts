import { computed, type ComputedRef } from "vue"

export function useRepostMute(getDid: () => string, mainState: MainState) {
  const isRepostMuted: ComputedRef<boolean> = computed(() => {
    return mainState.repostMutes.some((subject) => subject.did === getDid())
  })

  async function toggleRepostMute(): Promise<Error | void> {
    const did = getDid()
    let newSubjects: Array<TIRepostMuteSubject>
    if (isRepostMuted.value) {
      // リポストミュートを解除
      newSubjects = mainState.repostMutes.filter((subject) => subject.did !== did)
    } else {
      // リポストミュートを追加
      newSubjects = [
        { did, createdAt: new Date().toISOString() },
        ...mainState.repostMutes,
      ]
    }
    const response = await mainState.atp.updateRepostMutes(newSubjects)
    if (response instanceof Error) {
      return response
    }
    mainState.repostMutes.splice(0, mainState.repostMutes.length, ...newSubjects)
    mainState.myWorker?.setSessionCache("repostMutes", mainState.repostMutes)
  }

  return {
    isRepostMuted,
    toggleRepostMute,
  }
}
