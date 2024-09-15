<script lang="ts" setup>
// SEE: https://pictogrammers.com/library/mdi/
import alert from "@/svg/alert.svg?raw"
import alphaA from "@/svg/alpha-a.svg?raw"
import arrowBottom from "@/svg/arrow-bottom.svg?raw"
import arrowDown from "@/svg/arrow-down.svg?raw"
import arrowLeft from "@/svg/arrow-left.svg?raw"
import arrowRight from "@/svg/arrow-right.svg?raw"
import arrowTop from "@/svg/arrow-top.svg?raw"
import arrowUp from "@/svg/arrow-up.svg?raw"
import at from "@/svg/at.svg?raw"
import bell from "@/svg/bell.svg?raw"
import bluesky from "@/svg/bluesky.svg?raw"
import bookmark from "@/svg/bookmark.svg?raw"
import bookmarkOff from "@/svg/bookmark-off.svg?raw"
import bookmarkOutline from "@/svg/bookmark-outline.svg?raw"
import cards from "@/svg/cards.svg?raw"
import chat from "@/svg/chat.svg?raw"
import chatPlus from "@/svg/chat-plus.svg?raw"
import check from "@/svg/check.svg?raw"
import checkboxOff from "@/svg/checkbox-off.svg?raw"
import checkboxOn from "@/svg/checkbox-on.svg?raw"
import clipboard from "@/svg/clipboard.svg?raw"
import clock from "@/svg/clock.svg?raw"
import contentFiltering from "@/svg/content-filtering.svg?raw"
import cross from "@/svg/cross.svg?raw"
import cursorBottom from "@/svg/cursor-bottom.svg?raw"
import cursorDown from "@/svg/cursor-down.svg?raw"
import cursorFirst from "@/svg/cursor-first.svg?raw"
import cursorLast from "@/svg/cursor-last.svg?raw"
import cursorLeft from "@/svg/cursor-left.svg?raw"
import cursorRight from "@/svg/cursor-right.svg?raw"
import cursorTop from "@/svg/cursor-top.svg?raw"
import cursorUp from "@/svg/cursor-up.svg?raw"
import database from "@/svg/database.svg?raw"
import drag from "@/svg/drag.svg?raw"
import earth from "@/svg/earth.svg?raw"
import earthOff from "@/svg/earth-off.svg?raw"
import edit from "@/svg/edit.svg?raw"
import email from "@/svg/email.svg?raw"
import feed from "@/svg/feed.svg?raw"
import fileExport from "@/svg/file-export.svg?raw"
import fileImport from "@/svg/file-import.svg?raw"
import fire from "@/svg/fire.svg?raw"
import hash from "@/svg/hash.svg?raw"
import help from "@/svg/help.svg?raw"
import history from "@/svg/history.svg?raw"
import home from "@/svg/home.svg?raw"
import image from "@/svg/image.svg?raw"
import inviteCode from "@/svg/invite-code.svg?raw"
import json from "@/svg/json.svg?raw"
import label from "@/svg/label.svg?raw"
import labelOff from "@/svg/label-off.svg?raw"
import labeler from "@/svg/labeler.svg?raw"
import labelerOff from "@/svg/labeler-off.svg?raw"
import lightning from "@/svg/lightning.svg?raw"
import like from "@/svg/like.svg?raw"
import likeHalf from "@/svg/like-half.svg?raw"
import likeOutline from "@/svg/like-outline.svg?raw"
import link from "@/svg/link.svg?raw"
import list from "@/svg/list.svg?raw"
import lock from "@/svg/lock.svg?raw"
import mail from "@/svg/mail.svg?raw"
import menu from "@/svg/menu.svg?raw"
import minus from "@/svg/minus.svg?raw"
import offImage from "@/svg/off-image.svg?raw"
import openInApp from "@/svg/open-in-app.svg?raw"
import openInNew from "@/svg/open-in-new.svg?raw"
import palette from "@/svg/palette.svg?raw"
import pause from "@/svg/pause.svg?raw"
import people from "@/svg/people.svg?raw"
import person from "@/svg/person.svg?raw"
import personHeart from "@/svg/person-heart.svg?raw"
import personOff from "@/svg/person-off.svg?raw"
import pin from "@/svg/pin.svg?raw"
import pinOffOutline from "@/svg/pin-off-outline.svg?raw"
import pinOutline from "@/svg/pin-outline.svg?raw"
import play from "@/svg/play.svg?raw"
import plus from "@/svg/plus.svg?raw"
import point from "@/svg/point.svg?raw"
import post from "@/svg/post.svg?raw"
import posts from "@/svg/comment-multiple.svg?raw"
import question from "@/svg/question.svg?raw"
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
import share from "@/svg/share.svg?raw"
import shimmer from "@/svg/shimmer.svg?raw"
import sort from "@/svg/sort.svg?raw"
import star from "@/svg/star.svg?raw"
import translate from "@/svg/translate.svg?raw"
import unlock from "@/svg/unlock.svg?raw"
import volumeOff from "@/svg/volume-off.svg?raw"
import volumeOn from "@/svg/volume-on.svg?raw"
import wallpaper from "@/svg/wallpaper.svg?raw"
import wordMute from "@/svg/word-mute.svg?raw"

const icons: { [k: string]: string } = {
  alert,
  alphaA,
  arrowBottom,
  arrowDown,
  arrowLeft,
  arrowRight,
  arrowTop,
  arrowUp,
  at,
  bell,
  bluesky,
  bookmark,
  bookmarkOff,
  bookmarkOutline,
  cards,
  chat,
  chatPlus,
  check,
  checkboxOff,
  checkboxOn,
  clipboard,
  clock,
  contentFiltering,
  cross,
  cursorBottom,
  cursorDown,
  cursorFirst,
  cursorLast,
  cursorLeft,
  cursorRight,
  cursorTop,
  cursorUp,
  database,
  drag,
  earth,
  earthOff,
  edit,
  email,
  feed,
  fileExport,
  fileImport,
  fire,
  hash,
  help,
  history,
  home,
  image,
  inviteCode,
  json,
  label,
  labelOff,
  labeler,
  labelerOff,
  lightning,
  like,
  likeHalf,
  likeOutline,
  link,
  list,
  lock,
  mail,
  menu,
  minus,
  offImage,
  openInApp,
  openInNew,
  palette,
  pause,
  people,
  person,
  personHeart,
  personOff,
  pin,
  pinOffOutline,
  pinOutline,
  play,
  plus,
  point,
  post,
  posts,
  question,
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
  share,
  shimmer,
  sort,
  star,
  translate,
  unlock,
  volumeOff,
  volumeOn,
  wallpaper,
  wordMute,
}

defineProps<{
  name: string
  reverseH?: boolean
}>()
</script>

<template>
  <div
    v-html="icons[name]"
    class="svg-icon"
    :class="`svg-icon--${name}`"
    :data-reverse-h="reverseH"
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
  &[data-reverse-h="true"] {
    transform: scaleX(-1.0);
  }

  &:deep(svg) {
    height: 100%;
  }
}
</style>
