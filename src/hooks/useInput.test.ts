import { act, renderHook } from "@testing-library/react";
import { describe, expect, test } from "vitest";
import { useInput } from "./useInput";
import { Validator } from "../lib/client/validation";

// Minimal fake DOM events — useInput only reads e.target.value / e.target.checked / e.target.type
function changeEvent(value: string) {
  return { target: { value } } as any;
}
function checkboxEvent(checked: boolean) {
  return { target: { type: "checkbox", checked } } as any;
}
const blurEvent = {} as any;

describe("useInput", () => {
  describe("initial state", () => {
    test("returns initialValue, and starts untouched/unblurred with no errors", () => {
      const { result } = renderHook(() => useInput("name", "Alice"));

      expect(result.current.value).toBe("Alice");
      expect(result.current.touched).toBe(false);
      expect(result.current.errors).toBeNull();
      expect(result.current.required).toBe(false);
    });

    test("id is derived from the field name", () => {
      const { result } = renderHook(() => useInput("email"));
      expect(result.current.id).toContain("email_");
    });

    test("strips a trailing asterisk from name and marks the field required", () => {
      const { result } = renderHook(() => useInput("email*"));
      expect(result.current.name).toBe("email");
      expect(result.current.required).toBe(true);
    });

    test("does not mark the field required when name has no asterisk", () => {
      const { result } = renderHook(() => useInput("email"));
      expect(result.current.name).toBe("email");
      expect(result.current.required).toBe(false);
    });
  });

  describe("onChange", () => {
    test("updates value and sets touched to true", () => {
      const { result } = renderHook(() => useInput("name", ""));

      act(() => {
        result.current.onChange(changeEvent("Bob"));
      });

      expect(result.current.value).toBe("Bob");
      expect(result.current.touched).toBe(true);
    });

    test("does not validate on change before the field has been blurred", () => {
      // Required + empty would normally produce an error, but nothing has
      // triggered `blurred` yet, so validation should not have run.
      const { result } = renderHook(() => useInput("name*", ""));

      act(() => {
        result.current.onChange(changeEvent(""));
      });

      expect(result.current.errors).toBeNull();
    });

    test("validates on every change once the field has been blurred", () => {
      const { result } = renderHook(() => useInput("name*", ""));

      act(() => result.current.onChange(changeEvent("a")));
      act(() => result.current.onBlur(blurEvent)); // establishes blurred=true

      act(() => result.current.onChange(changeEvent("")));
      expect(result.current.errors).not.toBeNull();

      act(() => result.current.onChange(changeEvent("a")));
      expect(result.current.errors).toBeNull();
    });
  });

  describe("onBlur", () => {
    test("does nothing if the field has never been touched", () => {
      const { result } = renderHook(() => useInput("name*", ""));

      act(() => result.current.onBlur(blurEvent));

      expect(result.current.touched).toBe(false);
      expect(result.current.errors).toBeNull();
    });

    test("validates and marks the field as having been through a blur once touched", () => {
      const { result } = renderHook(() => useInput("name*", ""));

      act(() => result.current.onChange(changeEvent("")));
      act(() => result.current.onBlur(blurEvent));

      // Required field, blurred while empty -> should now show an error.
      expect(result.current.errors).not.toBeNull();
    });
  });

  describe("checkbox handling", () => {
    test("validates immediately on change, regardless of touched/blurred state", () => {
      const { result } = renderHook(() => useInput("agree*", false));

      act(() => {
        result.current.onChange(checkboxEvent(false));
      });

      expect(result.current.value).toBe(false);
      expect(result.current.touched).toBe(true);
      // Required + unchecked -> error should appear right away, without a blur.
      expect(result.current.errors).not.toBeNull();
    });

    test("clears the error once checked", () => {
      const { result } = renderHook(() => useInput("agree*", false));

      act(() => result.current.onChange(checkboxEvent(false)));
      expect(result.current.errors).not.toBeNull();

      act(() => result.current.onChange(checkboxEvent(true)));
      expect(result.current.errors).toBeNull();
    });
  });

  describe("onReset", () => {
    test("restores value, touched, blurred, and errors back to their initial state", () => {
      const { result } = renderHook(() => useInput("name*", "start"));

      act(() => result.current.onChange(changeEvent("")));
      act(() => result.current.onBlur(blurEvent));
      expect(result.current.errors).not.toBeNull();
      expect(result.current.touched).toBe(true);

      act(() => result.current.onReset());

      expect(result.current.value).toBe("start");
      expect(result.current.touched).toBe(false);
      expect(result.current.errors).toBeNull();
    });
  });

  describe("deps", () => {
    test("revalidates using an up-to-date validator closure when a dep changes", () => {
      // Mirrors a "confirm password" field: its own value never changes, but
      // it must re-check itself against the latest `password` from outside.
      const { result, rerender } = renderHook(
        ({ password }: { password: string }) =>
          useInput("confirm", "secret1", [Validator.EQUALS(password)], [password]),
        { initialProps: { password: "secret1" } }
      );

      act(() => result.current.onChange(changeEvent("secret1")));
      act(() => result.current.onBlur(blurEvent));
      expect(result.current.errors).toBeNull(); // matches current password

      act(() => {
        rerender({ password: "a-different-password" });
      });

      // Same field value as before, but it no longer matches the new password.
      expect(result.current.errors).not.toBeNull();
    });

    test("does not revalidate on a dep change if the field hasn't been touched/blurred", () => {
      const { result, rerender } = renderHook(
        ({ password }: { password: string }) =>
          useInput("confirm", "secret1", [Validator.EQUALS(password)], [password]),
        { initialProps: { password: "secret1" } }
      );

      act(() => {
        rerender({ password: "a-different-password" });
      });

      expect(result.current.errors).toBeNull();
    });
  });

  describe("handler reference stability", () => {
    test("onChange keeps the same reference across re-renders when validators are passed inline with no deps", () => {
      // Regression guard: `validation` is commonly passed as an inline array
      // literal (a new reference every render). onChange should stay
      // referentially stable across renders that don't change its own deps
      // (`blurred`, `validate`), so consumers relying on it in their own
      // memoization/dependency arrays aren't defeated silently.
      // Note: this only holds for onChange. onBlur's deps include `touched`
      // and `value`, which DO change as a direct result of calling onChange
      // — so onBlur is expected to get a new reference at that point, and
      // isn't asserted here (see the dedicated onBlur test below).
      const { result } = renderHook(() => useInput("email", "", [Validator.EMAIL]));

      const firstOnChange = result.current.onChange;

      act(() => result.current.onChange(changeEvent("a")));

      expect(result.current.onChange).toBe(firstOnChange);
    });

    test("onBlur keeps the same reference across a re-render where touched/value/validate are unchanged", () => {
      // onBlur depends on [touched, value, validate], so it can only be
      // expected to stay stable when none of those three have changed —
      // e.g. a re-render triggered by something unrelated to this field.
      const { result, rerender } = renderHook(
        ({ label }: { label: string }) => useInput(label, ""),
        { initialProps: { label: "email" } }
      );

      const firstOnBlur = result.current.onBlur;

      act(() => {
        rerender({ label: "email" }); // re-render with identical props, no interaction
      });

      expect(result.current.onBlur).toBe(firstOnBlur);
    });

    test("onBlur reference changes once touched/value change (e.g. after an onChange)", () => {
      // The inverse of the test above: onBlur MUST pick up a new closure
      // once touched/value change, or it would validate against a stale value.
      const { result } = renderHook(() => useInput("email", ""));

      const firstOnBlur = result.current.onBlur;

      act(() => result.current.onChange(changeEvent("a")));

      expect(result.current.onBlur).not.toBe(firstOnBlur);
    });

    test("onChange reference changes once a listed dep actually changes", () => {
      const { result, rerender } = renderHook(
        ({ password }: { password: string }) =>
          useInput("confirm", "", [Validator.EQUALS(password)], [password]),
        { initialProps: { password: "one" } }
      );

      const firstOnChange = result.current.onChange;

      act(() => {
        rerender({ password: "two" });
      });

      expect(result.current.onChange).not.toBe(firstOnChange);
    });
  });
});