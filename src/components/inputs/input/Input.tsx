import React, { useId } from "react";
import type { UseInputResult } from "../../../hooks/useInput";
import { checkRequirement } from "../../../lib/client/utils";

type BaseInputProps = {
  errors?: string | string[] | null;
  classNameInput?: string;
  label?: string;
  labelPosition?: "top" | "bottom" | "right" | "left";
  hideAsterisk?: boolean;
}

export type InputProps = 
  | React.ComponentPropsWithoutRef<"input"> & BaseInputProps & { 
    type?: Exclude<React.HTMLInputTypeAttribute, "checkbox" | "textarea" | "select">;
    hook?: UseInputResult<HTMLInputElement>
  }
  | React.ComponentPropsWithoutRef<"input"> & BaseInputProps & { 
    type: "checkbox";
    hook?: UseInputResult<HTMLInputElement>;
    checkboxStyle?: string;
  }
  | React.ComponentPropsWithoutRef<"textarea"> & BaseInputProps & { 
    type: "textarea";
    hook?: UseInputResult<HTMLTextAreaElement>;
  }
  | React.ComponentPropsWithoutRef<"select"> & BaseInputProps & { 
    type: "select";
    options: string[];
    allowEmpty?: boolean;
    hook?: UseInputResult<HTMLSelectElement>;
  };

export function Input({ 
  className="",
  classNameInput="",
  id,
  name,
  label,
  labelPosition, 
  errors,
  type, 
  disabled=false,
  required=false,
  hideAsterisk,
  value,
  onChange,
  onBlur,
  hook, 
  ...props 
}: InputProps): React.ReactNode {
  const labelPositions = ["top", "bottom", "right", "left"];
  const hasLabel = !!label;
  const isCheckbox = type === "checkbox";
  const isSelect = type === "select";

  let inputName;
  let inputValue;
  let allErrors;
  let inputErrors;
  let requiredByName = false;
  let requiredByHook = false;
  let inputOnChange;
  let inputOnBlur;
  let baseName;
  let inputLabelPosition = isCheckbox ? "right" : "top";
  let inputChecked: boolean;

  if (name) {
    const [nameWithoutAsterisk, isRequiredByName] = checkRequirement(name);
    baseName = nameWithoutAsterisk;
    requiredByName = isRequiredByName;
  }

  let inputId = baseName ? baseName + "_" + useId() : useId();

  // Set hook values
  if (hook) {
    inputId = hook.id;
    inputName = hook.name;
    inputValue = hook.value;
    requiredByHook = hook.required;
    allErrors = hook.errors;
    inputOnChange = hook.onChange;
    inputOnBlur = hook.onBlur;
    inputChecked = !!hook.value;
  }

  // Override hook values if otherwise provided  
  if (id) inputId = id;
  if (baseName) inputName = baseName;
  if (errors) allErrors = errors;
  if (labelPosition) inputLabelPosition = labelPosition
  if (typeof value !== "undefined") {
    inputValue = value;
    inputChecked = !!value;
  }

  if (onChange) inputOnChange = onChange;
  if (onBlur) inputOnBlur = onBlur;
  
  // requirement based on all possible 'required' options 
  const isRequired = required || requiredByName || requiredByHook;

  // convert error types to array
  let hasErrors = false;
  if (allErrors) {
    allErrors = typeof allErrors === "string" ? [allErrors] : allErrors;
    // remove duplicate errors from array
    inputErrors = allErrors.reduce<string[]>((prev, curr) => {
      return prev.includes(curr) ? prev : [...prev, curr];
    }, []);
    hasErrors = inputErrors.length > 0;
  }

  // display related conditions

  // checkboxes
  let checkboxStyle = "";
  let cleanProps: Partial<InputProps> = props;
  if (isCheckbox && "checkboxStyle" in props) {
    const { checkboxStyle: cStyle, ...nativeProps } = props;
    checkboxStyle = cStyle ?? "";
    cleanProps = nativeProps;
  }

  // select inputs
  let selectAllowEmpty = false;
  let selectOptions: string[] = [];
  if (isSelect) {
    if ("allowEmpty" in cleanProps) {
      const { allowEmpty, ...sProps } = cleanProps;
      selectAllowEmpty = typeof allowEmpty === "boolean" ? allowEmpty : false;
      cleanProps = sProps;
    }
    if ("options" in cleanProps) {
      const { options, ...sProps } = cleanProps;
      selectOptions = options ?? [];
      if (!selectAllowEmpty || isRequired) {
        const updated = selectOptions.filter(opt => opt !== "");
        selectOptions = updated;
      }
      if (!isRequired && selectAllowEmpty && selectOptions.every(opt => opt !== "")) {
        const updated = ["", ...selectOptions];
        selectOptions = updated;
      }
      cleanProps = sProps; 
    }
  }

  const inputStyles = isCheckbox 
    ? `checkbox ${checkboxStyle ? checkboxStyle : ""}` 
    : type === "textarea" 
      ? "textarea"
      : type === "select"
        ? "select"
        : "";

  const inputHideAsterisk = typeof hideAsterisk === "undefined"
    ? isCheckbox 
    : hideAsterisk;
  const showAsterisk = isRequired && !inputHideAsterisk;
  const validLabelPosition = inputLabelPosition && labelPositions.includes(inputLabelPosition) 
    ? inputLabelPosition 
    : "top";
  const labelBefore = validLabelPosition === "top" || validLabelPosition === "left";
  const verticalLayout = validLabelPosition === "top" || validLabelPosition === "bottom";

  const sharedProps = {
    className: classNameInput,
    id: inputId,
    name: inputName,
    disabled,
    required: isRequired,
    value: inputValue,
    onChange: inputOnChange as (e: React.ChangeEvent<any>) => void,
    onBlur: inputOnBlur as (e: React.FocusEvent<any>) => void,
  }

  const renderInput = () => {
    if (type === "textarea") {
      return <textarea {...sharedProps} {...(cleanProps as React.ComponentPropsWithoutRef<"textarea">)} />
    }
    if (type === "select") {
      return <select {...sharedProps} {...(cleanProps as React.ComponentPropsWithoutRef<"select">)}>
        { selectOptions.map(opt => <option key={opt}>{ opt }</option>) }
      </select>
    }
    if (isCheckbox) return <input {...sharedProps} type="checkbox" checked={inputChecked} {...(cleanProps as React.ComponentPropsWithoutRef<"input">)} />
    return <input {...sharedProps} type={type} {...(cleanProps as React.ComponentPropsWithoutRef<"input">)} />
  }

  return <div className={`
    input
    ${ inputStyles }
    ${disabled ? "disabled" : ""}
    ${hasErrors ? "error" : ""} 
    ${className}
  `}>
    <div className={`
      ${verticalLayout ? "vertical" : ""} 
    `}>
      { hasLabel && labelBefore && <label htmlFor={ inputId }>{ label + (showAsterisk ? "*" : "") }</label> }
      { renderInput() }
      { hasLabel && !labelBefore && <label htmlFor={ inputId }>{ label + (showAsterisk ? "*" : "") }</label> }
    </div>
    <ul>
      { hasErrors && inputErrors?.map((err) => <li key={err}>
        <p className="error">{ err }</p>
      </li>) }
    </ul>
  </div>
}