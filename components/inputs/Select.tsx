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
}

export const Select = ({ 
  type = "text",
  name,
  value,
  label,
  placeholder="",
  id,
  options = [],
  className="",
  hook,
  required,
  disabled,
  onChange,
  ...props
}: SelectProps ): React.ReactElement => {

  const devRequired = required ?? hook?.required;
  const devName = (name ?? hook?.name);
  const devValue = value ?? hook?.value;
  const devOnChange = onChange ?? hook?.onChange;
  const devId = (label && !id) ? devName : undefined;

  return <div className="flex flex-col">
    { label && <label className="uppercase text-xs p-1" htmlFor={devId}>{`${label}${devRequired ? "*" : ""}`}</label> }
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