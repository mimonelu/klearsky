<script lang="ts" setup>
import { inject } from "vue"
import FeedList from "@/components/FeedList.vue"
import PageHeader from "@/components/PageHeader.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <PageHeader
    :title="$t('home')"
    :subTitle="mainState.atp.session?.__service ?? ''"
  />
  <FeedList
    type="timeline"
    :feeds="mainState.timelineFeeds"
    :hasLoadButton="true"
  />
</template>
