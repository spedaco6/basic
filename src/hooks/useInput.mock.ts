import { vi } from "vitest";
import * as useInputModule from "./useInput"; // Adjust this relative path to your actual useInput file

export interface MockUseInputOptions {
  id?: string;
  name?: string;
  value?: any;
  required?: boolean;
  touched?: boolean;
  errors?: string | string[] | null;
}

/**
 * Creates a reusable mock configuration for useInput.
 * @param defaultOverrides Baseline state data you want the hook to return initially.
 */
export function mockUseInput(defaultOverrides: MockUseInputOptions = {}) {
  // 1. Create trackable spies for the returned handlers
  const mockOnChange = vi.fn();
  const mockOnBlur = vi.fn();
  const mockOnReset = vi.fn();

  // 2. Set default baseline state
  const mockData = {
    id: defaultOverrides.id ?? "mockId",
    name: defaultOverrides.name ?? "mockName",
    value: defaultOverrides.value ?? "",
    required: defaultOverrides.required ?? false,
    touched: defaultOverrides.touched ?? false,
    errors: defaultOverrides.errors ?? null,
    onChange: mockOnChange,
    onBlur: mockOnBlur,
    onReset: mockOnReset,
  };

  // 3. Spy on the exported useInput function module
  const spy = vi.spyOn(useInputModule, "useInput").mockReturnValue(mockData);

  return {
    spy,
    mockOnChange,
    mockOnBlur,
    mockOnReset,
    // Helper to change the mock values dynamically mid-test
    updateMock: (newOverrides: MockUseInputOptions) => {
      spy.mockReturnValue({
        id: newOverrides.id ?? mockData.id,
        name: newOverrides.name ?? mockData.name,
        value: newOverrides.hasOwnProperty("value") ? newOverrides.value : mockData.value,
        required: newOverrides.required ?? mockData.required,
        touched: newOverrides.touched ?? mockData.touched,
        errors: newOverrides.hasOwnProperty("errors") && typeof newOverrides.errors !== "undefined"
          ? newOverrides.errors
          : mockData.errors,
        onChange: mockOnChange,
        onBlur: mockOnBlur,
        onReset: mockOnReset,
      });
    },
  };
}
