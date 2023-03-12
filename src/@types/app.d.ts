type MainState = {
  atp: any;
  mounted: boolean;
  hasLogin: boolean;
  error: any;
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
  updateProfile: Function;
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
