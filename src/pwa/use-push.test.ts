import { describe, expect, it } from "vitest";
import { pushKeyBytes, samePushKey } from "./use-push";

const KEY = "BJllsl1npBM4eq16f6bkpqaSuL4vyna5Eru9x6sacUHCi9YWmDWpV0X4lhRIfXWSax-s3XYJ7LIzFdbIDeV-eI4";

describe("push key", () => {
  it("base64url 공개키는 65바이트 P-256 점이다", () => {
    const bytes = pushKeyBytes(KEY);
    expect(bytes.length).toBe(65);
    expect(bytes[0]).toBe(4);
  });
  it("같은 키로 만든 구독만 쓸 수 있다", () => {
    expect(samePushKey(pushKeyBytes(KEY).buffer, KEY)).toBe(true);
    const other = pushKeyBytes(KEY);
    other[10] ^= 1;
    expect(samePushKey(other.buffer, KEY)).toBe(false);
    expect(samePushKey(null, KEY)).toBe(true); // 키를 안 알려주는 브라우저는 믿는다
  });
});
