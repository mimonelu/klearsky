<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, reactive, ref, watch, type ComputedRef, type Ref, toRaw } from "vue"
import { format } from "date-fns/format"
import EasyForm from "@/components/forms/EasyForm.vue"
import LabelButton from "@/components/buttons/LabelButton.vue"
import LinkCard from "@/components/cards/LinkCard.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"
import * as tf from "@tensorflow/tfjs"
import * as toxicity from "@tensorflow-models/toxicity"

const modelConfig = ref<any>(null);

const emit = defineEmits<{(event: string, done: boolean, hidden: boolean): void}>()

const props = defineProps<{
  type: TTPostType
  post?: TTPost
  text?: string
  url?: string
  fileList?: FileList
}>()

const $t = inject("$t") as Function
const mainState = inject("state") as MainState

// --- MODERATION STATE ---
const moderationMode = ref<'SAFE' | 'REWRITE' | 'INFO' | null>(null);

// Store the fetched contextual info here (for INFO mode)
const contextualInfo = ref(""); 
const isFetchingInfo = ref(false);

// --- LIVE REWRITE STATE ---
const liveRewriteSuggestion = ref("");
const isFetchingLiveRewrite = ref(false);
let rewriteDebounceTimer: any = null;

// =========================================================
// ===       API HELPERS                                 ===
// =========================================================

