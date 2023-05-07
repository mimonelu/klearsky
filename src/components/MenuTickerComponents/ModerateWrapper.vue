<script lang="ts" setup>
import { reactive } from "vue"
import MenuTicker from "@/components/MenuTicker.vue"
import MenuTickerToggleBlock from "@/components/MenuTickerComponents/ToggleBlock.vue"
import MenuTickerToggleMute from "@/components/MenuTickerComponents/ToggleMute.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const emit = defineEmits<{(event: string): void}>()

defineProps<{
  isUser?: boolean;
  user?: TTUser;
}>()

const state = reactive<{
  display: boolean;
}>({
  display: false,
})
</script>

<template>
  <button
    class="menu-ticker__sub-trigger"
    @click.stop
    @mouseenter="state.display = true"
    @mouseleave="state.display = false"
  >
    <SVGIcon name="cursorLeft" />
    <span>{{ $t("moderate") }}</span>

    <!-- モデレーションメニュー -->
    <MenuTicker
      :display="state.display"
      class="menu-ticker__sub"
    >
      <!-- ミュートのトグル -->
      <MenuTickerToggleMute
        v-if="!isUser"
        :user="user"
        @close="emit('close')"
      />

      <!-- ブロックのトグル -->
      <MenuTickerToggleBlock
        v-if="!isUser"
        :user="user"
        @close="emit('close')"
      />
    </MenuTicker>
  </button>
</template>
