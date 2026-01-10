<script lang="ts" setup>
import { inject, ref } from "vue"
import { computedAsync } from "@vueuse/core"
import AtmosphereHelper from "@/components/next/Atmosphere/script"
import AtmosphereItem from "@/components/next/Atmosphere/AtmosphereItem.vue"
import AvatarLink from "@/components/next/Avatar/AvatarLink.vue"
import { ATMOSPHERE_SERVICE_FAVICONS } from "@/consts/consts.json"

interface SkyBeMoreBlueItem {
  did: string
  avatar?: string
  displayName?: string
  introduction?: string
}

const NUMBER_OF_FETCH_RECORDS = 5

const props = defineProps<{
  profile?: TTProfile
}>()

const mainState = inject("state") as MainState

const processing = ref(false)

const items = computedAsync<Array<SkyBeMoreBlueItem>>(async () => {
  if (props.profile == null) {
    return []
  }

  // プロフィールデータにキャッシュがあれば再利用
  if (props.profile.__skyBeMoreBlue != null) {
    return props.profile.__skyBeMoreBlue
  }

  // プロフィールデータのコレクションに該当レコードがなければ中止
  if (!AtmosphereHelper.includes("skybemoreblue", mainState.currentProfile)) {
    return []
  }

  processing.value = true

  // レコードの取得
  const recordResults = await mainState.atp.fetchRecords(
    props.profile.did,
    AtmosphereHelper.lexicons["skybemoreblue"],
    NUMBER_OF_FETCH_RECORDS,
  )
  if (recordResults instanceof Error) {
    processing.value = false
    return []
  }

  // レコードのソート
  recordResults.records.sort((a, b) => {
    const aDate = new Date(a.value?.updatedAt)
    const bDate = new Date(b.value?.updatedAt)
    return aDate < bDate ? 1 : aDate > bDate ? - 1 : 0
  })

  // プロフィールの取得
  const actors = recordResults.records.map((record) => record.value?.subject)
  const profileResults = await mainState.atp.fetchProfiles(actors)
  if (profileResults instanceof Error) {
    processing.value = false
    return []
  }

  processing.value = false

  // GACCHANKO!
  const results = recordResults.records
    .map((record) => {
      const profile = profileResults.find((profile) => {
        return record.value?.subject === profile.did
      })
      if (profile != null) {
        return {
          did: profile.did,
          avatar: profile.avatar,
          displayName: profile.displayName,
          introduction: record.value?.body,
        }
      }
    })
    .filter(Boolean)

  // プロフィールデータにキャッシュを保存
  // eslint-disable-next-line
  props.profile.__skyBeMoreBlue = results

  return results
}, [])
</script>

<template>
  <AtmosphereItem
    class="sky-be-more-blue"
    :processing="processing"
    title="pnSkyBeMoreBlue"
    :icon="ATMOSPHERE_SERVICE_FAVICONS.skybemoreblue"
    :uri="`https://www.skybemoreblue.com/user/${profile?.did}`"
  >
    <template #body>
      <div
        class="sky-be-more-blue__container"
        :data-items="items.length"
      >
        <RouterLink
          v-for="item, itemIndex of items"
          :key="itemIndex"
          :to="{ name: 'profile-feeds', query: { account: item.did } }"
          class="sky-be-more-blue__item"
        >
          <!-- NOTICE: `blur` `isLabeler` `actorStatus` を判断できない -->
          <AvatarLink
            class="sky-be-more-blue__avatar"
            :did="item.did"
            :image="item.avatar"
            :blur="false"
            :isLabeler="false"
            :noLink="true"
          />

          <div
            class="sky-be-more-blue__display-name"
            translate="no"
          >{{ item.displayName || "&nbsp;" }}</div>
          <div class="sky-be-more-blue__introduction">{{ item.introduction || "&nbsp;" }}</div>
        </RouterLink>
      </div>
    </template>
  </AtmosphereItem>
</template>

<style lang="scss" scoped>
.sky-be-more-blue {
  &:deep() {
    .atmosphere-item__body {
      display: grid;
    }
  }

  &__container {
    display: flex;
    overflow-x: auto;
    overflow-y: hidden;
    @include scroll-bar(transparent);
  }

  &__item {
    display: grid;
    grid-template-areas:
      "a d"
      "a i";
    grid-template-columns: auto 1fr;
    grid-gap: 0 0.5rem;
    align-items: center;
    padding: 1rem;
    position: relative;

    &:not(:last-child)::after {
      border-right: 1px solid rgb(var(--blue-color), 0.5);
      content: "";
      display: block;
      position: absolute;
      right: 0;
      top: 12.5%;
      width: 1px;
      height: 75%;
    }

    // レコードが1つの場合
    [data-items="1"] & {
      min-width: 100%;
      max-width: 100%;
    }

    // レコードが2つの場合
    [data-items="2"] & {
      min-width: 50%;
      max-width: 50%;
    }

    // レコードが3つ以上の場合（3つ目をチラ見せする）
    :not([data-items="1"]) &,
    :not([data-items="2"]) & {
      @include media-sp-layout() {
        min-width: 75%;
        max-width: 75%;
      }
      @include media-not-sp-layout() {
        min-width: 43.75%;
        max-width: 43.75%;
      }
    }
  }

  &__avatar {
    grid-area: a;
    font-size: 3em;
  }

  &__display-name {
    grid-area: d;
    font-size: 0.875rem;
    font-weight: bold;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }

  &__introduction {
    grid-area: i;
    color: rgb(var(--fg-color), 0.75);
    font-size: 0.875rem;
    line-height: var(--line-height-middle);
    overflow: hidden;
    text-overflow: ellipsis;

    // デフォルト1行でトリム
    white-space: nowrap;
  }

  // 可能であれば2行でトリム
  @supports (-webkit-line-clamp: 2) or (line-clamp: 2) {
    &__introduction {
      display: -webkit-box;
      line-clamp: 2;
      -webkit-line-clamp: 2;
      box-orient: vertical;
      -webkit-box-orient: vertical;
      white-space: unset;
    }
  }
}
</style>
