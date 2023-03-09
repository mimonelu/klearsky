import type { Feed } from "@/types/atp"

export type MainState = {
  atp: any;
  mounted: boolean;
  hasLogin: boolean;
  error: any;
  timelineFeeds: Array<Feed>;
  timelineCursor?: string;
  pageFeeds: null | Array<Feed>;
  processing: boolean;
}
