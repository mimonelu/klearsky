import type { Feed, Profile } from "@/types/atp"

export type MainState = {
  atp: any;
  mounted: boolean;
  hasLogin: boolean;
  error: any;
  timelineFeeds: Array<Feed>;
  timelineCursor?: string;
  currentProfile: Profile;
  pageFeeds: null | Array<Feed>;
  pageCursor: null | string;
  processing: boolean;
}
