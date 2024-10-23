<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import Atmosphere from "@/components/next/Atmosphere/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const NUMBER_OF_FETCH_RECORDS = 5

const props = defineProps<{
  profile?: TTProfile
}>()

const mainState = inject("state") as MainState

const state = reactive<{
  records: Ref<Array<any>>
}>({
  records: computedAsync<Array<any>>(async () => {
    if (props.profile == null) {
      return []
    }

    // プロフィールデータにキャッシュがあれば再利用
    if (props.profile.__frontpage != null) {
      return props.profile.__frontpage
    }

    // プロフィールデータのコレクションに該当レコードがなければ中止
    if (!props.profile.__repo?.collections?.includes("fyi.unravel.frontpage.post")) {
      return []
    }

    const results = await mainState.atp.fetchRecords(
      props.profile.did,
      "fyi.unravel.frontpage.post",
      NUMBER_OF_FETCH_RECORDS,
    )
    if (results instanceof Error) {
      return []
    }
    const records = results.records
    if (records == null) {
      return []
    }

    // プロフィールデータにキャッシュを保存
    props.profile.__frontpage = records

    return records
  }, []),
})
</script>

<template>
  <Atmosphere
    v-if="state.records.length > 0"
    class="frontpage"
    title="pnFrontpage"
    icon="https://frontpage.fyi/frontpage-logo.svg?b5da8167450d2f63"
    :uri="`https://frontpage.fyi/profile/${profile?.handle}`"
  >
    <template #body>
      <template v-for="record of state.records">
        <a
          class="textlink--icon"
          :href="record.value?.url"
          rel="noreferrer"
          target="_blank"
        >
          <SVGIcon name="link" />
          <span>{{ record.value?.title }}</span>
        </a>
      </template>
    </template>
  </Atmosphere>
</template>

<style lang="scss" scoped>
.frontpage {
  &:deep() {
    .atmosphere__body {
      display: grid;
      grid-gap: 0.5rem;
      grid-template-columns: auto;
      padding: 1rem;
    }
  }

  .textlink--icon {
    overflow: hidden;

    & > .svg-icon {
      fill: rgb(var(--fg-color));
      font-size: 0.875rem;
    }

    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: text;
      white-space: nowrap;
    }
  }
}
</style>
