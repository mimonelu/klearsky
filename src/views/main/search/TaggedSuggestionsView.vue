<script lang="ts" setup>
import SVGIcon from "@/components/images/SVGIcon.vue";
import { inject, onMounted } from "vue"

const mainState = inject("state") as MainState

onMounted(async () => {
  if (Object.keys(mainState.currentTaggedSuggestions).length === 0) {
    await fetchTaggedSuggestions()
  }
})

async function fetchTaggedSuggestions () {
  if (mainState.centerLoaderDisplay) return
  mainState.centerLoaderDisplay = true
  const taggedSuggestions = await mainState.atp.fetchTaggedSuggestions()
  if (taggedSuggestions instanceof Error) {
    mainState.centerLoaderDisplay = false
    mainState.openErrorPopup(taggedSuggestions, "TaggedSuggestionsView/fetchTaggedSuggestions")
    return
  }
  mainState.currentTaggedSuggestions = taggedSuggestions
  mainState.centerLoaderDisplay = false
}

async function onIntersected (did: string) {
  if (mainState.currentTaggedProfiles[did] !== undefined) return
  const profile = await mainState.atp.fetchProfile(did)
  if (profile instanceof Error) {
    mainState.currentTaggedProfiles[did] = null
    return
  }
  mainState.currentTaggedProfiles[did] = profile
}
</script>

<template>
  <div class="tagged-suggestions-view">
    <div class="tagged-suggestions-view__main">
      <div class="textlabel">
        <div class="textlabel__text">
          <SVGIcon name="fire" />{{ $t("taggedSuggestions") }}
        </div>
      </div>

      <!-- タグコンテナ -->
      <div
        v-for="taggedSuggestion of mainState.currentTaggedSuggestions"
        :key="taggedSuggestion.tag"
        class="tagged-suggestions-view__tag-container"
      >
        <!-- タグ名 -->
        <div class="tagged-suggestions-view__tag-name">{{ taggedSuggestion.tag }}</div>

        <!-- ユーザーコンテナ -->
        <div class="tagged-suggestions-view__user-container">
          <!-- ユーザー -->
          <div
            v-for="did of taggedSuggestion.users"
            :key="did"
            class="tagged-suggestions-view__user"
            v-intersection-observer="{
              handler: () => { onIntersected(did) },
              options: {
                threshold: 0.5,
              },
            }"
          >
            <!-- プロフィール読込失敗アイコン -->
            <SVGIcon
              v-if="mainState.currentTaggedProfiles[did] === null"
              name="alert"
            />

            <!-- プロフィールリンク -->
            <RouterLink
              v-else-if="mainState.currentTaggedProfiles[did] != null"
              :to="{ path: '/profile/feeds', query: { account: did } }"
              class="tagged-suggestions-view__user__link"
              :style="{ 'background-image': `url(${mainState.currentTaggedProfiles[did]?.avatar})` }"
            >
              <!-- ユーザー名 -->
              <div class="tagged-suggestions-view__user__link__name">{{ mainState.currentTaggedProfiles[did]?.displayName || mainState.currentTaggedProfiles[did]?.handle }}</div>
            </RouterLink>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<style lang="scss" scoped>
.tagged-suggestions-view {
  &__main {
    display: flex;
    flex-direction: column;
    flex-grow: 1;
    grid-gap: 1rem;
    padding: 1rem;
  }

  // タグコンテナ
  &__tag-container {
    display: grid;
    grid-gap: 0.5rem;
  }

  // タグ名
  &__tag-name {
    font-size: 1.25rem;
    font-weight: bold;
    text-transform: capitalize;
  }

  // ユーザーコンテナ
  &__user-container {
    display: flex;
    grid-gap: 0.5rem;
    overflow-x: auto;
    overflow-y: hidden;
    @include scroll-bar("transparent");
  }

  // ユーザー
  &__user {
    background-color: var(--fg-color-0125);
    border-radius: var(--border-radius-middle);
    display: flex;
    align-items: center;
    justify-content: center;
    overflow: hidden;
    position: relative;
    width: 7rem;
    min-width: 7rem;
    max-width: 7rem;
    height: 9rem;
    &:hover &__link {
      background-position-y: -1rem;
    }

    // プロフィール読込失敗アイコン
    .svg-icon--alert {
      fill: var(--fg-color-025);
      font-size: 2rem;
    }

    // プロフィールリンク
    &__link {
      background-position: center center;
      background-repeat: no-repeat;
      background-size: cover;
      display: flex;
      align-items: flex-end;
      flex-grow: 1;
      overflow: hidden;
      height: 100%;
      transition: background-position-y 250ms ease-out;

      // ユーザー名
      &__name {
        background-color: rgb(255, 0, 0);
        color: white;
        font-size: 0.75rem;
        font-weight: bold;
        line-height: 1.25;
        overflow: hidden;
        padding: 0.25rem 0.5rem;
        pointer-events: none;
        text-overflow: ellipsis;
        white-space: nowrap;
        width: 100%;
      }
    }
  }
}
</style>
