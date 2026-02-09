"use client"

import { ChangeEvent, useState } from "react"

export interface IUseInput {
  name: string;
  value: any;
  required: boolean;
  onChange: (e: ChangeEvent<HTMLInputElement> & ChangeEvent<HTMLSelectElement>) => void;
  onBlur: () => void;
  setValue: (value: any) => void;
}

interface InputCondition {
  touched: boolean,
  blurred: boolean,
}

export function useInput<T>(name: string, initValue: T) {
  const [ value, setValue ] = useState<T>(initValue);
  const [ condition, setCondition ] = useState<InputCondition>({
    touched: false, // has been changed
    blurred: false, // has lost focus at least once
  });
  
  const matches = name.match(/^(?<name>.+)\*$/);
  const required = Boolean(matches);
  const inputName = required ? matches!.groups!.name : name;

  const onChange = (e: ChangeEvent<HTMLInputElement>) => {
    let val: any = e.target.value;
    if (typeof initValue === "number") val = Number(val);
    else if (typeof initValue === "boolean") val = e.target.checked;
    setValue(val as T);
    setCondition(prev => {
      return {
        ...prev,
        touched: true,
      }
    });
  }

  const onBlur = () => {
    if (condition.touched) {
      setCondition(prev => ({
        ...prev,
        blurred: true,
      }));
    }
  }

  return {
    name: inputName,
    value,
    required,
    onChange,
    onBlur,
    setValue,
    condition,
  }
}