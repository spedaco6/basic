import { expect, test, describe, vi } from "vitest";
import { mockValidationInstance } from "../lib/client/validation.mock";
import { renderHook } from "@testing-library/react";
import { useInput } from "./useInput";
import { act } from "react";
import type { ChangeEvent, FocusEvent } from "react";
import { beforeEach } from "vitest";
import { Validator } from "../lib/client/validation";

(globalThis as any).IS_REACT_ACT_ENVIRONMENT = true;

let counter = 0;
function getName() {
  const num = counter;
  counter++;
  return "Sample" + num;
}
describe("useInput hook", () => {
  beforeEach(() => vi.clearAllMocks());
  describe("default behavior", () => {
    test("provides id, name, required, onBlur, onChange, value, and error", () => {
      const name = getName();
      const hook = renderHook(() => useInput(name, ""));
      expect(hook.result.current.id).toContain(name);
      expect(hook.result.current.name).toBe(name);
      expect(hook.result.current.required).toBe(false);
      expect(hook.result.current.value).toBe("");
      expect(hook.result.current.onChange).toBeDefined();
      expect(hook.result.current.onBlur).toBeDefined();
    });
  });
  describe("event handlers", () => {
    test("onBlur does not run validation before first change", () => {
      const name = getName();
      const hook = renderHook(() => useInput(name + "*", ""));
      act(() => hook.result.current.onBlur({} as FocusEvent<HTMLInputElement>));
      expect(mockValidationInstance.getErrors).not.toHaveBeenCalled();
    });

    test("onBlur runs first validation after first change", () => {
      const name = getName();
      const hook = renderHook(() => useInput(name + "*", ""));
      act(() => hook.result.current.onChange({ target: { value: "" }} as ChangeEvent<HTMLInputElement>));
      act(() => hook.result.current.onBlur({} as FocusEvent<HTMLInputElement>));
      expect(mockValidationInstance.getErrors).toHaveBeenCalledOnce();
    });

    test("onChange runs no validation before first blur validation", () => {
      const name = getName();
      const hook = renderHook(() => useInput(name + "*", ""));
      act(() => hook.result.current.onChange({ target: { value: "updated" }} as ChangeEvent<HTMLInputElement>));
      act(() => hook.result.current.onChange({ target: { value: "" }} as ChangeEvent<HTMLInputElement>));
      act(() => hook.result.current.onBlur({} as FocusEvent<HTMLInputElement>));
      expect(mockValidationInstance.getErrors).toHaveBeenCalledOnce();
    });
    test("onChange runs validation on each change after first blur validation", () => {
      const name = getName();
      const hook = renderHook(() => useInput(name + "*", ""));
      act(() => hook.result.current.onChange({ target: { value: "" }} as ChangeEvent<HTMLInputElement>));
      act(() => hook.result.current.onBlur({} as FocusEvent<HTMLInputElement>));
      act(() => hook.result.current.onChange({ target: { value: "updated" }} as ChangeEvent<HTMLInputElement>));
      act(() => hook.result.current.onChange({ target: { value: "" }} as ChangeEvent<HTMLInputElement>));
      expect(mockValidationInstance.getErrors).toHaveBeenCalledTimes(3);
    });
  });
  describe("validation requirements", () => {
    test("accepts validator functions", () => {
      const name = getName();
      const hook = renderHook(() => useInput(name, "", [Validator.EMAIL]));
      act(() => hook.result.current.onChange({ target: { value: "" }} as ChangeEvent<HTMLInputElement>));
      act(() => hook.result.current.onBlur({} as FocusEvent<HTMLInputElement>));
      expect(mockValidationInstance.getErrors).toHaveBeenCalledOnce();
    });
  });
  describe("checkbox input types", () => {
    test("toggles between true and false", () => {
      const name = getName();
      const hook = renderHook(() => useInput(name));
      const mockEvent = {
        target: {
          type: "checkbox",
          checked: true,
          value: "This should not be the value",
        }
      }
      act(() => hook.result.current.onChange(mockEvent as ChangeEvent<HTMLInputElement>));
      act(() => hook.result.current.onBlur({} as FocusEvent<HTMLInputElement>));
      expect(hook.result.current.value).toBe(true);
    });
  })
});