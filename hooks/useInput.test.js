// @vitest-environment jsdom

import { describe, test, expect, beforeEach, afterAll, vi } from "vitest";
import { useInput } from "./useInput";
import { renderHook } from "@testing-library/react";
import { act } from "react";

describe("useInput", () => {
  beforeEach(() => vi.clearAllMocks());
  afterAll(() => vi.resetAllMocks())

  test("returns name, value, required, onChange, onBlur, condition, setValue", () => {
    const { result } = renderHook(() => useInput("test", ""));
    expect(result.current.name).toBe("test");
    expect(result.current.value).toBe("");
    expect(result.current.required).toBe(false);
    expect(result.current).toHaveProperty("condition");
    expect(result.current).toHaveProperty("onChange");
    expect(result.current).toHaveProperty("onBlur");
    expect(result.current).toHaveProperty("setValue");
    expect(result.current.onChange).toBeTypeOf("function");
    expect(result.current.onBlur).toBeTypeOf("function");
    expect(result.current.setValue).toBeTypeOf("function");
  });
  
  test("required returns true when name has trailing asterisk", () => {
    const { result } = renderHook(() => useInput("test*", ""));
    expect(result.current.name).toBe("test");
    expect(result.current.required).toBe(true);
  });

  test("condition contains touched and blurred", async () => {
    const { result } = renderHook(() => useInput("test", ""));
    expect(result.current.condition.touched).toBe(false);
    expect(result.current.condition.blurred).toBe(false);
    
    // First blur will not occur before first change
    act(() => result.current.onBlur());
    expect(result.current.condition.touched).toBe(false);
    expect(result.current.condition.blurred).toBe(false);

    // First change updated changed and saved
    act(() => result.current.onChange({ target: { value: "1" }}));
    expect(result.current.condition.touched).toBe(true);
    expect(result.current.condition.blurred).toBe(false);
    
    // Blur now updates after first change
    act(() => result.current.onBlur());
    expect(result.current.condition.touched).toBe(true);
    expect(result.current.condition.blurred).toBe(true);  
  });

});