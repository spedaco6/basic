"use client"

import { checkRequirement } from "../lib/client/utils";
import { Validator } from "../lib/client/validation";
import type { ValidatorFn } from "../lib/client/validation";
import { useCallback, useEffect, useId, useMemo, useState } from "react"

export type InputTypes = 
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type UseInputResult<T extends InputTypes = HTMLInputElement> = {
  id: string;
  name: string;
  value: any;
  required: boolean;
  touched: boolean;
  errors: string | string[] | null;
  onChange: (e: React.ChangeEvent<T>) => void;
  onBlur: (e: React.FocusEvent<T>) => void;
  onReset: () => void;
}

/**
 * Manages controlled input state, touched/blurred tracking, and validation.
 *
 * @param name Field name. Append `*` (e.g. `"email*"`) to mark the field as required —
 * the asterisk is stripped from the returned `name`.
 * @param initialValue Starting value for the field, and the value restored by `onReset`.
 * @param validation Array of validator functions to run against the field's value.
 * Static validators (e.g. `Validator.EMAIL`) can be listed inline safely. Validators
 * that close over other state (e.g. `Validator.EQUALS(password)`) can also be listed
 * inline — but the state they depend on MUST be listed in `deps` (see below), or the
 * validator will silently run against a stale value.
 * @param deps Values that validators in `validation` depend on but that don't live on
 * this field itself (e.g. `[password]` for a "confirm password" field's `EQUALS` check).
 * Used for two things:
 *   1. Triggers revalidation of this field when one of these values changes elsewhere.
 *   2. Tells the hook when it's safe to reuse its internal validator array instead of
 *      rebuilding it — so an inline `validation` array (a new reference every render)
 *      doesn't defeat memoization of `validate`/`onChange`/`onBlur`.
 * Leave empty (the default) for validators that only depend on the field's own value.
 * @returns Field props/state plus `onChange`, `onBlur`, and `onReset` handlers.
 *
 * @example
 * // Static validator, no deps needed
 * useInput("email*", "", [Validator.EMAIL]);
 *
 * @example
 * // Validator depends on another field's live value — must be listed in deps
 * useInput("confirmPassword*", "", [Validator.EQUALS(password)], [password]);
 */
export const useInput = <
  T extends InputTypes = HTMLInputElement
>(
  name: string, 
  initialValue?: any, 
  validation: ValidatorFn[] = [], 
  deps: any[] = []
): UseInputResult<T> => {
  const [value, setValue] = useState(initialValue);
  const [errors, setErrors] = useState<string | string[] | null>(null);
  const [touched, setTouched] = useState(false);
  const [blurred, setBlurred] = useState(false);

  const [inputName, isRequired] = checkRequirement(name);
  // Keyed on `deps`, not `validation` itself: `validation` is commonly passed as
  // an inline array literal (e.g. [Validator.EMAIL]) or contains freshly-created
  // closures (e.g. Validator.EQUALS(password)), so it's a new reference on every
  // render regardless of whether anything meaningful changed. `deps` is the
  // explicit signal from the caller for "these are the values my validators
  // actually depend on" — reuse it here so allValidation only recomputes when
  // deps changes, not on every unrelated re-render.
  const allValidation = useMemo(
    () => isRequired ? [...validation, Validator.REQUIRE] : validation,
    [isRequired, JSON.stringify(deps)]
  );
  const id = inputName + "_" + useId();

  useEffect(() => {
    if (blurred && touched) validate(value);
  }, [JSON.stringify(deps)]);

  // validates value according to requirements
  const validate = useCallback((val: any): void => {
    if (allValidation) {
      const validator = new Validator(val);
      for (const fn of allValidation) {
        fn(validator);
      }
      const newErrors = validator.getErrors();
      setErrors(newErrors);
    }
  }, [allValidation]);

  const onChange = useCallback((e: React.ChangeEvent<T>) => {
    const target = e.target;
    const isCheckbox = 'checked' in target && target.type === "checkbox";
    const newValue = isCheckbox ? target.checked : target.value;

    setValue(newValue);
    setTouched(true);

    // run subsequent validations
    if (blurred || isCheckbox) validate(newValue);
    
  }, [blurred, validate]);

  const onBlur: React.FocusEventHandler<T> = useCallback((_) => {
    if (touched) {
      setBlurred(true);
      validate(value);
    }
  }, [touched, value, validate]);

  const onReset = () => {
    setValue(initialValue);
    setTouched(false);
    setBlurred(false);
    setErrors(null);
  }

  return {
    id,
    name: inputName,
    value, 
    required: isRequired,
    errors,
    touched,
    onChange,
    onBlur,
    onReset,
  }
}