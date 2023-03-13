declare module "*.vue";
declare module "crypto-js";

declare module "@/composables/*";

type MainState = {
  atp: any;
  mounted: boolean;
  hasLogin: boolean;
  timelineFeeds: Array<Feed>;
  timelineCursor?: string;
  userProfile: null | Profile;
  currentProfile: null | Profile;
  pageFeeds: null | Array<Feed>;
  pageCursor: null | string;
  fetchFeeds: Function;
  fetchUserProfile: Function;
  fetchCurrentProfile: Function;
  fetchCurrentAuthorFeed: Function;
  updateUserProfile: Function;
  openSendPostPopup: Function;
  sendPostPopupProps: {
    visibility: boolean;
    type: string;
    post: null | Post;
  };
  isUserProfile: boolean;
  query: LocationQuery;
  processing: boolean;
}
