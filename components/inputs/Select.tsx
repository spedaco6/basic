import { IUseInput } from "@/hooks/useInput";
import React from "react";

interface IOption {
  name: string;
  value: any;
};

interface SelectProps extends React.InputHTMLAttributes<HTMLSelectElement> {
  label?: string;
  hook?: IUseInput;
  options?: IOption[];
  error?: string;
}

export const Select = ({ 
  type = "text",
  name,
  value,
  label,
  id,
  options = [],
  className="",
  hook,
  error,
  required,
  disabled,
  onChange,
  ...props
}: SelectProps ): React.ReactElement => {

  const devRequired = required === undefined ? hook?.required : required;
  const devName = (name ?? hook?.name);
  const devError = error ? error : hook?.error;
  const devValue = value ?? hook?.value;
  const devOnChange = onChange ?? hook?.onChange;
  const devId = id ? id : devName ? devName : undefined;
  const displayLabel = label ? label + (devRequired ? "*" : "") : "";

  return <div className="flex flex-col" data-testid="select-container">
    { devError && <p className="text-red-500">{ devError }</p> }
    { displayLabel && <label className="uppercase text-xs p-1" htmlFor={devId}>{ displayLabel }</label> }
    <select 
      className={`rounded-sm p-1 ${className}`} 
      name={devName} 
      id={devId} 
      value={devValue} 
      onChange={devOnChange}
      required={devRequired}
      disabled={disabled}
      { ...props } 
    >
      { options.length && options.map(opt => <option
        key={opt.value}
        value={opt.value ?? opt.name} 
      >
        { opt.name }
      </option>) }
    </select>
  </div>
}