import { afterAll, beforeEach, describe, expect, MockInstance, test, vi } from "vitest";
import { act, renderHook } from "@testing-library/react";
import { usePagination } from "./usePagination";

describe("usePagination", () => {
  let storageSpy: any;
  beforeEach(() => {
    sessionStorage.clear();
    storageSpy = vi.spyOn(Storage.prototype, "setItem");
  });
  afterAll(() => {
    vi.restoreAllMocks();
  })

  test("onChangeLimit sets item in sessionStorage", () => {
    const { result } = renderHook(() => usePagination(23));
    act(() => result.current.onChangeLimit(50));
    expect(storageSpy).toHaveBeenCalledTimes(2);
    expect(storageSpy).lastCalledWith("perPage", "50");
  });

  test("result defines all UsePaginationResult options when no argument is provided", () => {  
    const { result } = renderHook(() => usePagination());
    expect(result.current).toHaveProperty("searchParams", "?page=1&limit=10&order=asc&sort=id&search=");
    expect(result.current).toHaveProperty("search", "");
    expect(result.current).toHaveProperty("page", 1);
    expect(result.current).toHaveProperty("limit", 10);
    expect(result.current).toHaveProperty("sort", "id");
    expect(result.current).toHaveProperty("order", "asc");
    expect(result.current).toHaveProperty("totalItems", 0);
    expect(result.current).toHaveProperty("hasNextPage", false);
    expect(result.current).toHaveProperty("hasPrevPage", false);
    expect(result.current).toHaveProperty("firstRecordDisplaying", 0);
    expect(result.current).toHaveProperty("lastRecordDisplaying", 0);
  });

  test.each([
    [0, false, false, 0, 0],
    [10, false, false, 1, 10],
    [15, true, false, 1, 10],
    [20, true, false, 1, 10],
    [29, true, false, 1, 10],
    [30, true, false, 1, 10],
    [31, true, false, 1, 10],
  ])("total (%s) defines all UsePaginationResult options", (total, hasNext, hasPrev, first, last) => {  
    const { result } = renderHook(() => usePagination(total));
    const searchParams = "?page=1&limit=10&order=asc&sort=id&search=";
    expect(result.current).toHaveProperty("searchParams", searchParams);
    expect(result.current).toHaveProperty("search", "");
    expect(result.current).toHaveProperty("page", 1);
    expect(result.current).toHaveProperty("limit", 10);
    expect(result.current).toHaveProperty("sort", "id");
    expect(result.current).toHaveProperty("order", "asc");
    expect(result.current).toHaveProperty("totalItems", total);
    expect(result.current).toHaveProperty("hasNextPage", hasNext);
    expect(result.current).toHaveProperty("hasPrevPage", hasPrev);
    expect(result.current).toHaveProperty("firstRecordDisplaying", first);
    expect(result.current).toHaveProperty("lastRecordDisplaying", last);
  });

  test("onLastPage goes to final page", async () => {  
    const { result } = renderHook(() => usePagination(23));
    await act(async () => result.current.onLastPage());

    const searchParams = "?page=3&limit=10&order=asc&sort=id&search=";
    expect(result.current).toHaveProperty("searchParams", searchParams);
    expect(result.current).toHaveProperty("page", 3);
    expect(result.current).toHaveProperty("limit", 10);
    expect(result.current).toHaveProperty("totalItems", 23);
    expect(result.current).toHaveProperty("hasNextPage", false);
    expect(result.current).toHaveProperty("hasPrevPage", true);
    expect(result.current).toHaveProperty("firstRecordDisplaying", 21);
    expect(result.current).toHaveProperty("lastRecordDisplaying", 23);
  });

  test("onFirstPage goes to first page", () => {  
    const { result } = renderHook(() => usePagination(23));
    act(() => result.current.onLastPage());
    act(() => result.current.onFirstPage());
    const searchParams = "?page=1&limit=10&order=asc&sort=id&search=";
    expect(result.current).toHaveProperty("searchParams", searchParams);
    expect(result.current).toHaveProperty("page", 1);
    expect(result.current).toHaveProperty("limit", 10);
    expect(result.current).toHaveProperty("totalItems", 23);
    expect(result.current).toHaveProperty("hasNextPage", true);
    expect(result.current).toHaveProperty("hasPrevPage", false);
    expect(result.current).toHaveProperty("firstRecordDisplaying", 1);
    expect(result.current).toHaveProperty("lastRecordDisplaying", 10);
  });

  test.each([
    [0, 1, false, false, 0, 0],
    [0, 2, false, false, 0, 0],
    [0, 3, false, false, 0, 0],
    [0, 4, false, false, 0, 0],
    [10, 1, false, false, 1, 10],
    [10, 2, false, false, 1, 10],
    [10, 3, false, false, 1, 10],
    [10, 4, false, false, 1, 10],
    [15, 1, true, false, 1, 10],
    [15, 2, false, true, 11, 15],
    [15, 3, false, true, 11, 15],
    [15, 4, false, true, 11, 15],
    [20, 1, true, false, 1, 10],
    [20, 2, false, true, 11, 20],
    [20, 3, false, true, 11, 20],
    [20, 4, false, true, 11, 20],
    [22, 1, true, false, 1, 10],
    [22, 2, true, true, 11, 20],
    [22, 3, false, true, 21, 22],
    [22, 4, false, true, 21, 22],
    [30, 1, true, false, 1, 10],
    [30, 2, true, true, 11, 20],
    [30, 3, false, true, 21, 30],
    [30, 4, false, true, 21, 30],
    [31, 1, true, false, 1, 10],
    [31, 2, true, true, 11, 20],
    [31, 3, true, true, 21, 30],
    [31, 4, false, true, 31, 31]
  ])("(%s) total records on page %s has correct pagination variables when using onNextPage()", (total, attemptedTurns, hasNext, hasPrev, first, last) => {  
    const { result } = renderHook(() => usePagination(total));
    for (let i = 1; i < attemptedTurns; i++) {
      act(() => result.current.onNextPage());
    }

    const searchParams = `?page=${result.current.page}&limit=10&order=asc&sort=id&search=`;
    expect(result.current).toHaveProperty("searchParams", searchParams);
    expect(result.current).toHaveProperty("page", result.current.page);
    expect(result.current).toHaveProperty("limit", 10);
    expect(result.current).toHaveProperty("totalItems", total);
    expect(result.current).toHaveProperty("hasNextPage", hasNext);
    expect(result.current).toHaveProperty("hasPrevPage", hasPrev);
    expect(result.current).toHaveProperty("firstRecordDisplaying", first);
    expect(result.current).toHaveProperty("lastRecordDisplaying", last);
  });

  test.each([
    [0, 1, false, false, 0, 0],
    [0, 2, false, false, 0, 0],
    [0, 3, false, false, 0, 0],
    [0, 4, false, false, 0, 0],
    [10, 1, false, false, 1, 10],
    [10, 2, false, false, 1, 10],
    [10, 3, false, false, 1, 10],
    [10, 4, false, false, 1, 10],
    [15, 1, false, true, 11, 15],
    [15, 2, true, false, 1, 10],
    [15, 3, true, false, 1, 10],
    [15, 4, true, false, 1, 10],
    [20, 1, false, true, 11, 20],
    [20, 2, true, false, 1, 10],
    [20, 3, true, false, 1, 10],
    [20, 4, true, false, 1, 10],
    [22, 1, false, true, 21, 22],
    [22, 2, true, true, 11, 20],
    [22, 3, true, false, 1, 10],
    [22, 4, true, false, 1, 10],
    [30, 1, false, true, 21, 30],
    [30, 2, true, true, 11, 20],
    [30, 3, true, false, 1, 10],
    [30, 4, true, false, 1, 10],
    [31, 1, false, true, 31, 31],
    [31, 2, true, true, 21, 30],
    [31, 3, true, true, 11, 20],
    [31, 4, true, false, 1, 10]
  ])("(%s) total records on page %s has correct pagination variables when using onPrevPage()", (total, attemptedTurns, hasNext, hasPrev, first, last) => {  
    const { result } = renderHook(() => usePagination(total));
    act(() => result.current.onLastPage());
    for (let i = 1; i < attemptedTurns; i++) {
      act(() => result.current.onPrevPage());
    }

    const searchParams = `?page=${result.current.page}&limit=10&order=asc&sort=id&search=`;
    expect(result.current).toHaveProperty("searchParams", searchParams);
    expect(result.current).toHaveProperty("page", result.current.page);
    expect(result.current).toHaveProperty("limit", 10);
    expect(result.current).toHaveProperty("totalItems", total);
    expect(result.current).toHaveProperty("hasNextPage", hasNext);
    expect(result.current).toHaveProperty("hasPrevPage", hasPrev);
    expect(result.current).toHaveProperty("firstRecordDisplaying", first);
    expect(result.current).toHaveProperty("lastRecordDisplaying", last);
  });
  
  test("onChangeSearch and onChangeLimit resets page to 1", () => {
    const { result } = renderHook(() => usePagination(23));
    act(() => result.current.onLastPage());
    expect(result.current.page).toBe(3);
    act(() => result.current.onChangeSearch("Updated"));
    expect(result.current.page).toBe(1);
    act(() => result.current.onLastPage());
    expect(result.current.page).toBe(3);
    act(() => result.current.onChangeLimit(30));
    expect(result.current.page).toBe(1);
  });

  test("onChangePage ensures page is between zero and total", () => {
    const { result } = renderHook(() => usePagination(23));
    act(() => result.current.onChangePage(3));
    expect(result.current.page).toBe(3);
    act(() => result.current.onChangePage(5));
    expect(result.current.page).toBe(3);
    act(() => result.current.onChangePage(-2));
    expect(result.current.page).toBe(3);
  });
 
});