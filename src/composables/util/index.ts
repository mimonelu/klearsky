import blurElement from "@/composables/util/blur-element"
import cache from "@/composables/util/cache"
import cipher from "@/composables/util/cipher"
import sanitizePostsOrFeeds from "@/composables/util/sanitize-posts-or-feeds"
import createEmbed from "@/composables/util/create-embed"
import displayJson from "@/composables/util/display-json"
import downloadBlob from "@/composables/util/download-blob"
import downloadImage from "@/composables/util/download-image"
import fetchWithTimeout from "@/composables/util/fetch-with-timeout"
import getGraphemeLength from "@/composables/util/get-grapheme-length"
import getRkey from "@/composables/util/get-rkey"
import getUserLanguage from "@/composables/util/get-user-language"
import injectFoldingToFeeds from "@/composables/util/inject-folding-to-feeds"
import makeCustomLinks from "@/composables/util/make-custom-links"
import makeLightningLinks from "@/composables/util/make-lightning-links"
import mergeFeeds from "@/composables/util/merge-feeds"
import parseOgp from "@/composables/util/parse-ogp"
import safeJson from "@/composables/util/safe-json"
import safeUrl from "@/composables/util/safe-url"
import setArray from "@/composables/util/set-array"
import sortFeeds from "@/composables/util/sort-feeds"
import storage from "@/composables/util/storage"
import sanitizePreferences from "@/composables/util/sanitize-preferences"
import SubscribeRepos from "@/composables/util/subscribe-repos"
// import translateInDeepL from "@/composables/util/translate-in-deep-l" // DeepL: 未使用
import translateInExternalService from "@/composables/util/translate-in-external-service"
import translateInMyMemory from "@/composables/util/translate-in-my-memory"
import traverseJson from "@/composables/util/traverse-json"
import unicodeSubstring from "@/composables/util/unicode-substring"
import updatePostProps from "@/composables/util/update-post-props"
import uri from "@/composables/util/uri"
import wait from "@/composables/util/wait"
import waitProp from "@/composables/util/wait-prop"

export default {
  blurElement,
  cache,
  ...cipher,
  sanitizePostsOrFeeds,
  createEmbed,
  displayJson,
  downloadBlob,
  downloadImage,
  fetchWithTimeout,
  getGraphemeLength,
  getRkey,
  getUserLanguage,
  injectFoldingToFeeds,
  makeCustomLinks,
  makeLightningLinks,
  mergeFeeds,
  parseOgp,
  ...safeJson,
  safeUrl,
  setArray,
  sortFeeds,
  ...storage,
  sanitizePreferences,
  SubscribeRepos,
  // translateInDeepL, // DeepL: 未使用
  translateInExternalService,
  translateInMyMemory,
  traverseJson,
  unicodeSubstring,
  updatePostProps,
  ...uri,
  wait,
  waitProp,
}
