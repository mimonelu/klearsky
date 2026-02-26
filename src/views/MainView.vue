<script setup lang="ts">
import AccountPopover from "@/components/next/Account/AccountPopover.vue"
import AccountPopup from "@/components/next/Account/AccountPopup.vue"
import ActivitySubscriptionItemPopup from "@/components/next/ActivitySubscription/ActivitySubscriptionItemPopup.vue"
import ActivitySubscriptionListPopup from "@/components/next/ActivitySubscription/ActivitySubscriptionListPopup.vue"
import ActivitySubscriptionPermissionPopup from "@/components/next/ActivitySubscription/ActivitySubscriptionPermissionPopup.vue"
import ActorStatusEditPopup from "@/components/next/ActorStatus/ActorStatusEditPopup.vue"
import AdvancedSearchPopup from "@/components/popups/AdvancedSearchPopup.vue"
import BlockingUsersPopup from "@/components/next/UserBlock/BlockingUsersPopup.vue"
import ChatConvoPopover from "@/components/popovers/ChatConvoPopover.vue"
import ChatConvoPopup from "@/components/popups/ChatConvoPopup.vue"
import ChatDeclarationSelectPopover from "@/components/popovers/ChatDeclarationSelectPopover.vue"
import ChatListPopup from "@/components/popups/ChatListPopup.vue"
import ChatMembersSelectPopup from "@/components/popups/ChatMembersSelectPopup.vue"
import ChatMessagePopover from "@/components/popovers/ChatMessagePopover.vue"
import ConfirmationPopup from "@/components/popups/ConfirmationPopup.vue"
import CustomBookmarkPopup from "@/components/popups/CustomBookmarkPopup.vue"
import CustomBookmarkManagementPopup from "@/components/popups/CustomBookmarkManagementPopup.vue"
import DesignSettingsPopup from "@/components/popups/settings-popups/DesignSettingsPopup.vue"
import PostDraftPopup from "@/components/next/PostDraft/PostDraftPopup.vue"
import DropFiles from "@/components/next/DropFiles/DropFiles.vue"
import EasterEggPopover from "@/components/next/EasterEgg/EasterEggPopover.vue"
import EditPostPopup from "@/components/next/EditPost/EditPostPopup.vue"
import ErrorPopup from "@/components/popups/ErrorPopup.vue"
import FeedCardPopover from "@/components/popovers/FeedCardPopover.vue"
import HtmlPopup from "@/components/popups/HtmlPopup.vue"
import ImagePopup from "@/components/popups/ImagePopup.vue"
import InviteCodesPopup from "@/components/popups/InviteCodesPopup.vue"
import KeywordHistoryPopover from "@/components/popovers/KeywordHistoryPopover.vue"
import LabelerListPopup from "@/components/popups/LabelerListPopup.vue"
import LabelerSettingsPopup from "@/components/popups/LabelerSettingsPopup.vue"
import LikeUsersPopup from "@/components/popups/LikeUsersPopup.vue"
import ListCardPopover from "@/components/popovers/ListCardPopover.vue"
import ListEditPopup from "@/components/popups/ListEditPopup.vue"
import ListUserManagementPopup from "@/components/popups/ListUserManagementPopup.vue"
import Loader from "@/components/shells/Loader.vue"
import LoginPopup from "@/components/next/Login/LoginPopup.vue"
import MainMenuHorizontal from "@/components/shells/MainMenuHorizontal.vue"
import MainMenuVertical from "@/components/shells/MainMenuVertical.vue"
import MessagePopup from "@/components/popups/MessagePopup.vue"
import MutingUsersPopup from "@/components/next/UserMute/MutingUsersPopup.vue"
import MyFeedsPopup from "@/components/popups/MyFeedsPopup.vue"
import MyFeedsSortPopover from "@/components/popovers/MyFeedsSortPopover.vue"
import MyListPopup from "@/components/popups/MyListPopup.vue"
import MyWordPopup from "@/components/popups/MyWordPopup.vue"
import NotificationFilterPopup from "@/components/next/Notification/NotificationFilterPopup.vue"
import NotificationPopup from "@/components/next/Notification/NotificationPopup.vue"
import OfficialBookmarkPopup from "@/components/next/OfficialBookmark/OfficialBookmarkPopup.vue"
import OtherSettingsPopup from "@/components/popups/settings-popups/OtherSettingsPopup.vue"
import PasteFiles from "@/components/next/PasteFiles/PasteFiles.vue"
import PostPopover from "@/components/popovers/PostPopover.vue"
import PostSettingsPopup from "@/components/popups/settings-popups/PostSettingsPopup.vue"
import PostThreadPopup from "@/components/next/Post/PostThreadPopup.vue"
import PostThreadSortPopover from "@/components/popovers/PostThreadSortPopover.vue"
import ProfilePopover from "@/components/popovers/ProfilePopover.vue"
import ProgressPopup from "@/components/popups/ProgressPopup.vue"
import QuoteRepostsPopup from "@/components/popups/QuoteRepostsPopup.vue"
import ReactionControlPopup from "@/components/popups/ReactionControlPopup.vue"
import RepostMutesPopup from "@/components/next/RepostMute/RepostMutesPopup.vue"
import RepostUsersPopup from "@/components/popups/RepostUsersPopup.vue"
import ScrollButton from "@/components/buttons/ScrollButton.vue"
import SelectDatePopup from "@/components/popups/SelectDatePopup.vue"
import SelectLabelsPopup from "@/components/popups/SelectLabelsPopup.vue"
import SelectLanguagesPopup from "@/components/popups/SelectLanguagesPopup.vue"
import SendAccountReportPopup from "@/components/popups/SendAccountReportPopup.vue"
import SendFeedReportPopup from "@/components/popups/SendFeedReportPopup.vue"
import SendListReportPopup from "@/components/popups/SendListReportPopup.vue"
import SendPostPopup from "@/components/popups/SendPostPopup.vue"
import SendPostReportPopup from "@/components/popups/SendPostReportPopup.vue"
import SettingsPopover from "@/components/popovers/SettingsPopover.vue"
import SplashScreen from "@/components/shells/SplashScreen.vue"
import StarterPackCardPopover from "@/components/popovers/StarterPackCardPopover.vue"
import StarterPackEditPopup from "@/components/popups/StarterPackEditPopup.vue"
import SubMenu from "@/components/shells/SubMenu.vue"
import TimeFeedsPopup from "@/components/popups/TimeFeedsPopup.vue"
import TimeSettingsPopup from "@/components/popups/settings-popups/TimeSettingsPopup.vue"
import UiLanguageSettingsPopup from "@/components/popups/settings-popups/UiLanguageSettingsPopup.vue"
import UserListPopup from "@/components/popups/UserListPopup.vue"
import VerifiedAccountsPopup from "@/components/next/Verification/VerifiedAccountsPopup.vue"
import VerifiersPopup from "@/components/next/Verification/VerifiersPopup.vue"
import WordMutePopup from "@/components/next/WordMute/WordMutePopup.vue"
import { state } from "@/composables/main-state"
import { useMainView } from "@/composables/main-view/useMainView"

