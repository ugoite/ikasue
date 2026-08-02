import type { CommitDetail, LayoutRequestDetail } from "./types";

export const LAYOUT_REQUEST_EVENT = "ikasue:layout-request";
export const COMMIT_EVENT = "ikasue:commit";

export function dispatchLayoutRequest(
  target: EventTarget,
  detail: LayoutRequestDetail,
): boolean {
  return target.dispatchEvent(
    new CustomEvent<LayoutRequestDetail>(LAYOUT_REQUEST_EVENT, {
      bubbles: true,
      detail,
    }),
  );
}

export function dispatchCommit(
  target: EventTarget,
  detail: CommitDetail,
): boolean {
  return target.dispatchEvent(
    new CustomEvent<CommitDetail>(COMMIT_EVENT, {
      bubbles: true,
      detail,
    }),
  );
}
