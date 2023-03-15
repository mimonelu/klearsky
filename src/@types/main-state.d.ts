type MainState = {
  atp: AbstractAtpWrapper;
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
  createFollow: (did: string, declarationCid: string) => Promise<void>;
  deleteFollow: (uri: string) => Promise<void>;
  query: LocationQuery;
  processing: boolean;
}
