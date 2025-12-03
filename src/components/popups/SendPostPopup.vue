<script lang="ts" setup>
import { computed, inject, nextTick, onMounted, onBeforeUnmount, reactive, ref, watch, type ComputedRef, type Ref, toRaw } from "vue"
import { format } from "date-fns/format"
import EasyForm from "@/components/forms/EasyForm.vue"
import LabelButton from "@/components/buttons/LabelButton.vue"
import LinkCard from "@/components/cards/LinkCard.vue"
import Loader from "@/components/shells/Loader.vue"
import Popup from "@/components/popups/Popup.vue"
import Post from "@/components/compositions/Post.vue"
import SVGIcon from "@/components/images/SVGIcon.vue"
import Util from "@/composables/util"

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
const moderationMode = ref<'SAFE' | 'REWRITE' | 'INFO' | 'VISUALIZATION1' | 'VISUALIZATION2' | null>(null);

// Info Mode State
const contextualInfo = ref(""); 
const isFetchingInfo = ref(false);

// Live Rewrite State
const liveRewriteSuggestion = ref("");
const isFetchingLiveRewrite = ref(false);
let rewriteDebounceTimer: any = null;

// Toxicity Bar State (Vis 1)
const toxicityScore = ref(0); 
const isFetchingToxicity = ref(false);
let toxicityDebounceTimer: any = null;

// Toxic Spans State (Vis 2)
const toxicSpans = ref<{word: string, score: number}[]>([]);
const isFetchingSpans = ref(false);
let spansDebounceTimer: any = null;

// Auto-Log Timer & State
let autoLogTimer: any = null;
const lastLoggedText = ref(""); 

// --- SESSION TRACKING ---
const popupSessionId = ref("");
const isClosing = ref(false);

// --- LOCAL SUBMIT LOCK (Prevents Double Posts) ---
const isIntercepting = ref(false);

// =========================================================
// ===       LOGGING HELPER                              ===
// =========================================================

async function logActivityToBackend(actionType: string, metaData: any = {}, overrideText: string | null = null) {
  
  // Determine which text to log
  const textToLog = overrideText !== null ? overrideText : easyFormState.text;

  if (actionType === 'DRAFT_AUTOSAVE' && textToLog === lastLoggedText.value) return; 

  const userDid = mainState.atp.session?.did || "unknown_user";

  let parentData = {};
  if (props.type === 'reply' && props.post) {
      const parentCid = props.post.cid;
      const parentText = props.post.record?.text || "";
      parentData = { parent_cid: parentCid, parent_text: parentText };
  }

  try {
    if (actionType === 'DRAFT_AUTOSAVE' || actionType === 'POST_SUBMITTED' || actionType === 'POST_PUBLISHED') {
        lastLoggedText.value = textToLog;
    }

    const currentSession = metaData.popup_session_id || popupSessionId.value;

    // FIX: Remove popup_session_id from metaData if it was passed in there
    const { popup_session_id: _ignore, ...cleanedMetaData } = metaData;

    const finalMeta = { 
      ...cleanedMetaData, 
      ...parentData
    };

    await fetch('http://localhost:8000/log_activity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_did: userDid,
        action_type: actionType,
        input_text: textToLog, 
        moderation_mode: moderationMode.value || "STANDARD",
        popup_session_id: currentSession, // <-- SENDING AS TOP LEVEL FIELD
        meta: finalMeta
      })
    });
  } catch (err) {
    console.warn("Failed to log activity", err);
  }
}

function sendBeaconLog(actionType: string, metaData: any) {
  const userDid = mainState.atp.session?.did || "unknown_user";
  const url = 'http://localhost:8000/log_activity';
  
  const body = {
        user_did: userDid,
        action_type: actionType,
        input_text: easyFormState.text, 
        moderation_mode: moderationMode.value || "STANDARD",
        popup_session_id: popupSessionId.value, // <-- SENDING AS TOP LEVEL FIELD
        meta: {
            ...metaData,
            closure_method: "browser_terminated" 
        }
  };
  const blob = new Blob([JSON.stringify(body)], { type: 'application/json' });
  navigator.sendBeacon(url, blob);
}

// =========================================================
// ===       SESSION MANAGEMENT                          ===
// =========================================================

