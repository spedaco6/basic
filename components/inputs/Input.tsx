import { IUseInput } from "@/hooks/useInput";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hook?: IUseInput,
  error?: string,
}

export const Input = ({ 
  type = "text",
  name,
  value,
  title,
  label,
  placeholder="",
  id,
  className="",
  hook,
  required,
  error="",
  disabled,
  onChange,
  onBlur,
  ...props
}: InputProps ): React.ReactElement => {

  const devRequired = required === undefined ? hook?.required : required;
  const devName = (name ?? hook?.name);
  const devValue = value ?? hook?.value;
  const devOnChange = onChange ?? hook?.onChange;
  const devOnBlur = onBlur ?? hook?.onBlur;
  const devId = id ? id : devName ? devName : undefined;
  const devError = error ?? hook?.error;
  const displayLabel = label ? label + (devRequired ? "*" : "") : "";
  const displayPlaceholder = placeholder ? placeholder + (devRequired ? "*" : "") : "";

  return <div className="flex flex-col flex-1" data-testid="input-container">
    { devError && <p className="text-red-500">{ devError }</p> }
    { displayLabel && <label title={title} className="uppercase text-xs p-1" htmlFor={devId}>{ displayLabel }</label> }
    <input 
      className={`rounded-sm p-1 ${className}`} 
      type={type} name={devName} 
      id={devId} 
      title={title}
      value={devValue} 
      onChange={devOnChange}
      onBlur={devOnBlur}
      required={devRequired}
      disabled={disabled}
      placeholder={displayPlaceholder}
      { ...props } 
    />
  </div>
}