"use client"

import { ChangeEvent, useState } from "react"

export interface IUseInput {
  name: string,
  value: any,
  required: boolean,
  onChange: (e: ChangeEvent<HTMLInputElement>) => void;
}

export function useInput<T>(name: string, initValue: T) {
  const [ value, setValue ] = useState<T>(initValue);
  
  const matches = name.match(/^(?<name>.+)\*$/);
  const required = Boolean(matches);
  const inputName = required ? matches!.groups!.name : name;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val: any = e.target.value;
    if (typeof initValue === "number") val = Number(val);
    else if (typeof initValue === "boolean") val = e.target.checked;
    setValue(val as T);
  }

  return {
    name: inputName,
    value,
    required,
    onChange,
  }
}