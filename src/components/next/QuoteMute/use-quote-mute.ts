import { computed, type ComputedRef } from "vue"

export function useQuoteMute(getDid: () => string, mainState: MainState) {
  const isQuoteMuted: ComputedRef<boolean> = computed(() => {
    return mainState.quoteMutes.some((subject) => subject.did === getDid())
  })

  async function toggleQuoteMute(): Promise<Error | void> {
    const did = getDid()
    let newSubjects: Array<TIQuoteMuteSubject>
    if (isQuoteMuted.value) {
      // 引用リポストミュートを解除
      newSubjects = mainState.quoteMutes.filter((subject) => subject.did !== did)
    } else {
      // 引用リポストミュートを追加
      newSubjects = [
        { did, createdAt: new Date().toISOString() },
        ...mainState.quoteMutes,
      ]
    }
    const response = await mainState.atp.updateQuoteMutes(newSubjects)
    if (response instanceof Error) {
      return response
    }
    mainState.quoteMutes.splice(0, mainState.quoteMutes.length, ...newSubjects)
    mainState.myWorker?.setSessionCache("quoteMutes", mainState.quoteMutes)
  }

  return {
    isQuoteMuted,
    toggleQuoteMute,
  }
}
