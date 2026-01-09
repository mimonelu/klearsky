import { state } from "@/composables/main-state"

export function useMainViewSettings () {
  function saveSetting () {
    state.saveSettings()
  }

  function changeSetting () {
    state.saveSettings()
    state.updateSettings()
  }

  return {
    saveSetting,
    changeSetting,
  }
}
