import React, { cloneElement, useId } from "react";
import type { UseInputResult } from "@/hooks/useInput";
import { checkRequirement } from "@/lib/client/utils";
import "@/styles/input.css";

export type InputProps = React.ComponentProps<"input"> & {
  errors?: string | string[] | null;
  classNameInput?: string;
  label?: string;
  labelPosition?: "top" | "bottom" | "right" | "left";
  hideAsterisk?: boolean;
  hook?: UseInputResult;
  checkboxStyle?: "confirm" | "danger";
};

export default function Input({ 
  className="",
  classNameInput="",
  id,
  name,
  label,
  labelPosition, 
  errors,
  checkboxStyle,
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
  const isCheckbox = type === "checkbox";
  const labelPositions = ["top", "bottom", "right", "left"];
  const hasLabel = !!label;

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
  let inputChecked;

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
  const checkboxStyles = `checkbox ${checkboxStyle ? "checkbox-" + checkboxStyle : ""}`;
  const inputHideAsterisk = typeof hideAsterisk === "undefined"
    ? isCheckbox 
    : hideAsterisk;
  const showAsterisk = isRequired && !inputHideAsterisk;
  const validLabelPosition = inputLabelPosition && labelPositions.includes(inputLabelPosition) 
    ? inputLabelPosition 
    : "top";
  const labelBefore = validLabelPosition === "top" || validLabelPosition === "left";
  const verticalLayout = validLabelPosition === "top" || validLabelPosition === "bottom";

  const input = <input
    className={classNameInput}
    id={inputId}
    name={inputName}
    type={type}
    disabled={disabled}
    required={isRequired}
    value={inputValue}
    onChange={inputOnChange}
    onBlur={inputOnBlur}
    {...props}
  />

  const checkbox = cloneElement(input, {
    type: "checkbox",
    checked: inputChecked,
  });

  return <div className={`
    input
    ${isCheckbox ? checkboxStyles : ""}
    ${disabled ? "disabled" : ""}
    ${hasErrors ? "error" : ""} 
    ${className}
  `}>
    <div className={`
      ${verticalLayout ? "vertical" : ""} 
    `}>
      { hasLabel && labelBefore && <label htmlFor={ inputId }>{ label + (showAsterisk ? "*" : "") }</label> }
      { isCheckbox ? checkbox : input }
      { hasLabel && !labelBefore && <label htmlFor={ inputId }>{ label + (showAsterisk ? "*" : "") }</label> }
    </div>
    <ul>
      { hasErrors && inputErrors?.map((err) => <li key={err}>
        <p className={disabled ? "text-err-disabled-text dark:text-err-disabled-dark-text" : "text-error"}>{ err }</p>
      </li>) }
    </ul>
  </div>
}