"use client"

import { checkRequirement } from "../lib/client/utils";
import { Validator } from "../lib/client/validation";
import type { ValidatorFn } from "../lib/client/validation";
import { useCallback, useEffect, useId, useState } from "react"

type InputTypes = 
  | HTMLInputElement
  | HTMLTextAreaElement
  | HTMLSelectElement;

export type UseInputResult<T extends InputTypes> = {
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
  const allValidation = isRequired ? [...validation, Validator.REQUIRE] : validation;
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