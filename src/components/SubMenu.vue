<script lang="ts" setup>
import { inject } from "vue"
import CopyRight from "@/components/Copyright.vue"
import Logo from "@/components/Logo.vue"
import SVGIcon from "@/components/SVGIcon.vue"

const mainState = inject("state") as MainState
</script>

<template>
  <div class="sub-menu">
    <Logo />
    <RouterLink
      v-if="mainState.numberOfAvailableInviteCodes > 0"
      class="textlink--icon invite-code"
      to="/settings/bluesky"
    >
      <SVGIcon name="inviteCode" />
      <span>{{ mainState.numberOfAvailableInviteCodes }} {{ $t("inviteCodes") }}</span>
    </RouterLink>
    <CopyRight />
  </div>
</template>

<style lang="scss" scoped>
.sub-menu {
  display: flex;
  flex-direction: column;
  padding: 3rem 1rem;
  position: relative;
}

.logo {
  font-size: 2rem;
  margin-bottom: 3rem;
}

.invite-code {
  display: flex;
  justify-content: center;
  font-size: 0.875rem;
  margin-bottom: 2rem;

  & > span {
    text-transform: lowercase;
  }
}

.copyright {
  font-size: 0.875rem;
}
</style>
