import { renderHook } from "@testing-library/react";
import { afterEach, describe, expect, test, vi } from "vitest";
import * as useIdModule from "./useId";
import { useId } from "./useId";
import { mockUseId } from "./useId.mock";

describe("useId", () => {
  describe("with a custom id", () => {
    test("returns the custom id unchanged", () => {
      const { result } = renderHook(() => useId("my-id"));
      expect(result.current).toBe("my-id");
    });

    test("ignores the label when a custom id is given", () => {
      const { result } = renderHook(() => useId("my-id", "button"));
      expect(result.current).toBe("my-id");
    });
  });

  describe("without a custom id", () => {
    test("generates a non-empty id when given no arguments", () => {
      const { result } = renderHook(() => useId());
      expect(typeof result.current).toBe("string");
      expect(result.current.length).toBeGreaterThan(0);
    });

    test("prefixes the generated id with the label", () => {
      const { result } = renderHook(() => useId(undefined, "button"));
      expect(result.current).toMatch(/^button_.+/);
    });

    test("treats an empty-string custom id as missing", () => {
      const { result } = renderHook(() => useId("", "input"));
      expect(result.current).toMatch(/^input_.+/);
    });

    test("is stable across re-renders", () => {
      const { result, rerender } = renderHook(() => useId(undefined, "form"));
      const first = result.current;
      rerender();
      expect(result.current).toBe(first);
    });

    test("is unique between separate hook instances", () => {
      const a = renderHook(() => useId(undefined, "input"));
      const b = renderHook(() => useId(undefined, "input"));
      expect(a.result.current).not.toBe(b.result.current);
    });
  });
});

describe("mockUseId", () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  test("mirrors the real hook with a deterministic auto id", () => {
    const { spy } = mockUseId();

    expect(useIdModule.useId("custom", "button")).toBe("custom");
    expect(useIdModule.useId(undefined, "button")).toBe("button_mockId");
    expect(useIdModule.useId()).toBe("mockId");
    expect(spy).toHaveBeenCalledTimes(3);
  });

  test("accepts a custom auto id", () => {
    mockUseId({ autoId: "abc" });
    expect(useIdModule.useId(undefined, "input")).toBe("input_abc");
  });

  test("returnValue overrides all arguments", () => {
    mockUseId({ returnValue: "fixed" });
    expect(useIdModule.useId("custom", "button")).toBe("fixed");
  });

  test("updateMock changes output mid-test", () => {
    const { updateMock } = mockUseId();
    updateMock({ autoId: "next" });
    expect(useIdModule.useId(undefined, "form")).toBe("form_next");
  });
});
