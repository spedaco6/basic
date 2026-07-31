import { createContext, useContext, useId } from "react";
import type { UseInputResult } from "../hooks/useInput";

type FormContextResult = {
  id: string;
  loading: boolean;
  submitting: boolean;
  error: string | null;
  disabled: boolean;
  valid: boolean;
  filled: boolean;
}

type FormContextProviderProps = React.PropsWithChildren & {
  id?: string;
  inputs: Record<string, UseInputResult>;
  submitting?: boolean;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
}

const FormContext = createContext<FormContextResult | undefined>(undefined);

export const useFormCtx = () => {
  const ctx = useContext(FormContext);
  if (!ctx) throw new Error("useFormCtx must be used within a FormContextProvider.");
  return ctx;
}

export const FormContextProvider = ({ 
  children, 
  inputs, 
  id, 
  disabled=false, 
  loading=false, 
  submitting=false,
  error=null,
}: FormContextProviderProps) => {
  let formId = id
  if (!formId) formId = useId(); 

  const inputHooks = Object.values(inputs);
  const allFilled = inputHooks.every(i => !i.required || i.touched);
  const allValid = inputHooks.every(i => i.errors === null);

  const value = {
    id: formId,
    error,
    loading,
    submitting,
    disabled,
    valid: allValid,
    filled: allFilled,
  };

  return <FormContext.Provider value={value}>
    { children }
  </FormContext.Provider>
}