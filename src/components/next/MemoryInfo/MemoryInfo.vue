<script setup lang="ts">
import { onMounted, onUnmounted, reactive } from "vue"

interface MemoryInfoItem {
  checked: number
  current: number
  diff: number
}

const state = reactive<{
  memoryInfo: {
    total: MemoryInfoItem
    JavaScript: MemoryInfoItem
    Shared: MemoryInfoItem
    DOM: MemoryInfoItem
    [k: string]: MemoryInfoItem
  },
}>({
  memoryInfo: {
    total: {
      checked: 0,
      current: 0,
      diff: 0,
    },
    JavaScript: {
      checked: 0,
      current: 0,
      diff: 0,
    },
    Shared: {
      checked: 0,
      current: 0,
      diff: 0,
    },
    DOM: {
      checked: 0,
      current: 0,
      diff: 0,
    },
  },
})

let timer: null | NodeJS.Timeout = null

onMounted(async () => {
  updateMemoryInfo()
  timer = setInterval(updateMemoryInfo, 10000)
})

onUnmounted(() => {
  if (timer != null) {
    clearInterval(timer)
  }
})

async function updateMemoryInfo () {
  // SEE: https://web.dev/articles/monitor-total-page-memory-usage?hl=ja
  // NOTICE: `measureUserAgentSpecificMemory` を実行するにはクロスオリジン分離状態を有効化すること
  //         ローカル環境では vite.config.ts に該当コードを記述している
  if (
    !window.crossOriginIsolated ||
    (performance as any).measureUserAgentSpecificMemory == null
  ) {
    return
  }
  const result = await (performance as any).measureUserAgentSpecificMemory()
  if (result instanceof Error) {
    return
  }
  state.memoryInfo.total.current = result.bytes
  state.memoryInfo.total.diff = state.memoryInfo.total.current - state.memoryInfo.total.checked
  result.breakdown.forEach((item: any) => {
    const key = item.types[0]
    if (state.memoryInfo[key] != null) {
      state.memoryInfo[key].current = item.bytes
      state.memoryInfo[key].diff = state.memoryInfo[key].current - state.memoryInfo[key].checked
    }
  })
}

function checkMemoryInfo () {
  Object.keys(state.memoryInfo).forEach((key) => {
    state.memoryInfo[key].checked = state.memoryInfo[key].current
    state.memoryInfo[key].diff = state.memoryInfo[key].current - state.memoryInfo[key].checked
  })
}

function resetMemoryInfo () {
  Object.keys(state.memoryInfo).forEach((key) => {
    state.memoryInfo[key].checked = 0
    state.memoryInfo[key].diff = 0
  })
}

function formatBytes (bytes: number): string {
  return (bytes / (1024 * 1024)).toFixed(2)
}
</script>

<template>
  <div class="memory-info">
    <dl>
      <dt>JavaScript</dt>
      <dd>{{ formatBytes(state.memoryInfo.JavaScript.checked) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.JavaScript.current) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.JavaScript.diff) }}</dd>
      <dt>Shared</dt>
      <dd>{{ formatBytes(state.memoryInfo.Shared.checked) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.Shared.current) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.Shared.diff) }}</dd>
      <dt>DOM</dt>
      <dd>{{ formatBytes(state.memoryInfo.DOM.checked) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.DOM.current) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.DOM.diff) }}</dd>
      <dt>Total</dt>
      <dd>{{ formatBytes(state.memoryInfo.total.checked) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.total.current) }}</dd>
      <dd>{{ formatBytes(state.memoryInfo.total.diff) }}</dd>
    </dl>
    <div class="memory-info__button-container">
      <button
        type="button"
        @click="checkMemoryInfo"
      >Check</button>
      <button
        type="button"
        @click="resetMemoryInfo"
      >Reset</button>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.memory-info {
  background-color: rgba(0, 0, 0, 0.75);
  padding: 0.5rem;
  position: fixed;
  top: 1px;
  left: 1px;
  z-index: 999;
  width: min-content;

  & > dl {
    color: #00c000;
    display: grid;
    grid-gap: 0.25rem 0.5rem;
    grid-template-columns: 1fr 1fr 1fr 1fr;
    font-family: monospace;
    font-size: 0.75rem;
    margin-bottom: 0.5rem;
  }

  &__button-container {
    display: flex;
    grid-gap: 0.5rem;

    & > button {
      background-color: #008000;
      border: none;
      border-radius: 0.25rem;
      color: #ffffff;
      cursor: pointer;
      font-size: 0.75rem;
      padding: 0.25rem 0.5rem;
    }
  }
}
</style>
