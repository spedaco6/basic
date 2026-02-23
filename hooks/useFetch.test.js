// @vitest-environment jsdom

import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import { useFetch } from "./useFetch";
import { act, renderHook, waitFor } from "@testing-library/react";

const mockGet = vi.fn().mockResolvedValue(new Response(JSON.stringify({ test: "value" })));

describe("useFetch", () => {
  beforeEach(() => vi.clearAllMocks());

  test("data returns, loading is false, and error is empty on success", async () => {
    const { result } = renderHook(() => useFetch(mockGet));
    await waitFor(() => {
      expect(result.current.data).toStrictEqual({ test: "value" });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("");
      expect(mockGet).toHaveBeenCalledOnce();
    });
  });

  test("loading is true while fetching", async () => {
    mockGet.mockImplementation(() => new Promise(res => {
      resolveFetch = res;
    }));
    let result;
    await waitFor(() => {
      ({ result } = renderHook(() => useFetch(mockGet)));
      expect(result.current.loading).toBe(true);
      expect(result.current.error).toBe("");
    });
  });

  test("bad response results in error message, loading false, and no data", async () => {
    mockGet.mockImplementationOnce(() => new Response(JSON.stringify({ message: "Problem" }), { status: 500 }));
    const { result } = renderHook(() => useFetch(mockGet));
    await waitFor(() => {
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("Problem");
      expect(result.current.data).toBeDefined();
      expect(mockGet).toHaveBeenCalledOnce();
    });
  });

  test("refetch calls original fetch function with args", async () => {
    const { result } = renderHook(() => useFetch(mockGet));
    await waitFor(() => {
      result.current.refetch("arg1", 2);
    })
    expect(mockGet).toHaveBeenCalledTimes(2);
    const call = mockGet.mock.calls[1];
    expect(call).toStrictEqual(["arg1", 2]);
  });
  
  test("fetch function called automatically", async () => {
    await waitFor(() => {
      renderHook(() => useFetch(mockGet));
    });
    expect(mockGet).toHaveBeenCalledOnce();
  });

  test("fetch function not called automatically if immediate is set to false", () => {
    renderHook(() => useFetch(mockGet, {}, { immediate: false }));
    expect(mockGet).not.toHaveBeenCalled();
  });

  test("clearError sets error to empty string", async () => {
    mockGet.mockImplementationOnce(() => new Response({ message: "Problem" }, { status: 500 }));
    const { result } = renderHook(() => useFetch(mockGet));
    await waitFor(() => {
      result.current.clearError();
      expect(result.current.error).toBe("");
    });
  });
  
  test("reset sets everything back to default conditions", async () => {
    mockGet.mockImplementationOnce(() => new Response(JSON.stringify({ 
      test: "value", message: "error" 
    }), { status: 500}));
    const { result } = renderHook(() => useFetch(mockGet));
    await waitFor(() => {
      expect(result.current.data).toStrictEqual({ test: "value", message: "error" });
      expect(result.current.loading).toBe(false);
      expect(result.current.error).toBe("error");
      expect(mockGet).toHaveBeenCalledOnce();
    });
    await waitFor(() => {
      result.current.reset();
      expect(result.current.data).toStrictEqual({});
      expect(result.current.error).toStrictEqual("");
    });
  });
});