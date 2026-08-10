export type IkaErrorCode =
  | "registry-unavailable"
  | "registry-conflict"
  | "invalid-contract"
  | "unknown-view-kind";

export class IkaSueError extends Error {
  override readonly name = "IkaSueError";
  readonly code: IkaErrorCode;

  constructor(code: IkaErrorCode, message: string) {
    super(message);
    this.code = code;
  }
}
