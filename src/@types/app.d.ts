import type { LocationQuery } from "vue-router"
import type { Feed, Profile } from "@/types/atp"

export type MainState = {
  atp: any;
  mounted: boolean;
  hasLogin: boolean;
  error: any;
  timelineFeeds: Array<Feed>;
  timelineCursor?: string;
  userProfile: Profile;
  currentProfile: Profile;
  pageFeeds: null | Array<Feed>;
  pageCursor: null | string;
  fetchFeeds: Function;
  fetchUserProfile: Function;
  fetchCurrentAuthorFeed: Function;
  isUserProfile: boolean;
  query: LocationQuery;
  processing: boolean;
}