function startSession() {
  const userDid = mainState.atp.session?.did || "unknown_user";
  const timestamp = Date.now();
  popupSessionId.value = `${userDid}_${timestamp}`;
  isClosing.value = false;
  logActivityToBackend("POPUP_OPENED", { timestamp_ms: timestamp });
}

function handleBrowserClose() {
    if (popupSessionId.value && !isClosing.value) {
        const now = Date.now();
        const startTimestamp = Number(popupSessionId.value.split('_').pop() || now);
        sendBeaconLog("POPUP_CLOSED", {
            duration_ms: now - startTimestamp,
            timestamp_ms: now
        });
    }
}

async function close() {
  // Clear text on close
  easyFormState.text = "";
  
  if (!popupSessionId.value) {
    emit("closeSendPostPopup", false, true);
    return;
  }

  isClosing.value = true;
  const now = Date.now();
  const startTimestamp = Number(popupSessionId.value.split('_').pop() || now);
  
  await logActivityToBackend("POPUP_CLOSED", { 
    duration_ms: now - startTimestamp,
    timestamp_ms: now
  });

  popupSessionId.value = ""; 
  moderationMode.value = null; 
  contextualInfo.value = ""; 
  liveRewriteSuggestion.value = "";
  toxicSpans.value = [];
  emit("closeSendPostPopup", false, true)
}

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

async function getScore(text: string): Promise<number> {
  try {
    const data = await apiCall("toxicityHateSpeechPrediction", { text });
    return data.predictions.reduce((max: number, p: any) => p.score > max ? p.score : max, 0);
  } catch (e) {
    console.error("Score check failed", e);
    return 0;
  }
}

async function fetchLiveRewrite(textToRewrite: string) {
  if (!textToRewrite.trim()) {
    liveRewriteSuggestion.value = "";
    return;
  }
  isFetchingLiveRewrite.value = true;
  const score = await getScore(textToRewrite);
  
  if (score > 0.60) {
    try {
      const data = await apiCall("nonToxicRewriting", { text: textToRewrite });
      liveRewriteSuggestion.value = data.rewritten_text;
      logActivityToBackend("REWRITE_SUGGESTED", { original: textToRewrite, suggestion: data.rewritten_text, score: score });
    } catch(e) {
      console.error("Live rewrite failed", e);
    }
  } else {
    liveRewriteSuggestion.value = ""; 
  }
  isFetchingLiveRewrite.value = false;
}

async function fetchServerToxicityScore(textToCheck: string) {
  if (!textToCheck.trim()) {
    toxicityScore.value = 0;
    return;
  }
  isFetchingToxicity.value = true;
  try {
    const score = await getScore(textToCheck);
    toxicityScore.value = score;
    logActivityToBackend("VISUALIZATION_1_UPDATE", { score: score });
  } finally {
    isFetchingToxicity.value = false;
  }
}

async function fetchToxicSpans(textToCheck: string) {
  if (!textToCheck.trim()) {
    toxicSpans.value = [];
    return;
  }
  isFetchingSpans.value = true;
  try {
    const data = await apiCall("toxicSpans", { text: textToCheck });
    toxicSpans.value = data.spans;
    logActivityToBackend("VISUALIZATION_2_UPDATE", { spans: data.spans });
  } catch(e) {
    console.error("Toxic spans check failed", e);
  } finally {
    isFetchingSpans.value = false;
  }
}

async function activateInfoMode() {
  moderationMode.value = 'INFO';
  if (props.type === 'reply' && props.post) {
    isFetchingInfo.value = true;
    contextualInfo.value = ""; 
    try {
      const response = await mainState.atp.agent.getPostThread({
        uri: props.post.uri,
        depth: 0,
        parentHeight: 1000 
      });
      if (!response.success) throw new Error("Failed to fetch thread");
      let history: string[] = [];
      let currentPost: any = response.data.thread;
      while (currentPost) {
        const handle = currentPost.post?.author?.handle || "Unknown";
        const text = currentPost.post?.record?.text || "[Image/Media]";
        history.unshift(`User @${handle}: "${text}"`);
        currentPost = currentPost.parent;
      }
      const fullTranscript = history.join("\n\n");
      const data = await apiCall("infoMessage", { 
          text: fullTranscript, 
          context: "Bluesky Conversation Thread" 
      });
      contextualInfo.value = data.contextual_info;
      logActivityToBackend("INFO_REQUESTED", { thread_length: history.length });
    } catch (err) {
      console.error("Failed to fetch info context:", err);
      const fallbackText = props.post.record?.text || "";
      if(fallbackText) {
           const data = await apiCall("infoMessage", { text: fallbackText, context: "Social Media Reply (Fallback)" });
           contextualInfo.value = data.contextual_info;
      } else {
           contextualInfo.value = "Could not fetch conversation context.";
      }
    } finally {
      isFetchingInfo.value = false;
    }
  }
}

