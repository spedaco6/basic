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

  // Headers instances don't expose their contents as plain enumerable
  // properties, so expect.objectContaining/toEqual against a plain object
  // won't work against them — pull out the actual Headers instance sent to
  // fetch and inspect it via .get() instead.
  function getLastFetchHeaders(): Headers {
    const fetchMock = globalThis.fetch as unknown as ReturnType<typeof vi.fn>;
    const lastCall = fetchMock.mock.calls[fetchMock.mock.calls.length - 1];
    const options = lastCall[1] as RequestInit;
    return options.headers instanceof Headers
      ? options.headers
      : new Headers(options.headers);
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
      })
    );
    expect(getLastFetchHeaders().get("Content-Type")).toBe("application/json");
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
      expect.objectContaining({})
    );
    const headers = getLastFetchHeaders();
    expect(headers.get("Authorization")).toBe("Bearer token123");
    expect(headers.get("X-Custom-Client")).toBe("SpedacoBasic");
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
      })
    );
    const headers = getLastFetchHeaders();
    expect(headers.get("Authorization")).toBe("Bearer token123");
    expect(headers.get("Content-Type")).toBe("application/json"); // Checked that merging occurs smoothly
  });

  test("generic type parameter is threaded through to data's type (compile-time check)", async () => {
    type User = { id: number; name: string };
    mockFetchResponse(200, { success: true, data: { id: 1, name: "Alice" } });
    const { result } = renderHook(() => useFetch<User>("/api/users", true));

    await act(async () => {
      await new Promise((resolve) => setTimeout(resolve, 0));
    });

    // If UseFetchResult weren't generic, this line would fail to type-check
    // (data?.data would still be Record<string, any>), failing the whole
    // test file at compile time rather than at a runtime assertion.
    const typedData: User | User[] | undefined = result.current.data?.data;
    expect(typedData).toEqual({ id: 1, name: "Alice" });
  });

  test("accepts initHeaders as a Headers instance", async () => {
    mockFetchResponse(200, { success: true });
    const instanceHeaders = new Headers({ Authorization: "Bearer from-instance" });
    const { result } = renderHook(() => useFetch("/api/secure", false, instanceHeaders));

    await act(async () => {
      await result.current.refetch();
    });

    expect(getLastFetchHeaders().get("Authorization")).toBe("Bearer from-instance");
  });

  test("accepts initHeaders as a [key, value][] tuple array", async () => {
    mockFetchResponse(200, { success: true });
    const tupleHeaders: [string, string][] = [["Authorization", "Bearer from-tuples"]];
    const { result } = renderHook(() => useFetch("/api/secure", false, tupleHeaders));

    await act(async () => {
      await result.current.refetch();
    });

    expect(getLastFetchHeaders().get("Authorization")).toBe("Bearer from-tuples");
  });

  test("clears data immediately when a new refetch starts, before the response resolves", async () => {
    mockFetchResponse(200, { success: true, data: "initial" });
    const { result } = renderHook(() => useFetch("/api/action"));
    await act(async () => {
      await result.current.refetch();
    });
    expect(result.current.data).toEqual({ success: true, data: "initial" });

    let resolveFetch: (value: any) => void = () => {};
    const pending = new Promise((resolve) => { resolveFetch = resolve; });
    vi.stubGlobal("fetch", vi.fn().mockReturnValue(pending));

    act(() => {
      result.current.refetch();
    });

    expect(result.current.data).toBeNull();

    await act(async () => {
      resolveFetch({ status: 200, json: async () => ({ success: true, data: "final" }) });
      await pending;
    });
  });

  test("does not leak Content-Type from a POST call into a later GET call", async () => {
    mockFetchResponse(200, { success: true });
    const { result } = renderHook(() => useFetch("/api/users"));

    await act(async () => {
      await result.current.refetch({ name: "Bob" });
    });
    expect(getLastFetchHeaders().get("Content-Type")).toBe("application/json");

    await act(async () => {
      await result.current.refetch();
    });
    expect(getLastFetchHeaders().get("Content-Type")).toBeNull();
  });

  test("refetch stays referentially stable across renders when initHeaders content is unchanged, even with a fresh object literal", () => {
    const { result, rerender } = renderHook(
      ({ headers }) => useFetch("/api/users", false, headers),
      { initialProps: { headers: { Authorization: "Bearer abc" } } }
    );
    const firstRefetch = result.current.refetch;

    // Fresh object literal, identical content — refetch should NOT change.
    rerender({ headers: { Authorization: "Bearer abc" } });
    expect(result.current.refetch).toBe(firstRefetch);

    // Genuinely different content — refetch SHOULD change.
    rerender({ headers: { Authorization: "Bearer different" } });
    expect(result.current.refetch).not.toBe(firstRefetch);
  });

});