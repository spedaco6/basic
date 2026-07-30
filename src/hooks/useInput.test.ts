import { act, renderHook } from "@testing-library/react";
import { afterEach, afterAll, describe, expect, test, vi } from "vitest";
import { useFetch } from "./useFetch";

describe("useFetch", () => {
  afterEach(() => {
    // Completely clear all global overrides and mocks between tests
    vi.unstubAllGlobals();
    vi.clearAllMocks();
  });

  afterAll(() => {
    vi.restoreAllMocks();
  });

  function mockFetchResponse(status: number, data: object) {
    const mockResponse = {
      status,
      json: async () => data,
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));
  }

  function mockFetchFailure(errorMessage: string) {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new Error(errorMessage)));
  }

  test("should not fire immediately if callImmediately is false", () => {
    const fetchSpy = vi.fn();
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(() => useFetch("/api/users", false));

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(fetchSpy).not.toHaveBeenCalled();
  });

  test("should fire instantly if callImmediately is true", async () => {
    const mockData = { success: true, data: { id: 1, name: "Alice" } };
    mockFetchResponse(200, mockData);

    const { result } = renderHook(() => useFetch("/api/users", true));

    expect(result.current.loading).toBe(true);

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    expect(result.current.loading).toBe(false);
    expect(result.current.data).toEqual(mockData);
    expect(result.current.error).toBeNull();
  });

  test("should correctly execute a GET request with query params via refetch", async () => {
    const mockData = { success: true, data: [] };
    mockFetchResponse(200, mockData);

    const { result } = renderHook(() => useFetch("/api/users"));

    await act(async () => {
      await result.current.refetch("?page=2&limit=10");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/users?page=2&limit=10",
      expect.objectContaining({ method: "GET" })
    );
    expect(result.current.data).toEqual(mockData);
  });

  test("should execute a POST request when an object body is sent", async () => {
    mockFetchResponse(200, { success: true });
    const { result } = renderHook(() => useFetch("/api/users"));

    const payload = { name: "Bob" };
    await act(async () => {
      await result.current.refetch(payload);
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/users",
      expect.objectContaining({
        method: "POST",
        body: JSON.stringify(payload),
        headers: { "Content-Type": "application/json" },
      })
    );
  });

  test("should support overriding method types (e.g., PUT)", async () => {
    mockFetchResponse(200, { success: true });
    const { result } = renderHook(() => useFetch("/api/users/1"));

    const payload = { name: "Charlie" };
    await act(async () => {
      await result.current.refetch(payload, "PUT");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/users/1",
      expect.objectContaining({ method: "PUT" })
    );
  });

  test("should trigger a DELETE method block safely", async () => {
    mockFetchResponse(200, { success: true });
    const { result } = renderHook(() => useFetch("/api/users/1"));

    await act(async () => {
      await result.current.refetch("DELETE");
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/users/1",
      expect.objectContaining({ method: "DELETE", body: undefined })
    );
  });

  test("should abort previous running request when a new refetch occurs", async () => {
    const signalTracker: AbortSignal[] = [];

    const fetchSpy = vi.fn().mockImplementation((_url, options) => {
      if (options?.signal) signalTracker.push(options.signal);
      
      return new Promise((resolve, reject) => {
        // If it's already aborted or gets aborted, trigger the rejection immediately
        if (options?.signal?.aborted) {
          const abortError = new Error("The user aborted a request.");
          abortError.name = "AbortError";
          return reject(abortError);
        }
        
        options?.signal?.addEventListener("abort", () => {
          const abortError = new Error("The user aborted a request.");
          abortError.name = "AbortError";
          reject(abortError);
        });

        // FIX 1: Immediately resolve the SECOND request so the test loop can finish safely
        if (signalTracker.length === 2) {
          resolve({
            status: 200,
            json: async () => ({ success: true, data: "latest-data" })
          });
        }
      });
    });
    vi.stubGlobal("fetch", fetchSpy);

    const { result } = renderHook(() => useFetch("/api/users"));

    // Call first time (will hang until aborted)
    act(() => {
      result.current.refetch();
    });

    // Call second time (forces the abort on the first, and resolves immediately)
    await act(async () => {
      await result.current.refetch();
    });

    expect(signalTracker.length).toBe(2);
    expect(signalTracker[0].aborted).toBe(true);
    expect(signalTracker[1].aborted).toBe(false);
    expect(result.current.error).toBeNull();
  });

  test("should set error state correctly when server success parameter evaluates false", async () => {
    mockFetchResponse(200, { success: false, message: "Invalid parameters input" });
    const { result } = renderHook(() => useFetch("/api/action"));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe("Invalid parameters input");
    expect(result.current.data).toBeNull();
  });

  test("should fallback to generic runtime failure string during network drops", async () => {
    mockFetchFailure("Connection Drop");
    const { result } = renderHook(() => useFetch("/api/action"));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe("Connection Drop");
  });

  test("should clear all state pipelines back to baseline when reset is explicitly invoked", async () => {
    mockFetchResponse(200, { success: true, data: "test" });
    const { result } = renderHook(() => useFetch("/api/reset-target"));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.data).not.toBeNull();

    act(() => {
      result.current.reset();
    });

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });
});
