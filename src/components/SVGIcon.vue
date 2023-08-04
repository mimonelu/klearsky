<script lang="ts" setup>
// SEE: https://pictogrammers.com/library/mdi/
import alert from "@/svg/alert.svg?raw"
import alphabeticalOff from "@/svg/alphabetical-off.svg?raw"
import arrowLeft from "@/svg/arrow-left.svg?raw"
import at from "@/svg/at.svg?raw"
import bell from "@/svg/bell.svg?raw"
import bookmark from "@/svg/bookmark.svg?raw"
import bookmarkOff from "@/svg/bookmark-off.svg?raw"
import bookmarkOutline from "@/svg/bookmark-outline.svg?raw"
import check from "@/svg/check.svg?raw"
import checkboxOff from "@/svg/checkbox-off.svg?raw"
import checkboxOn from "@/svg/checkbox-on.svg?raw"
import clipboard from "@/svg/clipboard.svg?raw"
import clock from "@/svg/clock.svg?raw"
import cross from "@/svg/cross.svg?raw"
import cursorDown from "@/svg/cursor-down.svg?raw"
import cursorLeft from "@/svg/cursor-left.svg?raw"
import cursorRight from "@/svg/cursor-right.svg?raw"
import cursorUp from "@/svg/cursor-up.svg?raw"
import edit from "@/svg/edit.svg?raw"
import email from "@/svg/email.svg?raw"
import feed from "@/svg/feed.svg?raw"
import fileExport from "@/svg/file-export.svg?raw"
import fileImport from "@/svg/file-import.svg?raw"
import fire from "@/svg/fire.svg?raw"
import heart from "@/svg/heart.svg?raw"
import heartBroken from "@/svg/heart-broken.svg?raw"
import help from "@/svg/help.svg?raw"
import history from "@/svg/history.svg?raw"
import home from "@/svg/home.svg?raw"
import identifier from "@/svg/identifier.svg?raw"
import image from "@/svg/image.svg?raw"
import inviteCode from "@/svg/invite-code.svg?raw"
import json from "@/svg/json.svg?raw"
import lightning from "@/svg/lightning.svg?raw"
import lock from "@/svg/lock.svg?raw"
import mail from "@/svg/mail.svg?raw"
import menu from "@/svg/menu.svg?raw"
import offImage from "@/svg/off-image.svg?raw"
import openInApp from "@/svg/open-in-app.svg?raw"
import openInNew from "@/svg/open-in-new.svg?raw"
import pause from "@/svg/pause.svg?raw"
import people from "@/svg/people.svg?raw"
import person from "@/svg/person.svg?raw"
import personOff from "@/svg/person-off.svg?raw"
import pin from "@/svg/pin.svg?raw"
import pinOffOutline from "@/svg/pin-off-outline.svg?raw"
import pinOutline from "@/svg/pin-outline.svg?raw"
import play from "@/svg/play.svg?raw"
import plus from "@/svg/plus.svg?raw"
import post from "@/svg/post.svg?raw"
import quoteRepost from "@/svg/quote-repost.svg?raw"
import radioOff from "@/svg/radio-off.svg?raw"
import radioOn from "@/svg/radio-on.svg?raw"
import refresh from "@/svg/refresh.svg?raw"
import remove from "@/svg/remove.svg?raw"
import reply from "@/svg/reply.svg?raw"
import repost from "@/svg/repost.svg?raw"
import search from "@/svg/search.svg?raw"
import sendPost from "@/svg/send-post.svg?raw"
import setting from "@/svg/setting.svg?raw"
import shimmer from "@/svg/shimmer.svg?raw"
import translate from "@/svg/translate.svg?raw"
import volumeOff from "@/svg/volume-off.svg?raw"
import volumeOn from "@/svg/volume-on.svg?raw"
import wallpaper from "@/svg/wallpaper.svg?raw"

const icons: { [k: string]: string } = {
  alert,
  alphabeticalOff,
  arrowLeft,
  at,
  bell,
  bookmark,
  bookmarkOff,
  bookmarkOutline,
  check,
  checkboxOff,
  checkboxOn,
  clipboard,
  clock,
  cross,
  cursorDown,
  cursorLeft,
  cursorRight,
  cursorUp,
  edit,
  email,
  feed,
  fileExport,
  fileImport,
  fire,
  heart,
  heartBroken,
  help,
  history,
  home,
  identifier,
  image,
  inviteCode,
  json,
  lightning,
  lock,
  mail,
  menu,
  offImage,
  openInApp,
  openInNew,
  pause,
  people,
  person,
  personOff,
  pin,
  pinOffOutline,
  pinOutline,
  play,
  plus,
  post,
  quoteRepost,
  radioOff,
  radioOn,
  refresh,
  remove,
  reply,
  repost,
  search,
  sendPost,
  setting,
  shimmer,
  translate,
  volumeOff,
  volumeOn,
  wallpaper,
}

defineProps<{
  name: string
}>()
</script>

<template>
  <div
    v-html="icons[name]"
    class="svg-icon"
    :class="`svg-icon--${name}`"
  />
</template>

<style lang="scss" scoped>
.svg-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  position: relative;
  min-width: 1em;
  max-width: 1em;
  height: 1em;

  &:deep(svg) {
    height: 100%;
  }
}
</style>
