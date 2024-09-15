<script lang="ts" setup>
import { inject, nextTick, onBeforeUnmount, reactive, ref, watch } from "vue"
import LazyImage from "@/components/images/LazyImage.vue"
import CONSTS from "@/consts/consts.json"

const emit = defineEmits<{(event: string, params: any): void}>()

const props = defineProps<{
  text: string
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  display: boolean
  users?: Array<TTUser>
  text?: string
  timer?: any
  index: number
  inputMode: "mouse" | "keyboard"
}>({
  display: false,
  users: undefined,
  text: undefined,
  timer: undefined,
  index: 0,
  inputMode: "keyboard",
})

const suggestButtons = ref(null)

let textarea: null | HTMLTextAreaElement = null
let startIndex = - 1
let endIndex = - 1

watch(() => props.text, (value: string) => {
  textarea = document.activeElement as null | HTMLTextAreaElement
  if (textarea == null) {
    resetState()
    return
  }
  const index = textarea.selectionEnd ?? - 1
  if (index === - 1) {
    resetState()
    return
  }
  const frontText = value.substring(0, index)
  const backText = value.substring(index)
  const frontMatch = frontText.match(/(?:^|\s)@([^\s]*)$/)
  const backMatch = backText.match(/^([\w.]*)/)
  if (frontMatch == null || backMatch == null) {
    resetState()
    return
  }
  state.text = frontMatch[1] + backMatch[1]
  if (state.text === "") {
    resetState()
    return
  }

  // 有効化

  startIndex = frontMatch.index ?? - 1
  endIndex = startIndex + state.text.length
  state.display = true
  window.addEventListener("click", resetState)
  window.addEventListener("keydown", onKeyDown)
  window.addEventListener("keyup", onKeyUp)

  if (state.timer != null) {
    clearTimeout(state.timer)
    state.timer = undefined
  }
  state.timer = setTimeout(async () => {
    if (!state.display || !state.text) return
    const results = await mainState.atp.fetchActorsTypeahead(state.text, CONSTS.LIMIT_OF_FETCH_ACTORS_TYPEAHEAD)
    if (results instanceof Error) return
    state.users = results
      .filter((user: TTUser) => {
        return user.viewer.brocking == null && !user.viewer.blockedBy
      })
      .sort((a: TTUser, b: TTUser) => {
        const aWeight =
          a.viewer.following != null
            ? 3
            : a.viewer.followedBy != null
              ? 2
              : a.viewer.muted
                ? - 1
                : 0
        const bWeight =
          b.viewer.following != null
            ? 3
            : b.viewer.followedBy != null
              ? 2
              : b.viewer.muted
                ? - 1
                : 0
      return aWeight < bWeight ? 1 : aWeight > bWeight ? - 1 : 0
    })
    state.timer = undefined

    // リスト表示
  }, 500)
})

onBeforeUnmount(resetState)

function resetState () {
  state.display = false
  state.users?.splice(0)
  state.text = undefined
  state.index = 0
  window.removeEventListener("click", resetState)
  window.removeEventListener("keydown", onKeyDown)
  window.removeEventListener("keyup", onKeyUp)
  if (textarea != null) textarea.focus()
}

function onKeyDown (event: KeyboardEvent) {
  switch (event.code) {
    case "Escape": {
      event.preventDefault()
      event.stopPropagation()
      resetState()
      return
    }
    case "Enter": {
      if (state.users == null) break
      event.preventDefault()
      event.stopPropagation()
      selectUser(state.users[state.index])
      return
    }
    case "ArrowUp": {
      event.preventDefault()
      moveSuggestButtonFocus("up")
      return
    }
    case "ArrowDown": {
      event.preventDefault()
      moveSuggestButtonFocus("down")
      return
    }
    default: break
  }
}

function onKeyUp () {
  const element = document.activeElement as null | HTMLTextAreaElement
  if (element == null) {
    resetState()
    return
  }
  if (element.id !== textarea?.id && element.className !== "mention-suggestion-list__suggestion__item") resetState()
}

function moveSuggestButtonFocus (direction: "up" | "down") {
  if (state.users == null) return
  if (direction === "up") {
    if (-- state.index < 0) state.index = state.users.length - 1
  } else {
    if (++ state.index >= state.users.length) state.index = 0
  }
  state.inputMode = "keyboard"

  nextTick(() => {
    const focusElement = document.querySelector(".mention-suggestion-list__suggestion__item[data-focus='true']")
    if (focusElement == null) return
    focusElement.scrollIntoView({ block: "nearest" })
  })
}

function selectUser (user?: TTUser) {
  if (user == null) return
  if (startIndex !== - 1) {
    const currentStartIndex = startIndex + (startIndex === 0 ? 1 : 2)
    const currentEndIndex = endIndex + (startIndex === 0 ? 1 : 2)
    const hasSpace = props.text.charAt(currentEndIndex) !== " "
    const text =
      props.text.substring(0, currentStartIndex) +
      user.handle +
      (hasSpace ? " " : "") +
      props.text.substring(currentEndIndex)
    emit("select", { text, endIndex: currentStartIndex + user.handle.length + 1 })
  }
  if (textarea != null) textarea.focus()
  nextTick(resetState)
}
</script>

<template>
  <div class="mention-suggestion-list">
    <div
      v-if="state.display"
      class="mention-suggestion-list__suggestion"
      :data-input-mode="state.inputMode"
      @mousemove="state.inputMode = 'mouse'"
    >
      <div
        v-for="user, index of state.users"
        :key="user.did"
        ref="suggestButtons"
        class="mention-suggestion-list__suggestion__item"
        :data-focus="state.index === index"
        @click.prevent="selectUser(user)"
      >
        <LazyImage :src="user.avatar" />
        <div class="mention-suggestion-list__suggestion__item__display-name">{{ user.displayName }}</div>
        <div class="mention-suggestion-list__suggestion__item__handle">{{ user.handle }}</div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.mention-suggestion-list {
  &__suggestion {
    border: 1px solid rgb(var(--fg-color), 0.25);
    border-radius: var(--border-radius-middle);
    display: flex;
    flex-direction: column;
    overflow: hidden;
    &:empty {
      display: none;
    }

    &__item {
      background-clip: padding-box;
      background-color: rgb(var(--fg-color), 0.125);
      cursor: pointer;
      display: grid;
      grid-template-columns: auto auto 1fr;
      grid-gap: 0 0.5em;
      align-items: center;
      padding: 0.25em 0.5em;
      white-space: nowrap;
      &:not(:last-child) {
        border-bottom: 1px solid rgb(var(--fg-color), 0.25);
      }

      .lazy-image {
        border-radius: var(--border-radius-large);
        font-size: 1.5em;
        object-fit: cover;
        min-width: 1.5rem;
        max-width: 1.5rem;
        min-height: 1.5rem;
        max-height: 1.5rem;
      }

      &__display-name,
      &__handle {
        line-height: 1.25;
        overflow: hidden;
        text-overflow: ellipsis;
      }

      &__display-name {
        font-size: 0.875em;
        font-weight: bold;
      }

      &__handle {
        color: rgb(var(--fg-color), 0.75);
        font-size: 0.75em;
      }
    }
    &[data-input-mode="keyboard"] &__item[data-focus="true"],
    &[data-input-mode="mouse"] &__item:hover {
      background-color: rgb(var(--accent-color), 0.25);
    }
  }
}
</style>
