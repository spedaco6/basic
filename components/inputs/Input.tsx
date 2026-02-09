import { IUseInput } from "@/hooks/useInput";
import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  hook?: IUseInput,
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
  disabled,
  onChange,
  onBlur,
  ...props
}: InputProps ): React.ReactElement => {

  const devRequired = required ?? hook?.required;
  const devName = (name ?? hook?.name);
  const devValue = value ?? hook?.value;
  const devOnChange = onChange ?? hook?.onChange;
  const devOnBlur = onBlur ?? hook?.onBlur;
  const devId = (label && !id) ? devName : undefined;

  return <div className="flex flex-col flex-1">
    { label && <label title={title} className="uppercase text-xs p-1" htmlFor={devId}>{`${label}${devRequired ? "*" : ""}`}</label> }
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
      placeholder={`${placeholder}${devRequired && placeholder ? "*" : ""}`}
      { ...props } 
    />
  </div>
}