const {
  loginPopup,
  dropFiles,
  signUp,
  manualLogin,
  oauthLogin,
  saveSetting,
  changeSetting,
  closeSendPostPopup,
  setAccountToLoginForm,
} = useMainView()
</script>

<template>
  <div
    class="main-view"
    :key="state.updateKey"
    :data-path="state.currentPath"
    :style="{
      '--main-area-opacity': state.currentSetting.mainAreaOpacity ?? 1.0,
    }"
    @dragenter.prevent="(dropFiles as any)?.onDragEnter"
  >
    <!-- 壁紙 -->
    <div
      class="background-image"
      :style="{
        'background-image': state.backgroundImage,
        'opacity': 1.0 - (state.currentSetting.backgroundOpacity ?? 0),
      }"
    />

    <!-- メインエリア -->
    <div
      v-show="!state.loginPopupAutoDisplay"
      class="main-view__main"
    >
      <!-- PC用メニュー -->
      <div class="main-menu-vertical-wrapper">
        <div class="main-menu-vertical-wrapper__inner">
          <MainMenuVertical />
        </div>
      </div>

      <!-- SP用メニュー -->
      <div class="main-menu-horizontal-wrapper">
        <MainMenuHorizontal />
      </div>

      <!-- ルータービュー -->
      <div class="router-view-wrapper">
        <!-- ルータービューヘッダー -->
        <div class="router-view-wrapper__header">
          <PortalTarget name="router-view-wrapper-header" />
        </div>

        <RouterView
          v-if="state.mounted"
          @updatePageTitle="state.updatePageTitle"
        />

        <!-- 中央ローダー -->
        <Loader
          v-if="state.centerLoaderDisplay"
          class="center-loader"
        />
      </div>

      <!-- サブメニュー -->
      <div class="sub-menu-wrapper">
        <div class="sub-menu-wrapper__inner">
          <SubMenu />
        </div>
      </div>

      <ScrollButton />
    </div>

    <!-- 設定ポップオーバー -->
    <SettingsPopover
      v-if="state.settingsPopoverDisplay"
      @close="state.closeSettingsPopover"
    />

    <!-- アカウントポップオーバー -->
    <AccountPopover
      v-if="state.accountPopoverProps.display"
      v-bind="state.accountPopoverProps"
      @close="state.closeAccountPopover"
      @setAccountToLoginForm="setAccountToLoginForm as unknown"
    />

    <!-- プロフィールポップオーバー -->
    <ProfilePopover
      v-if="state.profilePopoverProps.display"
      v-bind="state.profilePopoverProps"
      @close="state.closeProfilePopover"
    />

    <!-- ポストポップオーバー -->
    <PostPopover
      v-if="state.postPopoverProps.display"
      v-bind="state.postPopoverProps"
      @close="state.closePostPopover"
    />

    <!-- フィードカードポップオーバー -->
    <FeedCardPopover
      v-if="state.feedCardPopoverProps.display"
      v-bind="state.feedCardPopoverProps"
      @close="state.closeFeedCardPopover"
    />

    <!-- リストカードポップオーバー -->
    <ListCardPopover
      v-if="state.listCardPopoverProps.display"
      v-bind="state.listCardPopoverProps"
      @close="state.closeListCardPopover"
    />

    <!-- スターターパックカードポップオーバー -->
    <StarterPackCardPopover
      v-if="state.starterPackCardPopoverProps.display"
      v-bind="state.starterPackCardPopoverProps"
      @close="state.closeStarterPackCardPopover"
    />

    <!-- マイフィードソートポップオーバー -->
    <MyFeedsSortPopover
      v-if="state.myFeedsSortPopoverProps.display"
      v-bind="state.myFeedsSortPopoverProps"
      @close="state.closeMyFeedsSortPopover"
    />

    <!-- ポストスレッドソートポップオーバー -->
    <PostThreadSortPopover
      v-if="state.postThreadSortPopoverProps.display"
      v-bind="state.postThreadSortPopoverProps"
      @close="state.closePostThreadSortPopover"
    />

    <!-- イースターエッグポップオーバー -->
    <EasterEggPopover
      v-if="state.easterEggPopoverProps.display"
      v-bind="state.easterEggPopoverProps"
      @close="state.closeEasterEggPopover"
    />

    <!-- チャットルームポップオーバー -->
    <ChatConvoPopover
      v-if="state.chatConvoPopoverProps.display"
      v-bind="state.chatConvoPopoverProps"
      @close="state.closeChatConvoPopover"
    />

    <!-- チャット公開設定ポップオーバー -->
    <ChatDeclarationSelectPopover
      v-if="state.chatDeclarationSelectPopoverProps.display"
      v-bind="state.chatDeclarationSelectPopoverProps"
      @close="state.closeChatDeclarationSelectPopover"
    />

    <!-- チャットメッセージポップオーバー -->
    <ChatMessagePopover
      v-if="state.chatMessagePopoverProps.display"
      v-bind="state.chatMessagePopoverProps"
      @close="state.closeChatMessagePopover"
    />

    <!-- キーワード履歴ポップオーバー -->
    <KeywordHistoryPopover
      v-if="state.keywordHistoryPopoverProps.display"
      v-bind="state.keywordHistoryPopoverProps"
      @close="state.closeKeywordHistoryPopover"
    />

    <!-- ポップアップコンテナ -->
    <div class="popup-container">
      <!-- 通知ポップアップ -->
      <Transition>
        <NotificationPopup
          v-if="state.notificationPopupDisplay"
          @close="state.closeNotificationPopup"
          @updatePageTitle="state.updatePageTitle"
        />
      </Transition>

      <!-- 通知フィルターポップアップ -->
      <Transition>
        <NotificationFilterPopup
          v-if="state.notificationFilterPopupDisplay"
          @close="state.closeNotificationFilterPopup"
        />
      </Transition>

      <!-- ポストスレッドポップアップ -->
      <Transition>
        <PostThreadPopup
          v-if="state.postThreadPopupProps.display"
          @close="state.closePostThreadPopup"
        />
      </Transition>

      <!-- 設定 - UI言語設定ポップアップ -->
      <Transition>
        <UiLanguageSettingsPopup
          v-if="state.uiLanguageSettingsPopupDisplay"
          @close="state.closeUiLanguageSettingsPopup"
          @changeSetting="changeSetting"
        />
      </Transition>

      <!-- 設定 - デザイン設定ポップアップ -->
      <Transition>
        <DesignSettingsPopup
          v-if="state.designSettingsPopupDisplay"
          @close="state.closeDesignSettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
          @showDescription="state.openHtmlPopup"
        />
      </Transition>

      <!-- 設定 - ポスト設定ポップアップ -->
      <Transition>
        <PostSettingsPopup
          v-if="state.postSettingsPopupDisplay"
          @close="state.closePostSettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
          @showDescription="state.openHtmlPopup"
        />
      </Transition>

      <!-- 設定 - 時間設定ポップアップ -->
      <Transition>
        <TimeSettingsPopup
          v-if="state.timeSettingsPopupDisplay"
          @close="state.closeTimeSettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
        />
      </Transition>

      <!-- 設定 - その他設定ポップアップ -->
      <Transition>
        <OtherSettingsPopup
          v-if="state.otherSettingsPopupDisplay"
          @close="state.closeOtherSettingsPopup"
          @saveSetting="saveSetting"
          @changeSetting="changeSetting"
          @showDescription="state.openHtmlPopup as unknown"
        />
      </Transition>

      <!-- アクターステータス編集ポップアップ -->
      <Transition>
        <ActorStatusEditPopup
          v-if="state.actorStatusEditPopupProps.display"
          @close="state.closeActorStatusEditPopup"
        />
      </Transition>

      <!-- 詳細検索ポップアップ -->
      <Transition>
        <AdvancedSearchPopup
          v-if="state.advancedSearchPopupDisplay"
          @close="state.closeAdvancedSearchPopup"
        />
      </Transition>

      <!-- 下書きポップアップ -->
      <Transition>
        <PostDraftPopup
          v-if="state.postDraftPopupDisplay"
          @close="state.closePostDraftPopup"
        />
      </Transition>

      <!-- 招待コード確認ポップアップ -->
      <Transition>
        <InviteCodesPopup
          v-if="state.inviteCodesPopupDisplay"
          @close="state.closeInviteCodesPopup"
        />
      </Transition>

      <!-- アカウントポップアップ -->
      <Transition>
        <AccountPopup
          v-if="state.accountPopupDisplay"
          @close="state.closeAccountPopup"
        />
      </Transition>

      <!-- コンテンツ言語選択ポップアップ -->
      <Transition>
        <SelectLanguagesPopup
          v-if="state.contentLanguagesPopupDisplay"
          :state="state.currentSetting"
          property="contentLanguages"
          title="contentLanguages"
          :hasHelpButton="true"
          @close="state.closeContentLanguagesPopup"
          @change="saveSetting"
        />
      </Transition>

      <!-- タイムフィードポップアップ -->
      <Transition>
        <TimeFeedsPopup
          v-if="state.timeFeedsPopupDisplay"
          @close="state.closeTimeFeedsPopup"
        />
      </Transition>

      <!-- 公式ブックマークポップアップ -->
      <Transition>
        <OfficialBookmarkPopup
          v-if="state.officialBookmarkPopupDisplay"
          @close="state.closeOfficialBookmarkPopup"
        />
      </Transition>

      <!-- カスタムブックマークポップアップ -->
      <Transition>
        <CustomBookmarkPopup
          v-if="state.customBookmarkPopupDisplay"
          @close="state.closeCustomBookmarkPopup"
        />
      </Transition>

      <!-- カスタムブックマーク管理ポップアップ -->
      <Transition>
        <CustomBookmarkManagementPopup
          v-if="state.customBookmarkManagementPopupProps.display"
          v-bind="state.customBookmarkManagementPopupProps"
          @close="state.closeCustomBookmarkManagementPopup"
        />
      </Transition>

      <!-- リポストユーザーリストポップアップ -->
      <Transition>
        <RepostUsersPopup
          v-if="state.repostUsersPopupDisplay"
          @close="state.closeRepostUsersPopup"
        />
      </Transition>

      <!-- 引用リポスト一覧リストポップアップ -->
      <Transition>
        <QuoteRepostsPopup
          v-if="state.quoteRepostsPopupDisplay"
          @close="state.closeQuoteRepostsPopup"
        />
      </Transition>

      <!-- いいねユーザーリストポップアップ -->
      <Transition>
        <LikeUsersPopup
          v-if="state.likeUsersPopupDisplay"
          @close="state.closeLikeUsersPopup"
        />
      </Transition>

      <!-- ラベラー一覧ポップアップ -->
      <Transition>
        <LabelerListPopup
          v-if="state.labelerListPopupProps.display"
          v-bind="state.labelerListPopupProps"
          @close="state.closeLabelerListPopup"
        />
      </Transition>

      <!-- ラベラー設定ポップアップ -->
      <Transition>
        <LabelerSettingsPopup
          v-if="state.labelerSettingsPopupProps.display"
          v-bind="state.labelerSettingsPopupProps"
          @close="state.closeLabelerSettingsPopup"
        />
      </Transition>

      <!-- マイフィードポップアップ -->
      <Transition>
        <MyFeedsPopup
          v-if="state.myFeedsPopupDisplay"
          @close="state.closeMyFeedsPopup"
        />
      </Transition>

      <!-- マイリストポップアップ -->
      <Transition>
        <MyListPopup
          v-if="state.myListPopupDisplay"
          @close="state.closeMyListPopup"
        />
      </Transition>

      <!-- リスト編集ポップアップ -->
      <Transition>
        <ListEditPopup
          v-if="state.listEditPopupProps.display"
          v-bind="state.listEditPopupProps"
          @close="state.closeListEditPopup"
        />
      </Transition>

      <!-- スターターパック編集ポップアップ -->
      <Transition>
        <StarterPackEditPopup
          v-if="state.starterPackEditPopupProps.display"
          v-bind="state.starterPackEditPopupProps"
          @close="state.closeStarterPackEditPopup"
        />
      </Transition>

      <!-- ユーザーリストポップアップ -->
      <Transition>
        <UserListPopup
          v-if="state.userListPopupProps.display"
          v-bind="state.userListPopupProps"
          @close="state.closeUserListPopup"
        />
      </Transition>

      <!-- ワードミュートポップアップ -->
      <Transition>
        <WordMutePopup
          v-if="state.wordMutePopupDisplay"
          @close="state.closeWordMutePopup"
        />
      </Transition>

      <!-- チャット一覧ポップアップ -->
      <Transition>
        <ChatListPopup
          v-if="state.chatListPopupProps.display"
          v-bind="state.chatListPopupProps"
          @close="state.closeChatListPopup"
        />
      </Transition>

      <!-- チャットルームポップアップ -->
      <Transition>
        <ChatConvoPopup
          v-if="state.chatConvoPopupProps.display"
          v-bind="state.chatConvoPopupProps"
          @close="state.closeChatConvoPopup"
        />
      </Transition>

      <!-- チャットメンバー選択ポップアップ -->
      <Transition>
        <ChatMembersSelectPopup
          v-if="state.chatMembersSelectPopupProps.display"
          v-bind="state.chatMembersSelectPopupProps"
          @close="state.closeChatMembersSelectPopup"
        />
      </Transition>

      <!-- 購読ポップアップ -->
      <Transition>
        <ActivitySubscriptionItemPopup
          v-if="
            state.activitySubscriptionItemPopupProps.display &&
            state.activitySubscriptionItemPopupProps.user != null
          "
          :user="state.activitySubscriptionItemPopupProps.user"
          @close="state.closeActivitySubscriptionItemPopup"
        />
      </Transition>

      <!-- 購読一覧ポップアップ -->
      <Transition>
        <ActivitySubscriptionListPopup
          v-if="state.activitySubscriptionListPopupProps.display"
          v-bind="state.activitySubscriptionListPopupProps"
          @close="state.closeActivitySubscriptionListPopup"
        />
      </Transition>

      <!-- 購読許可設定ポップアップ -->
      <Transition>
        <ActivitySubscriptionPermissionPopup
          v-if="state.activitySubscriptionPermissionPopupProps.display"
          v-bind="state.activitySubscriptionPermissionPopupProps"
          @close="state.closeActivitySubscriptionPermissionPopup"
        />
      </Transition>

      <!-- リポストミュートユーザーリストポップアップ -->
      <Transition>
        <RepostMutesPopup
          v-if="state.repostMutesPopupDisplay"
          @close="state.closeRepostMutesPopup"
        />
      </Transition>

      <!-- ミュートユーザーリストポップアップ -->
      <Transition>
        <MutingUsersPopup
          v-if="state.mutingUsersPopupDisplay"
          @close="state.closeMutingUsersPopup"
        />
      </Transition>

      <!-- ブロックユーザーリストポップアップ -->
      <Transition>
        <BlockingUsersPopup
          v-if="state.blockingUsersPopupDisplay"
          @close="state.closeBlockingUsersPopup"
        />
      </Transition>

      <!-- リストユーザー管理ポップアップ -->
      <Transition>
        <ListUserManagementPopup
          v-if="state.listUserManagementPopupProps.display"
          v-bind="state.listUserManagementPopupProps"
          @close="state.closeListUserManagementPopup"
        />
      </Transition>

      <!-- 認証者一覧ポップアップ -->
      <Transition>
        <VerifiersPopup
          v-if="state.verifiersPopupProps.display"
          v-bind="state.verifiersPopupProps"
          @close="state.closeVerifiersPopup"
        />
      </Transition>

      <!-- 認証アカウント一覧ポップアップ -->
      <Transition>
        <VerifiedAccountsPopup
          v-if="state.verifiedAccountsPopupProps.display"
          v-bind="state.verifiedAccountsPopupProps"
          @close="state.closeVerifiedAccountsPopup"
        />
      </Transition>

      <!-- アカウントレポート送信ポップアップ -->
      <Transition>
        <SendAccountReportPopup
          v-if="state.sendAccountReportPopupProps.display"
          :user="state.sendAccountReportPopupProps.user as TTUser"
          @close="state.closeSendAccountReportPopup"
        />
      </Transition>

      <!-- ポストレポート送信ポップアップ -->
      <Transition>
        <SendPostReportPopup
          v-if="state.sendPostReportPopupProps.display"
          :post="state.sendPostReportPopupProps.post as TTPost"
          @close="state.closeSendPostReportPopup"
        />
      </Transition>

      <!-- フィードレポート送信ポップアップ -->
      <Transition>
        <SendFeedReportPopup
          v-if="state.sendFeedReportPopupProps.display"
          :generator="state.sendFeedReportPopupProps.generator as TTFeedGenerator"
          @close="state.closeSendFeedReportPopup"
        />
      </Transition>

      <!-- リストレポート送信ポップアップ -->
      <Transition>
        <SendListReportPopup
          v-if="state.sendListReportPopupProps.display"
          :list="state.sendListReportPopupProps.list as TTList"
          @close="state.closeSendListReportPopup"
        />
      </Transition>

      <!-- イメージポップアップ -->
      <Transition>
        <ImagePopup
          v-if="state.imagePopupProps.display"
          v-bind="state.imagePopupProps"
          @close="state.imagePopupProps.display = false"
        />
      </Transition>

      <!-- ポスト編集ポップアップ -->
      <Transition>
        <EditPostPopup
          v-if="state.editPostPopupProps.display"
          @close="state.closeEditPostPopup"
        />
      </Transition>

      <!-- ポスト送信ポップアップ -->
      <Transition>
        <SendPostPopup
          v-if="state.sendPostPopupProps.display"
          v-show="state.sendPostPopupProps.visibility"
          :action="state.sendPostPopupProps.action"
          :type="state.sendPostPopupProps.type"
          :post="state.sendPostPopupProps.post"
          :text="state.sendPostPopupProps.text"
          :url="state.sendPostPopupProps.url"
          :fileList="state.sendPostPopupProps.fileList"
          :createdAt="state.sendPostPopupProps.createdAt"
          :langs="state.sendPostPopupProps.langs"
          :labels="state.sendPostPopupProps.labels"
          :medias="state.sendPostPopupProps.medias"
          :draftId="state.sendPostPopupProps.draftId"
          :draftReactionControl="state.sendPostPopupProps.draftReactionControl"
          @closeSendPostPopup="closeSendPostPopup as unknown"
        />
      </Transition>

      <!-- ポスト言語選択ポップアップ -->
      <Transition>
        <SelectLanguagesPopup
          v-if="state.postLanguagesPopupDisplay"
          :state="state.currentSetting"
          property="postLanguages"
          title="postLanguages"
          :limit="3"
          @close="state.closePostLanguagesPopup"
          @change="saveSetting"
        />
      </Transition>

      <!-- ラベル選択ポップアップ -->
      <Transition>
        <SelectLabelsPopup
          v-if="state.selectLabelsPopupDisplay"
          :state="state.selectLabelsPopupState"
          @close="state.closeSelectLabelsPopup"
        />
      </Transition>

      <!-- マイワードポップアップ -->
      <Transition>
        <MyWordPopup
          v-if="state.myWordPopupProps.display"
          v-bind="state.myWordPopupProps"
          @close="state.closeMyWordPopup"
        />
      </Transition>

      <!-- ポスト日時選択ポップアップ -->
      <Transition>
        <SelectDatePopup
          v-if="state.postDatePopupDisplay"
          :date="state.postDatePopupDate"
          textTitle="postDatePopupTitle"
          textDescription="postDatePopupDescription"
          textReset="postDatePopupReset"
          textResetDescription="postDatePopupResetDescription"
          @close="state.closePostDatePopup"
          @onChange="(params: any) => { state.postDatePopupDate = params }"
        />
      </Transition>

      <!-- 反応制御ポップアップ -->
      <Transition>
        <ReactionControlPopup
          v-if="state.reactionControlPopupProps.display"
          v-bind="state.reactionControlPopupProps"
          @close="state.closeReactionControlPopup as unknown"
        />
      </Transition>

      <!-- 設定 - 説明用HTMLポップアップ -->
      <Transition>
        <HtmlPopup
          v-if="state.htmlPopupProps.display"
          :title="`${$t('help')} - ${$t(state.htmlPopupProps.type)}`"
          @close="state.closeHtmlPopup"
        >
          <template v-if="state.htmlPopupProps.type === 'contentLanguages'">
            <ul class="bullet-points">
              <li>{{ $t("contentLanguagesDetail1") }}</li>
              <li>{{ $t("contentLanguagesDetail2") }}</li>
              <li>{{ $t("contentLanguagesDetail3") }}</li>
              <li>{{ $t("contentLanguagesDetail4") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'postLanguages'">
            <ul class="bullet-points">
              <li>{{ $t("postLanguagesDetail1") }}</li>
              <li>{{ $t("postLanguagesDetail2") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'autoTranslation'">
            <ul class="bullet-points">
              <li>{{ $t("autoTranslationRemarks1") }}</li>
              <li>{{ $t("autoTranslationRemarks2") }}</li>
              <li>{{ $t("autoTranslationRemarks3") }}</li>
              <li>
                <a class="textlink" href="https://mymemory.translated.net/" rel="noreferrer" target="_blank">
                  <span>{{ $t("autoTranslationRemarks4") }}</span>
                </a>
              </li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'autoTranslationIgnoreLanguage'">
            <ul class="bullet-points">
              <li>
                <a class="textlink" href="https://en.wikipedia.org/wiki/List_of_ISO_639-1_codes" rel="noreferrer" target="_blank">
                  <span>List of ISO 639-1 codes</span>
                </a>
              </li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'backgroundImage'">
            <ul class="bullet-points">
              <li>{{ $t("backgroundImage1") }}</li>
              <li>{{ $t("backgroundImage2") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'feedControl'">
            <ul class="bullet-points">
              <li>{{ $t("feedControlDescription") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'lightning'">
            <ul class="bullet-points">
              <li>{{ $t("lightningDescription") }}</li>
            </ul>
          </template>

          <template v-else-if="state.htmlPopupProps.type === 'post'">
            <ul class="bullet-points">
              <li>{{ $t("sendPostNotification1") }}</li>
              <li>{{ $t("sendPostNotification2") }}</li>
              <li>{{ $t("sendPostNotification3") }}</li>
              <li>{{ $t("sendPostNotification4") }}</li>
              <li>{{ $t("sendPostNotification5") }}</li>
            </ul>
          </template>
        </HtmlPopup>
      </Transition>

      <PasteFiles />

      <DropFiles ref="dropFiles" />

      <!-- ログインポップアップ -->
      <Transition>
        <LoginPopup
          v-if="state.loginPopupAutoDisplay"
          ref="loginPopup"
          @signUp="signUp as unknown"
          @login="manualLogin as unknown"
          @oauthLogin="oauthLogin"
        />
      </Transition>

      <!-- メッセージポップアップ -->
      <Transition>
        <MessagePopup
          v-if="state.messagePopupProps.display"
          @close="state.closeMessagePopup"
        />
      </Transition>

      <!-- 確認ポップアップ -->
      <Transition>
        <ConfirmationPopup
          v-if="state.confirmationPopupProps.display"
          @close="state.closeConfirmationPopup"
          @apply="state.applyConfirmationPopup"
        />
      </Transition>

      <!-- エラーポップアップ -->
      <Transition>
        <ErrorPopup
          v-if="state.errorPopupProps.display"
          :error="state.errorPopupProps.error"
          :description="state.errorPopupProps.description"
          @close="state.closeErrorPopup"
        />
      </Transition>
    </div>

    <!-- 進捗ポップアップ -->
    <ProgressPopup
      v-if="state.progressPopupDisplay"
      v-bind="state.progressPopupProps"
    />

    <!-- 全画面ローダー -->
    <Loader
      v-if="state.loaderDisplay"
      class="fullscreen-loader"
    />

    <!-- スプラッシュスクリーン -->
    <SplashScreen />
  </div>
</template>

<style lang="scss" scoped>
.main-view {
  // ポップアップの重なり調整
  @for $i from 2 through 8 {
    $margins: (
      2: 1,
      3: 1.5,
      4: 2,
      5: 2.5,
      6: 3,
      7: 3.5,
      8: 4
    );
    &:deep() .popup-container > div:nth-of-type(#{$i}) {
      &.popup-overlay,
      & > .popup-overlay {
        & > .popup {
          --margin: #{map.get($margins, $i)}rem;
        }
      }
    }
  }

  // メインエリア
  &__main {
    display: flex;
    justify-content: center;
    margin: auto;
    position: relative;
    z-index: 1;
    max-width: $max-width;
    min-height: 100vh;

    // SPレイアウト
    @include media-sp-layout() {
      padding-bottom: var(--sp-menu-height);
    }
  }

  // スクロールボタン用処理
  &:deep() .scroll-button {
    @media (max-width: #{$max-width-with-scrollbar + 64px}) {
      display: none;
    }
  }
}

// 壁紙
.background-image {
  background-position: center center;
  background-repeat: no-repeat;
  background-size: cover;
  pointer-events: none;
  position: fixed;
  left: 0;
  top: 0;
  z-index: 0;
  width: 100%;
  height: 100vh;
}

// メインメニュー
// PC用メニュー
.main-menu-vertical-wrapper,
.main-menu-vertical {
  // タブレットレイアウト
  @include media-tablet-layout() {
    min-width: $main-menu-min-width;
    max-width: $main-menu-min-width;
  }

  // フルレイアウト
  @include media-full-layout() {
    min-width: $menu-max-width;
    max-width: $menu-max-width;
  }
}

// メインメニュー
.main-menu-vertical-wrapper {
  // BORDERED_DESIGN: border-right: 1px solid rgb(var(--fg-color), 0.25);
  overflow: hidden;
  position: relative;

  // SPレイアウト
  @include media-sp-layout() {
    display: none;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100%;
  }
}

// SP用メニュー
.main-menu-horizontal-wrapper {
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
  position: fixed;
  bottom: -1px;
  left: 0;
  z-index: 3;
  width: 100%;

  // 非SPレイアウト
  @include media-not-sp-layout() {
    display: none;
  }
}

// ルータービュー
.router-view-wrapper {
  background-color: rgb(var(--bg-color), var(--main-area-opacity));
  @include media-not-sp-layout() {
    // BORDERED_DESIGN: border-right: 1px solid rgb(var(--fg-color), 0.25);
  }
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-x: clip;
  max-width: $router-view-width;

  // SPレイアウト
  @include media-sp-layout() {
    max-width: 100%;
  }

  // ルータービューヘッダー
  &__header {
    background-color: rgb(var(--bg-color), var(--main-area-opacity));
    // BORDERED_DESIGN: border-bottom: 1px solid rgb(var(--fg-color), 0.25);
    display: grid;
    position: sticky;
    top: 0;
    z-index: 2;
    width: 100%;
    &:empty {
      display: none;
    }

    // SPでルータービューヘッダーの上部に隙間が生じる不具合対策
    &::before {
      background-color: rgb(var(--bg-color), var(--main-area-opacity));
      content: "";
      display: block;
      margin-top: -1px;
      width: 100%;
      height: 1px;
    }
  }
}

// サブメニュー
.sub-menu-wrapper {
  overflow: hidden;
  position: relative;
  min-width: $menu-max-width;
  max-width: $menu-max-width;

  // サブメニュー非表示レイアウト
  @include media-hide-sub-menu-layout() {
    display: none;
  }

  &__inner {
    display: flex;
    flex-direction: column;
    position: fixed;
    height: 100%;
  }

  .sub-menu {
    min-width: $menu-max-width;
    max-width: $menu-max-width;
    height: 100%;
  }
}

// 中央ローダー
.center-loader {
  margin: 0 auto;
  position: fixed;
  left: 0;
  right: 0;
  max-width: $router-view-width;
}

// 全画面ローダー
.fullscreen-loader {
  position: fixed;
}
</style>