async function apiCall(endpoint: string, body: any) {
  const response = await fetch(`http://localhost:8000/${endpoint}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!response.ok) throw new Error(`API Error: ${response.statusText}`);
  return await response.json();
}

// Helper to fetch rewrite logic (used by watchers)
async function fetchLiveRewrite(textToRewrite: string) {
  if (!textToRewrite.trim()) return;
  
  isFetchingLiveRewrite.value = true;
  try {
    const data = await apiCall("nonToxicRewriting", { text: textToRewrite });
    liveRewriteSuggestion.value = data.rewritten_text;
  } catch(e) {
    console.error("Live rewrite failed", e);
  } finally {
    isFetchingLiveRewrite.value = false;
  }
}

// =========================================================
// ===       INFO MODE                                   ===
// =========================================================

async function activateInfoMode() {
  moderationMode.value = 'INFO';
  if (props.type === 'reply' && props.post) {
    const parentText = props.post?.reply?.parent?.record?.text ?? props.post?.record?.text ?? "";
    if (!parentText.trim()) return;

    isFetchingInfo.value = true;
    contextualInfo.value = ""; 

    try {
      const data = await apiCall("infoMessage", { text: parentText, context: "Social Media Reply Context" });
      contextualInfo.value = data.contextual_info;
    } catch (err) {
      console.error("Failed to fetch info:", err);
      contextualInfo.value = "Could not fetch context info at this time.";
    } finally {
      isFetchingInfo.value = false;
    }
  }
}

// =========================================================
// ===       STRICT SUBMIT INTERCEPTOR                   ===
// =========================================================

async function interceptSubmit() {
  Util.blurElement()

  // 1. Validation
  if (easyFormState.text.trim() === "" && easyFormState.medias.length === 0 && easyFormState.url.trim() === "") {
    const result = await mainState.openConfirmationPopup({
      title: $t("emptyPostConfirmation"),
      text: $t("emptyPostConfirmationMessage"),
    })
    if (!result) return;
  }

  if (mainState.sendPostPopupProcessing) return;

  // 2. CHECK IF MODERATION IS ACTIVE
  if (moderationMode.value === null || moderationMode.value === 'INFO') {
    await executeActualSubmit();
    return;
  }

  // 3. START BLOCKING (For Safe/Rewrite modes only)
  mainState.sendPostPopupProcessing = true; 

  try {
    const textToCheck = easyFormState.text;

    // --- CASE A: SAFE SUBMIT MODE ---
    if (moderationMode.value === 'SAFE') {
      const data = await apiCall("toxicityHateSpeechPrediction", { text: textToCheck });
      const isToxic = data.predictions.some((p: any) => 
        p.score > 0.50 && 
        ['toxicity', 'severe_toxicity', 'hate_speech', 'threat', 'insult'].includes(p.label)
      );

      if (isToxic) {
        mainState.sendPostPopupProcessing = false; 
        const confirm = await mainState.openConfirmationPopup({
          title: "⚠️ Toxicity Detected",
          text: "This post has been flagged by our safety system.\n\nAre you sure you want to publish it?",
        });
        if (!confirm) return;
        mainState.sendPostPopupProcessing = true;
      }
    }

    // --- CASE B: REWRITE MODE (Submit Interception) ---
    // If the user ignores the live suggestion and clicks submit, we force a check
    else if (moderationMode.value === 'REWRITE') {
      const data = await apiCall("nonToxicRewriting", { text: textToCheck });
      const rewrite = data.rewritten_text;
      
      mainState.sendPostPopupProcessing = false;

      const useRewrite = await mainState.openConfirmationPopup({
        title: "✨ Non-Toxic Rewrite",
        text: `We have rewritten your text to be more constructive:\n\n"${rewrite}"\n\nClick OK to use this version, or Cancel to keep yours.`
      });

      if (useRewrite) {
        easyFormState.text = rewrite; 
        mainState.sendPostPopupProcessing = true;
      } else {
        const confirmOriginal = await mainState.openConfirmationPopup({
          title: "Post Original?",
          text: "Do you want to proceed with the original text?"
        });
        if (!confirmOriginal) return;
        mainState.sendPostPopupProcessing = true; 
      }
    }

    await executeActualSubmit();

  } catch (err) {
    console.error("Moderation Server Error:", err);
    mainState.sendPostPopupProcessing = false;
    const forceSubmit = await mainState.openConfirmationPopup({
      title: "Moderation Error",
      text: "We could not verify the safety of this post (Server Error). Do you want to try posting anyway?"
    });
    if (forceSubmit) {
      await executeActualSubmit();
    }
  }
}

async function executeActualSubmit() {
  const videoSizes = (easyForm.value?.getVideoSizes() ?? [[]])[0]
  easyFormState.medias.forEach((media, index) => {
    (media as any)._videoAspectRatio = videoSizes[index]
  })

  close()
  mainState.sendPostPopupProcessing = true 

  try {
    const result = await mainState.atp.createPost({
      ...easyFormState,
      type: props.type,
      post: props.post,
      createdAt: state.postDatePopupDate,
      languages: mainState.currentSetting.postLanguages,
      labels: state.labels,
      lightning: mainState.currentSetting.lightning,
      listMentionDids: mainState.listMentionPopupProps.dids,
    })
    
    if (result instanceof Error) {
      mainState.openSendPostPopup()
      mainState.openErrorPopup($t(result.message), "SendPostPopup/submitCallback")
    } else {
      if (!state.draftReactionControl.postgateAllow) {
        await mainState.atp.updatePostgate(result.uri, state.draftReactionControl.postgateAllow)
      }
      if (state.draftReactionControl.threadgateAction !== "none") {
        await mainState.atp.updateThreadgate(
          result.uri,
          state.draftReactionControl.allowMention,
          state.draftReactionControl.allowFollower,
          state.draftReactionControl.allowFollowing,
          state.draftReactionControl.listUris
        )
      }
      mainState.fetchTimeline("new")
      emit("closeSendPostPopup", true, false)
    }
  } finally {
    mainState.sendPostPopupProcessing = false
  }
}

// =========================================================
// ===       COMPONENT LOGIC                             ===
// =========================================================

const state = reactive<{
  labels: Array<string>
  draftReactionControl: TTDraftReactionControl
  isDraftReactionControlOn: ComputedRef<boolean>
  postDatePopupDate: ComputedRef<undefined | string>
  hiddenFeaturesDisplay: boolean
  videoLimits?: TIVideoLimits
}>({
  labels: [],
  draftReactionControl: {
    postgateAllow: true,
    threadgateAction: "none",
    allowMention: false,
    allowFollower: false,
    allowFollowing: false,
    listUris: [],
  },
  isDraftReactionControlOn: computed((): boolean => {
    return (
      !state.draftReactionControl.postgateAllow ||
      state.draftReactionControl.threadgateAction !== "none"
    )
  }),
  postDatePopupDate: computed((): undefined | string => {
    if (mainState.postDatePopupDate == null) return
    const date = new Date(mainState.postDatePopupDate)
    if (Number.isNaN(date.getTime())) return
    return format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
  }),
  hiddenFeaturesDisplay: false,
  videoLimits: undefined,
})

const easyFormState = reactive<{
  text: string
  url: string
  urlHasImage: Array<boolean>
  medias: Array<File>
  shouldConvertGifToVideo: Array<boolean>
  alts: Array<string>
}>({
  text: props.text ?? "",
  url: props.url ?? "",
  urlHasImage: [true],
  medias: [],
  shouldConvertGifToVideo: [true],
  alts: [],
})

// --- CLIENT-SIDE TOXICITY ---
const toxicityScore = ref(0) 
const modelThreshold = 0.75 
let toxicityModel: toxicity.ToxicityClassifier | null = null

onMounted(async () => {
  try {
    toxicityModel = await toxicity.load(modelThreshold)
  } catch (err) {
    console.warn("Toxicity model failed to load:", err)
  }

  if (props.fileList != null) {
    easyFormState.medias = Array.from(props.fileList)
  }
  onInputUrl()
  onChangeImage()

  const videoLimits = await mainState.atp.fetchVideoLimits()
  if (videoLimits instanceof Error) {
    state.videoLimits = undefined
  } else {
    state.videoLimits = videoLimits
  }
})

function getTextarea (): null | HTMLTextAreaElement {
  return document.querySelector("#easy-form--default__0 textarea") as HTMLTextAreaElement | null;
}

watch(toxicityScore, (score) => {
  const textarea = getTextarea();
  if (textarea) {
    // We still change the text color as a subtle indicator
    textarea.style.color = `hsl(${(1 - score) * 120}, 100%, 30%)`;
  }
});

// --- WATCHER 1: When Mode Changes ---
watch(moderationMode, (newMode) => {
  if (newMode === 'REWRITE' && easyFormState.text.trim()) {
    fetchLiveRewrite(easyFormState.text);
  }
  // Clear suggestions if we switch out of rewrite mode
  if (newMode !== 'REWRITE') {
    liveRewriteSuggestion.value = "";
  }
})

// --- WATCHER 2: When Text Changes ---
watch(
  () => easyFormState.text,
  async (newText) => {
    // 1. Reset states if empty
    if (!toxicityModel || !newText.trim()) {
      toxicityScore.value = 0
      liveRewriteSuggestion.value = ""
      return
    }

    // 2. Local Toxicity Classification
    const predictions = await toxicityModel.classify(newText)
    const toxicityPred = predictions.find(pred => pred.label === "toxicity")
    const currentScore = toxicityPred ? toxicityPred.results[0].probabilities[1] : 0
    toxicityScore.value = currentScore

    // 3. Live Rewrite Logic
    clearTimeout(rewriteDebounceTimer); 

    // FIXED: Only trigger if the user has EXPLICITLY selected 'REWRITE' mode.
    // We no longer trigger based on toxicity score automatically.
    if (moderationMode.value === 'REWRITE') {
      rewriteDebounceTimer = setTimeout(() => {
        fetchLiveRewrite(newText);
      }, 1000); 
    } else {
      liveRewriteSuggestion.value = "";
    }
  }
)

const easyFormProps: TTEasyForm = {
  hasSubmitButton: true,
  submitButtonLabel: $t("submit"),
  submitCallback: interceptSubmit,
  blurOnSubmit: true,
  data: [
    {
      state: easyFormState,
      model: "text",
      type: "textarea",
      placeholder: "Enter text...",
      classes: "toxicity-textarea",
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      rows: 6,
      hasMentionSuggestion: true,
      focus: true,
      autoResizeTextarea: true,
      onBlur: onBlurOrInputText,
      onInput: onBlurOrInputText,
    },
    {
      state: easyFormState,
      model: "url",
      type: "text",
      parentClasses: "group-parts",
      placeholder: $t("LinkCardPlaceHolder"),
      autocomplete: "url",
      inputmode: "url",
      onInput: onInputUrl,
    },
    {
      state: easyFormState,
      model: "urlHasImage",
      type: "checkbox",
      options: [{ label: $t("urlHasImage"), value: true }],
      display: false,
    },
    {
      state: easyFormState,
      model: "medias",
      type: "file",
      placeholder: $t("imageBoxes"),
      isMultipleFile: true,
      maxNumberOfFile: 4,
      quadLayout: true,
      onChange: onChangeImage,
    },
    {
      state: easyFormState,
      model: "shouldConvertGifToVideo",
      type: "checkbox",
      options: [{ label: $t("shouldConvertGifToVideo"), value: true }],
      display: false,
    },
  ],
}

const popup = ref()
const easyForm = ref()

watch(() => mainState.sendPostPopupProps.visibility, (value?: boolean) => {
  if (!value) return
  setTimeout(() => {
    if (props.text) easyFormState.text = `${props.text} ${easyFormState.text}`
    if (props.url) easyFormState.url = props.url
    PreviewLinkCardFeature.execute()
    popup.value?.scrollToTop()
    easyForm.value?.setFocus()
  }, 0)
})

watch(() => props.fileList, (value?: FileList) => {
  const files = value != null ? Array.from(value) : []
  files.unshift(...easyFormState.medias)
  easyFormState.medias = files
  onInputUrl()
  onChangeImage()
})

async function close () {
  moderationMode.value = null; 
  contextualInfo.value = ""; 
  liveRewriteSuggestion.value = "";
  emit("closeSendPostPopup", false, true)
}

async function reset () {
  const result = await mainState.openConfirmationPopup({
    title: $t("sendPostReset"),
    text: $t("sendPostResetMessage"),
  })
  if (!result) return
  emit("closeSendPostPopup", false, false)
  await nextTick()
  moderationMode.value = null; 
  contextualInfo.value = ""; 
  liveRewriteSuggestion.value = "";
  mainState.openSendPostPopup({
    type: "post",
    post: props.post,
  })
}

function onInputUrl () {
  PreviewLinkCardFeature.threshold()
  const urlHasImageItem = easyFormProps.data.find((item: TTEasyFormItem) => item.model === "urlHasImage")
  if (urlHasImageItem != null) {
    urlHasImageItem.display = !!easyFormState.url && easyFormState.medias.length === 0
  }
  const shouldConvertGifToVideoItem = easyFormProps.data.find((item: TTEasyFormItem) => item.model === "shouldConvertGifToVideo")
  if (shouldConvertGifToVideoItem != null) {
    shouldConvertGifToVideoItem.display = easyFormState.medias.some((media) => media.type === "image/gif")
  }
  easyForm.value?.forceUpdate()
}

function onClickClearButton () {
  Util.blurElement()
  easyFormState.url = ""
  onInputUrl()
}

function onChangeImage () {
  const urlItem = easyFormProps.data.find((item: TTEasyFormItem) => item.model === "url")
  if (urlItem == null) return
  urlItem.display = easyFormState.medias.length === 0

  easyFormState.alts.splice(easyFormState.medias.length)
  easyFormProps.data.splice(
    0,
    easyFormProps.data.length,
    ...easyFormProps.data.filter((data: TTEasyFormItem) => data.name !== "alt")
  )
  easyFormState.medias.forEach((_: File, index: number) => {
    if (easyFormState.alts[index] == null) easyFormState.alts[index] = ""
    easyFormProps.data.push({
      name: "alt",
      state: easyFormState.alts,
      model: index,
      type: "textarea",
      placeholder: `${$t('alts')} ${index + 1}`,
      maxlength: 5000,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      rows: 3,
      autoResizeTextarea: true,
    })
  })
  onInputUrl()
}

function openReactionControlPopup () {
  mainState.openReactionControlPopup({
    mode: "send",
    isReply: false,
    draftReactionControl: state.draftReactionControl,
    onClosed (params?: TICloseReactionControlPopupProps) {
      if (params == null) return
      state.draftReactionControl.postgateAllow = params.postgateAllow
      state.draftReactionControl.threadgateAction = params.threadgateAction
      switch (state.draftReactionControl.threadgateAction) {
        case "none": {
          state.draftReactionControl.allowMention = false
          state.draftReactionControl.allowFollower = false
          state.draftReactionControl.allowFollowing = false
          state.draftReactionControl.listUris.splice(0)
          break
        }
        case "custom": {
          state.draftReactionControl.allowMention = params.allowMention ?? false
          state.draftReactionControl.allowFollower = params.allowFollower ?? false
          state.draftReactionControl.allowFollowing = params.allowFollowing ?? false
          state.draftReactionControl.listUris.splice(0, state.draftReactionControl.listUris.length, ...(params.listUris ?? []))
          break
        }
      }
    },
  })
}

function openListMentionPopup () {
  mainState.openListMentionPopup()
}

let textareaSelectionStart = 0
mainState.myWordPopupCallback = (myWord: string) => {
  const textarea = getTextarea()
  if (textarea != null) {
    const before = easyFormState.text.substring(0, textareaSelectionStart)
    const after = easyFormState.text.substring(textareaSelectionStart)
    if (before !== "" && !before.match(/[\s\r\n]$/)) {
      myWord = " " + myWord
    }
    if (after !== "" && !after.match(/^[\s\r\n]/)) {
      myWord += " "
    }
    easyFormState.text = before + myWord + after
    textareaSelectionStart += myWord.length
  }
}

function onBlurOrInputText () {
  const textarea = getTextarea()
  if (textarea != null) {
    textareaSelectionStart = textarea.selectionStart
  }
}

function toggleHiddenFeatures () {
  state.hiddenFeaturesDisplay = !state.hiddenFeaturesDisplay
}

const PreviewLinkCardFeature: {
  timer?: any
  loading: Ref<boolean>
  external: TTExternal
  threshold: () => void
  execute: () => Promise<void>
} = {
  timer: undefined,
  loading: ref(false),
  external: reactive({
    uri: "",
    title: undefined,
    description: undefined,
    thumb: undefined,
  }),
  threshold () {
    if (this.timer != null) clearTimeout(this.timer)
    this.timer = setTimeout(() => {
      this.timer = undefined
      this.execute()
    }, 1000)
  },
  async execute () {
    if (this.external.uri === easyFormState.url) return
    if (!easyFormState.url.match(/https?:\/\/[\w!?/+\-_~;.,*&@#$%()'[\]]+/)) {
      this.external.uri = ""
      return
    }
    this.external.uri = easyFormState.url
    this.external.title = undefined
    this.external.description = undefined
    this.external.thumb = undefined
    this.loading.value = true
    const external = await Util.parseOgp(mainState.atp, easyFormState.url, false)
    this.loading.value = false
    if (external instanceof Error) {
      this.external.uri = ""
      return
    }
    this.external.uri = external.uri
    this.external.title = external.title
    this.external.description = external.description
    this.external.thumb = external.preview
  },
}
</script>

<template>
  <Popup
    :key="post?.uri || type + '-new'"
    class="send-post-popup"
    ref="popup"
    :hasCloseButton="true"
    :loaderDisplay="mainState.sendPostPopupProcessing"
    :data-type="type"
    @close="close"
  >
    <template #header>
      <button type="button" @click.stop="mainState.openHtmlPopup('post')">
        <SVGIcon name="help" />
      </button>

      <button type="button" class="reset-button" @click.stop="reset">
        <SVGIcon name="remove" />
      </button>

      <h2>
        <SVGIcon :name="type" />
        <span>{{ $t(type) }}</span>
      </h2>

      <div v-if="moderationMode === null" style="margin-left: auto; display: flex; align-items: center; gap: 8px;">
        
        <button 
          type="button" 
          class="button--bordered" 
          style="border-color: var(--notice-color); color: var(--notice-color); font-size: 0.75rem; padding: 0 8px;"
          @click.stop="moderationMode = 'SAFE'"
          title="Safe Submit Mode"
        >
          <span>Safe Submit</span>
        </button>

        <button 
          type="button" 
          class="button--bordered" 
          style="border-color: #2196F3; color: #2196F3; font-size: 0.75rem; padding: 0 8px;"
          @click.stop="moderationMode = 'REWRITE'"
          title="Rewrite Mode"
        >
          <span>Rewrite</span>
        </button>

        <button 
          v-if="type === 'reply'"
          type="button" 
          class="button--bordered" 
          style="border-color: #4CAF50; color: #4CAF50; font-size: 0.75rem; padding: 0 8px;"
          @click.stop="activateInfoMode"
          title="Get Info on parent post"
        >
          <span>Info</span>
        </button>
      </div>

      <div v-else style="margin-left: auto; font-size: 0.8rem; font-weight: bold; display: flex; gap: 5px; align-items: center;">
        <span v-if="moderationMode === 'SAFE'" style="color: var(--notice-color)">Mode: Safe Submit</span>
        <span v-if="moderationMode === 'REWRITE'" style="color: #2196F3">Mode: Rewrite</span>
        <span v-if="moderationMode === 'INFO'" style="color: #4CAF50">Mode: Analysis</span>
        
        <button type="button" @click.stop="moderationMode = null; contextualInfo = ''; liveRewriteSuggestion = ''" style="cursor: pointer; opacity: 0.6;">
           <SVGIcon name="cross" style="transform: scale(0.7);"/>
        </button>
      </div>

    </template>

    <template #body>
      <Post
        v-if="type === 'reply' || type === 'quoteRepost'"
        :key="post?.uri"
        position="preview"
        :post="post as TTPost"
        :noLink="true"
        @keydown.prevent.stop
        @keyup.prevent.stop
      />

      <EasyForm v-bind="easyFormProps" ref="easyForm">
        <template #item-content-after-1>
          <button
            type="button"
            class="button--bordered"
            @click.prevent="onClickClearButton"
          >
            <SVGIcon name="cross" />
          </button>
        </template>

        <template #free-0>
          <div v-if="liveRewriteSuggestion || isFetchingLiveRewrite" class="live-rewrite-box">
             <div v-if="isFetchingLiveRewrite" class="rewrite-loader">
                Generating non-toxic alternative...
             </div>
             <div v-else class="rewrite-content">
                <strong>✨ Suggested Rewrite:</strong>
                <p>"{{ liveRewriteSuggestion }}"</p>
                <button class="rewrite-btn" @click.prevent="easyFormState.text = liveRewriteSuggestion">
                  Use this version
                </button>
             </div>
          </div>

          <div v-if="moderationMode === 'INFO'" class="suggested-info">
             <div v-if="isFetchingInfo" class="info-loader">Analyzing parent post...</div>
             <div v-else-if="contextualInfo" class="info-content">
               <strong>ℹ️ Suggested Information:</strong>
               <p>{{ contextualInfo }}</p>
             </div>
          </div>
        </template>

        <template #free-3>
          <LinkCard
            v-if="
              !!PreviewLinkCardFeature.external.uri &&
              easyFormState.url !== '' &&
              !easyFormState.medias.length
            "
            :external="PreviewLinkCardFeature.external"
            layout="vertical"
            :displayImage="
              !!PreviewLinkCardFeature.external.thumb &&
              !!easyFormState.urlHasImage.length
            "
            :noLink="true"
            :noEmbedded="true"
          >
            <template #after>
              <Loader
                v-if="PreviewLinkCardFeature.loading.value"
                class="link-card-loader"
              />
            </template>
          </LinkCard>

          <div class="button-container">
            <button
              class="button--bordered post-language-button"
              @click.prevent="mainState.openPostLanguagesPopup()"
            >
              <SVGIcon name="translate" />
              <span>{{ $t("languages") }}</span>
              <b
                v-if="mainState.currentSetting.postLanguages?.length"
                class="post-language-button__set"
              >{{ mainState.currentSetting.postLanguages?.join(", ") }}</b>
              <b
                v-else
                class="post-language-button__not-set"
              >{{ $t("notSet") }}</b>
            </button>

            <LabelButton type="post" :parentState="state" />

            <button
              class="button--bordered on-off-button"
              :disabled="type === 'reply'"
              @click.prevent="openReactionControlPopup"
            >
              <SVGIcon :name="state.isDraftReactionControlOn ? 'lock' : 'unlock'" />
              <span>{{ $t("reactionControl") }}</span>
              <b v-if="state.isDraftReactionControlOn">ON</b>
            </button>

            <button
              class="button--bordered my-word-button"
              @click.prevent="mainState.openMyWordPopup('select')"
            >
              <SVGIcon name="alphaA" />
              <span>{{ $t("myWord") }}</span>
            </button>
          </div>
        </template>

        <template #after>
          <div class="video-upload-info">
            <div
              v-if="state.videoLimits != null && !state.videoLimits.canUpload"
              class="textlabel"
            >
              <div class="textlabel__text--alert">
                <SVGIcon name="alert" />{{ $t("videoCanNotUpload") }}
              </div>
            </div>
            <div v-else-if="state.videoLimits?.canUpload" class="textlabel">
              <dl class="textlabel__text">
                <dt>{{ $t("videoRemainingDailyNumber") }}</dt>
                <dd>{{ (state.videoLimits.remainingDailyVideos ?? 0).toLocaleString() }}</dd>
              </dl>
              <dl class="textlabel__text">
                <dt>{{ $t("videoRemainingDailyBytes") }}</dt>
                <dd>{{ (((state.videoLimits.remainingDailyBytes ?? 0) / 1_000_000_000).toFixed(2)).toLocaleString() }} GB</dd>
              </dl>
            </div>
            <div v-else class="textlabel">
              <dl class="textlabel__text">
                <dt>&emsp;</dt>
                <dd>&emsp;</dd>
              </dl>
            </div>
          </div>

          <div class="hidden-features">
            <button
              class="button--bordered hidden-features-toggle"
              @click.prevent="toggleHiddenFeatures"
            >
              <SVGIcon :name="state.hiddenFeaturesDisplay ? 'cursorLeft' : 'cursorRight'" />
              <span v-if="!state.hiddenFeaturesDisplay">{{ $t("hiddenFeatures") }}</span>
            </button>

            <template v-if="state.hiddenFeaturesDisplay">
              <button
                class="button--bordered post-date-button"
                @click.prevent="mainState.openPostDatePopup"
              >
                <SVGIcon name="history" />
                <span>{{ $t("date") }}</span>
                <b v-if="mainState.postDatePopupDate != null">{{ state.postDatePopupDate }}</b>
              </button>

              <button
                class="button--bordered on-off-button"
                @click.prevent="openListMentionPopup"
              >
                <SVGIcon name="list" />
                <span>{{ $t("listMention") }}</span>
                <b v-if="mainState.listMentionPopupProps.list != null">ON</b>
              </button>
            </template>
          </div>
        </template>
      </EasyForm>
    </template>
  </Popup>
</template>

<style lang="scss" scoped>
.send-post-popup {
  --type-color: var(--fg-color);

  &[data-type="reply"] {
    --type-color: var(--post-color);
  }

  &[data-type="quoteRepost"] {
    --type-color: var(--share-color);
  }

  &:deep() {
    flex-grow: 1;

    .popup {
      max-height: $router-view-width;
    }

    .popup-body {
      padding-top: 0;
    }

    .popup-header > h2 {
      margin-right: 1rem; // Adjusted for space

      .svg-icon {
        fill: rgb(var(--type-color));
      }
    }

    .easy-form__body {
      grid-gap: 0.5rem;

      :deep(.easy-form__body dl > dd > textarea),
      :deep(.easy-form__body dl > dd > textarea:focus),
      :deep(.easy-form__body dl > dd > textarea:hover) {
        color: var(--toxicity-color) !important;
        transition: color 0.2s ease;
      }

      :deep(.toxicity-textarea),
      :deep(.toxicity-textarea textarea) {
        color: var(--toxicity-color) !important;
        transition: color 0.2s ease;
      }
    }

    .post[data-position="preview"] {
      margin-top: 1rem;

      .text {
        pointer-events: fill;
        user-select: text;
      }

      .textlink {
        pointer-events: none;
      }

      .html-text {
        white-space: wrap;
      }
    }

    .textarea {
      border-top-color: transparent;
      border-bottom-color: transparent;
      border-left-style: none;
      border-right-style: none;
      border-radius: 0;
      margin: 0 -1.5rem;
      transition: color 0.2s ease;
    }

    .easy-form dl[data-name="url"] dd {
      display: flex;
      flex-direction: row;
    }

    .submit-button {
      --fg-color: var(--type-color);
    }
  }

  .svg-icon--help {
    font-size: 1.25rem;
  }

  .reset-button > .svg-icon {
    --fg-color: var(--notice-color);
  }

  .link-card-loader {
    font-size: 0.75rem;
  }

  .video-upload-info {
    display: flex;
    flex-direction: column;
    grid-gap: 0.25rem;
    font-size: 0.875rem;
    font-weight: bold;

    dl {
      display: flex;
      flex-direction: row;
      flex-wrap: wrap;
      grid-gap: 0.5rem;

      dt {
        color: rgb(var(--fg-color), 0.5);
      }
    }
  }

  .button-container {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.5rem;

    .button--bordered:deep() {
      font-size: 0.875rem;
      overflow: hidden;
      min-height: 2.625rem;

      .svg-icon {
        font-size: 0.875rem;
      }

      span,
      b {
        text-overflow: ellipsis;
      }

      span {
        white-space: nowrap;
      }

      b {
        font-weight: bold;
        line-height: var(--line-height-high);
        word-break: break-all;
      }
    }

    .post-language-button__set {
      color: rgb(var(--fg-color));
      text-transform: uppercase;
    }

    .post-language-button__not-set {
      color: rgb(var(--notice-color));
    }

    .on-off-button > b {
      color: rgb(var(--notice-color));
    }

    .post-date-button > b {
      color: rgb(var(--fg-color));
    }
  }

  .hidden-features {
    display: flex;
    flex-wrap: wrap;
    grid-gap: 0.5rem;
    font-size: 0.875rem;

    &-toggle {
      border-color: transparent;
    }
  }

  /* NEW STYLES FOR INFO BOX */
  .suggested-info {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #4CAF50; /* Green border for info */
    border-radius: 4px;
    background-color: #f0fdf4; /* Very light green bg */
    font-size: 0.875rem;
    color: #1b5e20;

    .info-loader {
      font-style: italic;
      color: #666;
    }

    .info-content {
      white-space: pre-wrap;
      
      strong {
        display: block;
        margin-bottom: 0.25rem;
        color: #2e7d32;
      }
    }
  }

  /* NEW STYLES FOR LIVE REWRITE BOX */
  .live-rewrite-box {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #FF9800; /* Orange border for warning/suggestion */
    border-radius: 4px;
    background-color: #FFF3E0; /* Very light orange bg */
    font-size: 0.875rem;
    color: #E65100;
    
    .rewrite-loader {
       font-style: italic;
       color: #666;
    }

    .rewrite-content {
      p {
        margin: 0.5rem 0;
        font-style: italic;
        background: rgba(255,255,255,0.5);
        padding: 4px;
        border-radius: 2px;
      }

      .rewrite-btn {
        background-color: #FF9800;
        color: white;
        border: none;
        padding: 4px 8px;
        border-radius: 4px;
        cursor: pointer;
        font-weight: bold;
        font-size: 0.75rem;
        
        &:hover {
          background-color: #F57C00;
        }
      }
    }
  }
}
</style>