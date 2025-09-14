<script lang="ts" setup>
import { inject, ref } from "vue"
import { computedAsync } from "@vueuse/core"
import AtmosphereHelper from "@/components/next/Atmosphere/script"
import AtmosphereItem from "@/components/next/Atmosphere/AtmosphereItem.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { ATMOSPHERE_SERVICE_FAVICONS } from "@/consts/consts.json"

const NUMBER_OF_FETCH_RECORDS = 5

const props = defineProps<{
  profile?: TTProfile
}>()

const mainState = inject("state") as MainState

const processing = ref(false)

const records = computedAsync<Array<any>>(async () => {
  if (props.profile == null) {
    return []
  }

  // プロフィールデータにキャッシュがあれば再利用
  if (props.profile.__frontpage != null) {
    return props.profile.__frontpage
  }

  // プロフィールデータのコレクションに該当レコードがなければ中止
  if (!AtmosphereHelper.includes("frontpage", mainState.currentProfile)) {
    return []
  }

  processing.value = true
  const results = await mainState.atp.fetchRecords(
    props.profile.did,
    AtmosphereHelper.lexicons["frontpage"],
    NUMBER_OF_FETCH_RECORDS,
  )
  processing.value = false
  if (results instanceof Error) {
    return []
  }
  const records = results.records
  if (records == null) {
    return []
  }

  // プロフィールデータにキャッシュを保存
  // eslint-disable-next-line
  props.profile.__frontpage = records

  return records
}, [])
</script>

<template>
  <AtmosphereItem
    class="frontpage"
    :processing="processing"
    title="pnFrontpage"
    :icon="ATMOSPHERE_SERVICE_FAVICONS.frontpage"
    :uri="`https://frontpage.fyi/profile/${profile?.handle}`"
  >
    <template #body>
      <a
        v-for="record, recordIndex of records"
        :key="recordIndex"
        class="textlink--icon"
        :href="record.value?.url"
        rel="noreferrer"
        target="_blank"
      >
        <SVGIcon name="link" />
        <span>{{ record.value?.title }}</span>
      </a>
    </template>
  </AtmosphereItem>
</template>

<style lang="scss" scoped>
.frontpage {
  &:deep() {
    .atmosphere-item__body {
      display: grid;
      grid-gap: 0.5rem;
      grid-template-columns: auto;
      padding: 1rem;
      &:empty {
        display: none;
      }
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
