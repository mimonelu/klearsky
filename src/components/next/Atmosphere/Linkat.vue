<script lang="ts" setup>
import { inject, ref } from "vue"
import { computedAsync } from "@vueuse/core"
import AtmosphereHelper from "@/components/next/Atmosphere/script"
import AtmosphereItem from "@/components/next/Atmosphere/AtmosphereItem.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import { ATMOSPHERE_SERVICE_FAVICONS } from "@/consts/consts.json"

const NUMBER_OF_FETCH_RECORDS = 1

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
  if (props.profile.__linkat != null) {
    return props.profile.__linkat
  }

  // プロフィールデータのコレクションに該当レコードがなければ中止
  if (!AtmosphereHelper.includes("linkat", mainState.currentProfile)) {
    return []
  }

  processing.value = true
  const results = await mainState.atp.fetchRecords(
    props.profile.did,
    AtmosphereHelper.lexicons["linkat"],
    NUMBER_OF_FETCH_RECORDS,
  )
  processing.value = false
  if (results instanceof Error) {
    return []
  }
  const cards = results.records?.[0].value?.cards
  if (cards == null) {
    return []
  }

  // プロフィールデータにキャッシュを保存
  // eslint-disable-next-line
  props.profile.__linkat = cards

  return cards
}, [])
</script>

<template>
  <AtmosphereItem
    class="linkat"
    :processing="processing"
    title="pnLinkat"
    :icon="ATMOSPHERE_SERVICE_FAVICONS.linkat"
    :uri="`https://linkat.blue/${profile?.did}`"
  >
    <template #body>
      <template
        v-for="record, recordIndex of records"
        :key="recordIndex"
      >
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
  </AtmosphereItem>
</template>

<style lang="scss" scoped>
.linkat {
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
