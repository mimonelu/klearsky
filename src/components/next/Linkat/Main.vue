<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
import Atmosphere from "@/components/next/Atmosphere/Main.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"

const NUMBER_OF_FETCH_RECORDS = 1

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
    if (props.profile.__linkat != null) {
      return props.profile.__linkat
    }

    // プロフィールデータのコレクションに該当レコードがなければ中止
    if (!props.profile.__repo?.collections?.includes("blue.linkat.board")) {
      return []
    }

    const results = await mainState.atp.fetchRecords(
      props.profile.did,
      "blue.linkat.board",
      NUMBER_OF_FETCH_RECORDS,
    )
    if (results instanceof Error) {
      return []
    }
    const cards = results.records?.[0].value?.cards
    if (cards == null) {
      return []
    }

    // プロフィールデータにキャッシュを保存
    props.profile.__linkat = cards

    return cards
  }, []),
})
</script>

<template>
  <Atmosphere
    v-if="state.records.length > 0"
    class="linkat"
    title="pnLinkat"
    icon="https://linkat.blue/favicon.ico"
    :uri="`https://linkat.blue/${profile?.handle}`"
  >
    <template #body>
      <template v-for="record of state.records">
        <!-- リンクあり -->
        <a
          v-if="record.url"
          class="linkat__link textlink--icon"
          :href="record.url"
          rel="noreferrer"
          target="_blank"
        >
          <i v-if="record.emoji">{{ record.emoji }}</i>
          <SVGIcon
            v-else
            name="link"
          />
          <span>{{ record.text || record.url }}</span>
        </a>

        <!-- テキストのみ -->
        <div
          v-else
          class="linkat__text"
        >
          <i v-if="record.emoji">{{ record.emoji }}</i>
          <span>{{ record.text }}</span>
        </div>
      </template>
    </template>
  </Atmosphere>
</template>

<style lang="scss" scoped>
.linkat {
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

  &__text {
    display: flex;
    align-items: center;
    grid-gap: 0.5rem;
    overflow: hidden;

    & > i,
    & > span {
      line-height: var(--line-height-middle);
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
