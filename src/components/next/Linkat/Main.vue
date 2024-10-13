<script lang="ts" setup>
import { inject, reactive, type Ref } from "vue"
import { computedAsync } from "@vueuse/core"
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
  <div
    v-if="state.records.length > 0"
    class="linkat"
  >
    <a
      class="linkat__header"
      :href="`https://linkat.blue/${profile?.handle}`"
      rel="noreferrer"
      target="_blank"
    >
      <SVGIcon name="openInApp" />
      <span>{{ $t("Linkat") }}</span>
    </a>
    <template v-for="record of state.records">
      <a
        v-if="record.url"
        class="linkat__link textlink--icon"
        :href="record.url"
        rel="noreferrer"
        target="_blank"
      >
        <SVGIcon name="link" />
        <span>{{ record.text || record.url }}</span>
      </a>
      <div
        v-else
        class="linkat__text"
      >{{ record.text }}</div>
    </template>
  </div>
</template>

<style lang="scss" scoped>
.linkat {
  background-color: rgb(var(--cyan-dark-color), 0.125);
  border-radius: var(--border-radius-middle);
  display: flex;
  flex-direction: column;
  grid-gap: 0.5em;
  padding: 1em;

  &__header {
    --alpha: 0.75;
    display: grid;
    grid-gap: 0.5em;
    grid-template-columns: auto 1fr;
    align-items: center;
    &:focus, &:hover {
      --alpha: 1.0;
    }

    & > .svg-icon {
      fill: rgb(var(--cyan-dark-color), var(--alpha));
    }

    & > span {
      color: rgb(var(--cyan-dark-color), var(--alpha));
      font-weight: bold;
      line-height: var(--line-height-middle);
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
  }

  .textlink--icon {
    & > .svg-icon {
      font-size: 0.875em;
    }

    & > span {
      overflow: hidden;
      text-overflow: ellipsis;
      user-select: text;
      white-space: nowrap;
    }
  }

  &__text {
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    user-select: text;
    white-space: nowrap;
  }
}
</style>
