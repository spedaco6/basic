import { vi } from "vitest";
import * as useFetchModule from "./useFetch"; // Adjust this relative path to your actual useFetch file

export interface MockFetchOptions {
  data?: any;
  loading?: boolean;
  error?: string | null;
}

/**
 * Creates a reusable mock configuration for useFetch.
 * @param defaultOverrides Baseline state data you want the hook to return initially.
 */
export function mockUseFetch(defaultOverrides: MockFetchOptions = {}) {
  // 1. Create trackable spies for your return functions
  const mockRefetch = vi.fn().mockResolvedValue(undefined);
  const mockReset = vi.fn();

  // 2. Set default baseline states
  const mockData = {
    data: defaultOverrides.data ?? null,
    loading: defaultOverrides.loading ?? false,
    error: defaultOverrides.error ?? null,
    refetch: mockRefetch,
    reset: mockReset,
  };

  // 3. Spy on the exported useFetch function module
  const spy = vi.spyOn(useFetchModule, "useFetch").mockReturnValue(mockData);

  return {
    spy,
    mockRefetch,
    mockReset,
    // Helper to change the mock values dynamically mid-test
    updateMock: (newOverrides: MockFetchOptions) => {
      spy.mockReturnValue({
        data: newOverrides.hasOwnProperty("data") ? newOverrides.data : mockData.data,
        loading: newOverrides.loading ?? mockData.loading,
        error: newOverrides.hasOwnProperty("error") && typeof newOverrides.error !== "undefined"
          ? newOverrides.error 
          : mockData.error,
        refetch: mockRefetch,
        reset: mockReset,
      });
    },
  };
}
