<script lang="ts" setup>
import { inject, onMounted, ref, watch } from "vue"
import { useRouter } from "vue-router"
import LazyImage from "@/components/images/LazyImage.vue"
import PageHeader from "@/components/shells/PageHeader.vue"
import PageHeaderButtons from "@/components/shells/PageHeaderButtons.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

const mainState = inject("state") as MainState

// SliderMenu の自動スクロール

const router = useRouter()

const sliderMenu = ref(null)

onMounted(async () => {
  // 画面遷移時
  await Util.wait(125)
  await autoScrollSliderMenu()
})

watch(() => router.currentRoute.value.fullPath, async () => {
  // HomeView 内における画面遷移時
  await Util.wait(125)
  await autoScrollSliderMenu()
})

async function autoScrollSliderMenu () {
  const sliderMenuElement = sliderMenu.value as null | HTMLElement
  if (sliderMenuElement == null) {
    return
  }
  const selectedElement = sliderMenuElement.querySelector(".router-link-active[data-is-selected='true']")
  if (selectedElement == null) {
    return
  }
  selectedElement.scrollIntoView({
    behavior: "smooth",
    block: "nearest",
    inline: "center",
  })
}
</script>

<template>
  <div class="home-view">
    <Portal to="router-view-wrapper-header">
      <PageHeader
        :hasBackButton="true"
        :title="$t('home')"
      >
        <template #right>
          <PortalTarget name="home-view-header-top" />
          <PageHeaderButtons />
        </template>
      </PageHeader>

      <!-- スライダーメニュー -->
      <div
        class="slider-menu"
        ref="sliderMenu"
      >
        <template
          v-for="item of mainState.myFeeds!.pinnedItems"
          :key="item.value.uri"
        >
          <!-- フォロー中フィード -->
          <RouterLink
            v-if="item.kind === 'following'"
            class="slider-menu__link"
            to="/home/timeline"
            :data-is-selected="true"
          >
            <SVGIcon name="shimmer" />
            <span>{{ $t(item.value.displayName) }}</span>
          </RouterLink>

          <!-- グローバルフィード -->
          <RouterLink
            v-else-if="item.kind === 'space.aoisora.preference.feed.extra'"
            class="slider-menu__link"
            to="/home/globalline"
            :data-is-selected="true"
          >
            <SVGIcon name="shimmer" />
            <span>{{ $t(item.value.displayName) }}</span>
          </RouterLink>

          <!-- カスタムフィード -->
          <RouterLink
            v-else-if="item.kind === 'feed' && !!item.value.cid"
            class="slider-menu__link"
            :to="{
              path: '/home/feeds',
              query: {
                feed: item.value.uri,
                displayName: item.value.displayName,
              },
            }"
            :data-is-selected="mainState.currentQuery.feed === item.value.uri"
          >
            <LazyImage :src="item.value.avatar" />
            <span>{{ item.value.displayName }}</span>
          </RouterLink>

          <!-- リストフィード -->
          <RouterLink
            v-else-if="item.kind === 'list' && !!item.value.cid"
            class="slider-menu__link"
            :to="{
              path: '/home/list-feeds',
              query: {
                list: item.value.uri,
                displayName: item.value.name,
              },
            }"
            :data-is-selected="mainState.currentQuery.list === item.value.uri"
          >
            <LazyImage :src="item.value.avatar" />
            <span>{{ item.value.name }}</span>
          </RouterLink>
        </template>
      </div>

      <PortalTarget name="home-view-header-bottom" />
    </Portal>
    <RouterView />
  </div>
</template>

<style lang="scss" scoped>
.home-view {
  display: flex;
  flex-direction: column;
  flex-grow: 1;
}

.page-header {
  border-bottom-color: transparent;
}
</style>
