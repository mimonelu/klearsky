declare module "*.vue";
declare module "crypto-js";
declare module "@/composables/*";

type MainState = {
  atp: any;// TODO:
  mounted: boolean;
  hasLogin: boolean;
  timelineFeeds: Array<Feed>;
  timelineCursor?: string;
  userProfile: null | Profile;
  currentProfile: null | Profile;
  pageFeeds: null | Array<Feed>;
  pageCursor: null | string;
  currentCursor: null | string;
  currentUsers: null | Array<Following> | Array<Follower>;
  fetchFeeds: Function;
  fetchUserProfile: Function;
  fetchCurrentProfile: Function;
  fetchCurrentAuthorFeed: Function;
  updateUserProfile: Function;
  openSendPostPopup: Function;
  sendPostPopupProps: {
    visibility: boolean;
    type: "post" | "reply" | "repost";
    post: null | Post;
  };
  isUserProfile: boolean;
  follow: (did: string, declarationCid: string) => Promise<void>;
  unfollow: (uri: string) => Promise<void>;
  query: LocationQuery;
  processing: boolean;
}