// =========================================================
// ===       STRICT SUBMIT INTERCEPTOR                   ===
// =========================================================

async function interceptSubmit() {
  if (isIntercepting.value || mainState.sendPostPopupProcessing) return;
  isIntercepting.value = true;

  Util.blurElement()

  if (easyFormState.text.trim() === "" && easyFormState.medias.length === 0 && easyFormState.url.trim() === "") {
    const result = await mainState.openConfirmationPopup({
      title: $t("emptyPostConfirmation"),
      text: $t("emptyPostConfirmationMessage"),
    })
    if (!result) {
        isIntercepting.value = false; 
        return;
    }
  }

  // 1. STANDARD / INFO / VISUALIZATION MODES
  if (moderationMode.value === null || moderationMode.value === 'INFO' || moderationMode.value === 'VISUALIZATION1' || moderationMode.value === 'VISUALIZATION2') {
    logActivityToBackend("POST_SUBMITTED", { final_mode: moderationMode.value || "STANDARD" });
    await executeActualSubmit();
    isIntercepting.value = false;
    return;
  }

  mainState.sendPostPopupProcessing = true; 

  try {
    const textToCheck = easyFormState.text;
    
    // 2. SAFE MODE
    if (moderationMode.value === 'SAFE') {
      const score = await getScore(textToCheck);
      const isToxic = score > 0.50;
      
      if (isToxic) {
        logActivityToBackend("SUBMIT_BLOCKED_SAFE_MODE", { score: score });
        mainState.sendPostPopupProcessing = false; 
        const confirm = await mainState.openConfirmationPopup({
          title: "⚠️ Toxicity Detected",
          text: "This post has been flagged by our safety system.\n\nAre you sure you want to publish it?",
        });
        if (!confirm) {
            logActivityToBackend("SUBMIT_CANCELLED_BY_USER");
            isIntercepting.value = false;
            return;
        }
        logActivityToBackend("SUBMIT_FORCED_BY_USER");
        mainState.sendPostPopupProcessing = true;
      } else {
        // --- FIX: Log submission for clean text in Safe Mode ---
        logActivityToBackend("POST_SUBMITTED", { final_mode: "SAFE", note: "clean_text_pass" });
      }
    }
    // 3. REWRITE MODE
    else if (moderationMode.value === 'REWRITE') {
      const score = await getScore(textToCheck);
      if (score > 0.60) {
         const data = await apiCall("nonToxicRewriting", { text: textToCheck });
         const rewrite = data.rewritten_text;
         mainState.sendPostPopupProcessing = false;
         const useRewrite = await mainState.openConfirmationPopup({
           title: "✨ Non-Toxic Rewrite",
           text: `We have rewritten your text to be more constructive:\n\n"${rewrite}"\n\nClick OK to use this version, or Cancel to keep yours.`
         });
         if (useRewrite) {
           easyFormState.text = rewrite; 
           logActivityToBackend("REWRITE_ACCEPTED_AT_SUBMIT");
           mainState.sendPostPopupProcessing = true;
         } else {
           const confirmOriginal = await mainState.openConfirmationPopup({
             title: "Post Original?",
             text: "Do you want to proceed with the original text?"
           });
           if (!confirmOriginal) {
               isIntercepting.value = false;
               return;
           }
           logActivityToBackend("REWRITE_REJECTED_AT_SUBMIT");
           mainState.sendPostPopupProcessing = true; 
         }
      } else {
        // --- FIX: Log submission for clean text in Rewrite Mode ---
        logActivityToBackend("POST_SUBMITTED", { final_mode: "REWRITE", note: "clean_text_pass" });
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
      logActivityToBackend("POST_SUBMITTED_ON_ERROR");
      await executeActualSubmit();
    }
  } finally {
      isIntercepting.value = false; 
  }
}

async function executeActualSubmit() {
  const videoSizes = (easyForm.value?.getVideoSizes() ?? [[]])[0]
  easyFormState.medias.forEach((media, index) => {
    (media as any)._videoAspectRatio = videoSizes[index]
  })

  // SNAPSHOT: Capture data BEFORE closing (which wipes text)
  const dataToSubmit = { ...easyFormState };

  const sessionForSubmit = popupSessionId.value;

  close() // Wipes reactive text, but we have dataToSubmit
  
  mainState.sendPostPopupProcessing = true 

  try {
    const result = await mainState.atp.createPost({
      ...dataToSubmit, // USE SNAPSHOT
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
      // FIX: Pass dataToSubmit.text to logger explicitly
      logActivityToBackend("POST_SUBMISSION_FAILED", { error: result.message, popup_session_id: sessionForSubmit }, dataToSubmit.text);
    } else {
      // FIX: Pass dataToSubmit.text to logger explicitly
      await logActivityToBackend("POST_PUBLISHED", { 
          final_mode: moderationMode.value || "STANDARD",
          cid: result.cid, 
          uri: result.uri,
          popup_session_id: sessionForSubmit
      }, dataToSubmit.text); 

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
    format(date, "yyyy-MM-dd'T'HH:mm:ss'Z'")
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

const easyFormProps = reactive<{
  hasSubmitButton: boolean
  submitButtonLabel: string
  submitting: boolean
  data: Array<any>
}>({
  hasSubmitButton: true,
  submitButtonLabel: "Submit", 
  submitting: mainState.sendPostPopupProcessing,
  data: [
    {
      name: "text",
      state: easyFormState,
      model: "text",
      type: "textarea",
      placeholder: "", 
      maxlength: 300,
      maxLengthIndicator: true,
      maxLengthIndicatorByGrapheme: true,
      rows: 6,
      autoResizeTextarea: true,
      focus: true,
      onInput: onBlurOrInputText,
      onBlur: onBlurOrInputText,
      onFocus: onBlurOrInputText,
      classes: "toxicity-textarea"
    },
    {
      name: "url",
      state: easyFormState,
      model: "url",
      type: "text",
      placeholder: "URL",
      display: false,
    },
    {
      name: "urlHasImage",
      state: easyFormState,
      model: "urlHasImage",
      type: "checkbox",
      label: $t("includeLinkThumbnail"),
      display: false,
    },
    {
      name: "shouldConvertGifToVideo",
      state: easyFormState,
      model: "shouldConvertGifToVideo",
      type: "checkbox",
      label: $t("convertGifToVideo"),
      display: false,
    }
  ],
})

watch(() => mainState.sendPostPopupProcessing, (val) => {
  easyFormProps.submitting = val;
});

const easyForm = ref<InstanceType<typeof EasyForm> | null>(null)
const popup = ref<InstanceType<typeof Popup> | null>(null)

// --- LIFECYCLE HOOKS ---

onMounted(async () => {
  if (mainState.sendPostPopupProps.visibility) {
    startSession();
  }
  window.addEventListener("beforeunload", handleBrowserClose);

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

onBeforeUnmount(() => {
  window.removeEventListener("beforeunload", handleBrowserClose);
  if (popupSessionId.value && !isClosing.value) {
    handleBrowserClose();
  }
});

function getTextarea (): null | HTMLTextAreaElement {
  return document.querySelector("#easy-form--default__0 textarea") as HTMLTextAreaElement | null;
}

watch(toxicityScore, (score) => {
  const textarea = getTextarea();
  if (textarea) {
    if (moderationMode.value === 'VISUALIZATION1') {
       textarea.style.color = `hsl(${(1 - score) * 120}, 100%, 30%)`;
    } else {
       textarea.style.color = ''; 
    }
  }
});

// WATCHERS
watch(moderationMode, (newMode) => {
  clearTimeout(rewriteDebounceTimer);
  clearTimeout(toxicityDebounceTimer);
  clearTimeout(spansDebounceTimer);
  if (newMode === 'REWRITE' && easyFormState.text.trim()) {
    fetchLiveRewrite(easyFormState.text);
  }
  else if (newMode === 'VISUALIZATION1' && easyFormState.text.trim()) {
    fetchServerToxicityScore(easyFormState.text); 
  }
  else if (newMode === 'VISUALIZATION2' && easyFormState.text.trim()) {
    fetchToxicSpans(easyFormState.text); 
  }
  if (newMode !== 'REWRITE') liveRewriteSuggestion.value = "";
  if (newMode !== 'VISUALIZATION2') toxicSpans.value = [];
  const textarea = getTextarea();
  if (newMode !== 'VISUALIZATION1' && textarea) {
    textarea.style.color = ''; 
  }
})

watch(() => easyFormState.text, async (newText) => {
    clearTimeout(autoLogTimer);
    if (newText.trim()) {
      autoLogTimer = setTimeout(() => {
        logActivityToBackend("DRAFT_AUTOSAVE", { length: newText.length });
      }, 1000); 
    }
    clearTimeout(rewriteDebounceTimer); 
    if (moderationMode.value === 'REWRITE') {
      if (newText.trim()) {
        rewriteDebounceTimer = setTimeout(() => fetchLiveRewrite(newText), 1000); 
      } else {
        liveRewriteSuggestion.value = "";
      }
    } else {
      liveRewriteSuggestion.value = "";
    }
    clearTimeout(toxicityDebounceTimer);
    if (moderationMode.value === 'VISUALIZATION1') {
        if (newText.trim()) {
          toxicityDebounceTimer = setTimeout(() => fetchServerToxicityScore(newText), 800);
        } else {
          toxicityScore.value = 0;
        }
    }
    clearTimeout(spansDebounceTimer);
    if (moderationMode.value === 'VISUALIZATION2') {
        if (newText.trim()) {
          spansDebounceTimer = setTimeout(() => fetchToxicSpans(newText), 1500);
        } else {
          toxicSpans.value = [];
        }
    }
  }
)

watch(() => mainState.sendPostPopupProps.visibility, (value?: boolean) => {
  if (value) {
    startSession(); 
    setTimeout(() => {
      if (props.text) easyFormState.text = `${props.text} ${easyFormState.text}`
      if (props.url) easyFormState.url = props.url
      PreviewLinkCardFeature.execute()
      popup.value?.scrollToTop()
      easyForm.value?.setFocus()
    }, 0)
  }
})

watch(() => props.fileList, (value?: FileList) => {
  const files = value != null ? Array.from(value) : []
  files.unshift(...easyFormState.medias)
  easyFormState.medias = files
  onInputUrl()
  onChangeImage()
})

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
  toxicSpans.value = [];
  mainState.openSendPostPopup({
    type: "post",
    post: props.post,
  })
}

function onInputUrl () {
  PreviewLinkCardFeature.threshold()
  const urlHasImageItem = easyFormProps.data.find((item: any) => item.model === "urlHasImage")
  if (urlHasImageItem != null) {
    urlHasImageItem.display = !!easyFormState.url && easyFormState.medias.length === 0
  }
  const shouldConvertGifToVideoItem = easyFormProps.data.find((item: any) => item.model === "shouldConvertGifToVideo")
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
  const urlItem = easyFormProps.data.find((item: any) => item.model === "url")
  if (urlItem == null) return
  urlItem.display = easyFormState.medias.length === 0
  easyFormState.alts.splice(easyFormState.medias.length)
  easyFormProps.data.splice(
    0,
    easyFormProps.data.length,
    ...easyFormProps.data.filter((data: any) => data.name !== "alt")
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

        <button 
          type="button" 
          class="button--bordered" 
          style="border-color: #9C27B0; color: #9C27B0; font-size: 0.75rem; padding: 0 8px;"
          @click.stop="moderationMode = 'VISUALIZATION1'"
          title="Dynamic Toxicity Bar"
        >
          <span>Vis 1</span>
        </button>

        <button 
          type="button" 
          class="button--bordered" 
          style="border-color: #FF5722; color: #FF5722; font-size: 0.75rem; padding: 0 8px;"
          @click.stop="moderationMode = 'VISUALIZATION2'"
          title="Toxic Spans Explanation"
        >
          <span>Vis 2</span>
        </button>
      </div>

      <div v-else style="margin-left: auto; font-size: 0.8rem; font-weight: bold; display: flex; gap: 5px; align-items: center;">
        <span v-if="moderationMode === 'SAFE'" style="color: var(--notice-color)">Mode: Safe Submit</span>
        <span v-if="moderationMode === 'REWRITE'" style="color: #2196F3">Mode: Rewrite</span>
        <span v-if="moderationMode === 'INFO'" style="color: #4CAF50">Mode: Analysis</span>
        <span v-if="moderationMode === 'VISUALIZATION1'" style="color: #9C27B0">Mode: Vis 1 (Bar)</span>
        <span v-if="moderationMode === 'VISUALIZATION2'" style="color: #FF5722">Mode: Vis 2 (Spans)</span>
        
        <button type="button" @click.stop="moderationMode = null; contextualInfo = ''; liveRewriteSuggestion = ''; toxicSpans = []" style="cursor: pointer; opacity: 0.6;">
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

      <EasyForm v-bind="easyFormProps" ref="easyForm" @submit="interceptSubmit">
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
             <div v-if="isFetchingLiveRewrite" class="rewrite-loader">Generating...</div>
             <div v-else class="rewrite-content">
                <strong>✨ Suggested Rewrite:</strong>
                <p>"{{ liveRewriteSuggestion }}"</p>
                <button class="rewrite-btn" @click.prevent="easyFormState.text = liveRewriteSuggestion">Use this</button>
             </div>
          </div>

          <div v-if="moderationMode === 'INFO'" class="suggested-info">
             <div v-if="isFetchingInfo" class="info-loader">Analyzing...</div>
             <div v-else-if="contextualInfo" class="info-content">
               <strong>ℹ️ Suggested Information:</strong>
               <p>{{ contextualInfo }}</p>
             </div>
          </div>

          <div v-if="moderationMode === 'VISUALIZATION1'" class="toxicity-bar-container" :style="{ '--toxicity-color': `hsl(${(1 - toxicityScore) * 120}, 100%, 30%)` }">
            <div v-if="isFetchingToxicity" style="height: 100%; background: #eee; width: 100%; text-align: center; font-size: 0.6rem; line-height: 4px;">Loading...</div>
            <div v-else class="toxicity-bar" :style="{ width: `${toxicityScore * 100}%`, backgroundColor: `hsl(${(1 - toxicityScore) * 120}, 100%, 50%)` }"></div>
            
            <div style="font-size: 0.75rem; text-align: right; margin-top: 4px; color: var(--toxicity-color)">
               Toxicity Score: {{ (toxicityScore * 100).toFixed(1) }}%
            </div>
          </div>

          <div v-if="moderationMode === 'VISUALIZATION2'" class="toxic-spans-container">
             <div v-if="isFetchingSpans" style="text-align: center; font-size: 0.75rem; color: #666; font-style: italic;">Calculating word impact...</div>
             <div v-else class="spans-wrapper">
               <span 
                 v-for="(item, idx) in toxicSpans" 
                 :key="idx" 
                 class="toxic-span"
                 :style="{ backgroundColor: `rgba(255, 0, 0, ${item.score * 2})` }"
                 :title="`Toxicity Contribution: ${(item.score * 100).toFixed(1)}%`"
               >
                 {{ item.word }}
               </span>
             </div>
             <div style="font-size: 0.7rem; color: #666; margin-top: 5px;">
               * Darker red indicates words that increase toxicity the most.
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

  /* RE-ADDED STYLES FOR TOXICITY BAR */
  .toxicity-bar-container {
    height: 4px;
    background-color: rgba(0, 0, 0, 0.1);
    border-radius: 2px;
    margin-top: 0.25rem;
    overflow: hidden;
  }

  .toxicity-bar {
    height: 100%;
    border-radius: 2px;
    transition: width 0.2s ease, background-color 0.2s ease;
  }

  /* NEW STYLES FOR TOXIC SPANS */
  .toxic-spans-container {
    margin-top: 0.5rem;
    padding: 0.75rem;
    border: 1px solid #ddd;
    border-radius: 4px;
    background-color: #f9f9f9;
    
    .spans-wrapper {
      display: flex;
      flex-wrap: wrap;
      gap: 4px;
      font-size: 0.9rem;
      line-height: 1.5;
    }

    .toxic-span {
      padding: 0 2px;
      border-radius: 2px;
      transition: background-color 0.2s ease;
      color: #000; /* Force black text */
      font-weight: 600; /* Make it bold */
    }
  }
}
</style>