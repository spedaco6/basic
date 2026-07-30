import { act, renderHook } from "@testing-library/react";
import { afterEach, afterAll, describe, expect, test, vi } from "vitest";
import { useFetch } from "./useFetch";

describe("useFetch", () => {
  afterEach(() => {
    // Clear call histories and global state setups between tests
    vi.clearAllMocks();
  });

  afterAll(() => {
    // Put everything back to normal once the entire file finishes
    vi.restoreAllMocks();
  });

  // Helper utility to mock global fetch responses cleanly
  function mockFetchResponse(status: number, data: object) {
    const mockResponse = {
      status,
      json: async () => data,
    };
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue(mockResponse));
  }

  // Helper utility to mock complete network structural rejections
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

    // Initially should show loading
    expect(result.current.loading).toBe(true);

    // Yield control so async fetch returns data
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

  test("should set error state correctly when server success parameter evaluates false", async () => {
    mockFetchResponse(400, { success: false, message: "Invalid payload parameters" });
    const { result } = renderHook(() => useFetch("/api/action"));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe("Invalid payload parameters");
    expect(result.current.data).toBeNull();
  });

  test("should fallback to generic runtime failure string during hardware or network drops", async () => {
    mockFetchFailure("Network Timeout");
    const { result } = renderHook(() => useFetch("/api/action"));

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe("Network Timeout");
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
    test("should pass custom headers provided during initialization", async () => {
    mockFetchResponse(200, { success: true });
    
    const customHeaders = { "Authorization": "Bearer token123", "X-Custom-Client": "SpedacoBasic" };
    
    // Instantiate hook with custom configurations
    const { result } = renderHook(() => useFetch("/api/secure", false, customHeaders));

    await act(async () => {
      await result.current.refetch();
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/secure",
      expect.objectContaining({
        headers: expect.objectContaining({
          "Authorization": "Bearer token123",
          "X-Custom-Client": "SpedacoBasic"
        })
      })
    );
  });

  test("should merge initialization headers with automatic JSON content-type during POST payloads", async () => {
    mockFetchResponse(200, { success: true });
    
    const customHeaders = { "Authorization": "Bearer token123" };
    const { result } = renderHook(() => useFetch("/api/secure", false, customHeaders));

    await act(async () => {
      await result.current.refetch({ data: "payload" });
    });

    expect(globalThis.fetch).toHaveBeenCalledWith(
      "/api/secure",
      expect.objectContaining({
        method: "POST",
        headers: expect.objectContaining({
          "Authorization": "Bearer token123",
          "Content-Type": "application/json" // Checked that merging occurs smoothly
        })
      })
    );
  });

});
