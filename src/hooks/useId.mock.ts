import { vi } from "vitest";
import * as useIdModule from "./useId";

export interface MockUseIdOptions {
  /** Stand-in for React.useId()'s output. Defaults to "mockId". */
  autoId?: string;
  /** If set, the hook always returns this value, ignoring its arguments. */
  returnValue?: string;
}

function createImplementation({ autoId = "mockId", returnValue }: MockUseIdOptions) {
  return (customId?: string, label?: string): string => {
    if (returnValue !== undefined) return returnValue;
    if (customId) return customId;
    return label ? `${label}_${autoId}` : autoId;
  };
}

/**
 * Mocks useId with deterministic output.
 *
 * By default it mirrors the real hook's logic, swapping React's generated id
 * for `autoId`:
 *   useId("custom")        -> "custom"
 *   useId(undefined, "x")  -> "x_mockId"
 *   useId()                -> "mockId"
 */
export function mockUseId(options: MockUseIdOptions = {}) {
  let current = options;
  const spy = vi.spyOn(useIdModule, "useId").mockImplementation(createImplementation(current));

  return {
    spy,
    // Change the mocked output mid-test (merged with the previous options)
    updateMock: (newOptions: MockUseIdOptions) => {
      current = { ...current, ...newOptions };
      spy.mockImplementation(createImplementation(current));
    },
  };
}
