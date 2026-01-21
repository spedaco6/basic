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
  label,
  placeholder="",
  id,
  className="",
  hook,
  required,
  disabled,
  onChange,
  ...props
}: InputProps ): React.ReactElement => {

  const devRequired = required ?? hook?.required;
  const devName = (name ?? hook?.name);
  const devValue = value ?? hook?.value;
  const devOnChange = onChange ?? hook?.onChange;
  const devId = (label && !id) ? devName : undefined;

  return <div className="flex flex-col">
    { label && <label htmlFor={devId}>{`${label}${devRequired ? "*" : ""}`}</label> }
    <input 
      className={`rounded-sm p-1 ${className}`} 
      type={type} name={devName} 
      id={devId} 
      value={devValue} 
      onChange={devOnChange}
      required={devRequired}
      disabled={disabled}
      placeholder={`${placeholder}${devRequired ? "*" : ""}`}
      { ...props } 
    />
  </div>
}