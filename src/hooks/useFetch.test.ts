// @vitest-environment jsdom
import { renderHook, act, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach, test } from "vitest";
import { useFetch } from "./useFetch";

test("temp", () => {

});

/* const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
  })
}));

describe.skip("useFetch", () => {

  beforeEach(() => {
    vi.resetAllMocks();
  });

  it("initializes with default state", () => {
    const { result } = renderHook(() =>
      useFetch("/api/test")
    );

    expect(result.current.data).toBeNull();
    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
  });

  it("performs GET request successfully", async () => {
    getToken.mockResolvedValue("token123");

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
        message: "ok",
      }),
    });

    const { result } = renderHook(() =>
      useFetch("/api/test")
    );

    let res;

    await act(async () => {
      res = await result.current.refetch();
    });

    expect(fetch).toHaveBeenCalledWith("/api/test", {
      method: "GET",
      headers: {
        Authorization: "Bearer token123",
      },
      body: undefined,
    });

    expect(res).toEqual({
      success: true,
      message: "ok",
    });

    expect(result.current.data).toEqual(res);
  });

  it("handles API failure", async () => {
    getToken.mockResolvedValue("token123");

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: false,
        message: "failed",
      }),
    });

    const { result } = renderHook(() =>
      useFetch("/api/test")
    );

    await act(async () => {
      await result.current.refetch();
    });

    expect(result.current.error).toBe("failed");
    expect(result.current.data).toBeNull();
  });

  it("redirects when response object contains redirect prop", async () => {
    getToken.mockResolvedValue("token123");
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ redirect: "/test" }),
    });
    const { result } = renderHook(() => useFetch("/api/test"));
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => {
      expect(mockPush).toHaveBeenCalledExactlyOnceWith("/test");
    });
  });

  it("does not redirect if url is relative", async () => {
    getToken.mockResolvedValue("token123");
    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({ redirect: "test" }),
    });
    const { result } = renderHook(() => useFetch("/api/test"));
    await act(async () => {
      await result.current.refetch();
    });
    await waitFor(() => {
      expect(mockPush).not.toHaveBeenCalled();
    });
  });

  it("sends POST request with body", async () => {
    getToken.mockResolvedValue("token123");

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
      }),
    });

    const { result } = renderHook(() =>
      useFetch("/api/test")
    );

    await act(async () => {
      await result.current.refetch({ name: "test" });
    });

    expect(fetch).toHaveBeenCalledWith("/api/test", {
      method: "POST",
      headers: {
        Authorization: "Bearer token123",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "test" }),
    });
  });

  it("sends PUT request", async () => {
    getToken.mockResolvedValue("token123");

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
      }),
    });

    const { result } = renderHook(() =>
      useFetch("/api/test")
    );

    await act(async () => {
      await result.current.refetch({ name: "test" }, "PUT");
    });

    expect(fetch).toHaveBeenCalledWith("/api/test", {
      method: "PUT",
      headers: {
        Authorization: "Bearer token123",
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name: "test" }),
    });
  });

  it("sends DELETE request", async () => {
    getToken.mockResolvedValue("token123");

    global.fetch = vi.fn().mockResolvedValue({
      json: async () => ({
        success: true,
      }),
    });

    const { result } = renderHook(() =>
      useFetch("/api/test")
    );

    await act(async () => {
      await result.current.refetch("123");
    });

    expect(fetch).toHaveBeenCalledWith("/api/test", {
      method: "DELETE",
      headers: {
        Authorization: "Bearer token123",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ id: "123" }),
    });
  });

}); */