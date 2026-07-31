import { createContext, useContext, useEffect, useId, useRef, useState } from "react";
import type { UseInputResult } from "../hooks/useInput";
import { useFetch } from "../hooks/useFetch";

type FormContextResult = {
  id: string;
  loading: boolean;
  action: string | null;
  error: string | null;
  disabled: boolean;
  valid: boolean;
  filled: boolean;
  submit: (action: string, body?: any) => void;
}

type FormContextProviderProps = React.PropsWithChildren & {
  url: string;
  headers?: HeadersInit;
  inputs: Record<string, UseInputResult>;
  id?: string;
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
  url,
  headers,
  disabled=false, 
  loading=false, 
  error=null,
}: FormContextProviderProps) => {
  const { refetch, loading: fLoading, error: fError } = useFetch(url, false, headers);
  const [action, setAction] = useState<string | null>(null);

  useEffect(() => {
    if (!fLoading) setAction(null);
  }, [fLoading]);

  let formId = id
  if (!formId) formId = useId(); 

  let formError = fError;
  if (error) formError = error;

  let formLoading = fLoading || loading;

  const inputHooks = Object.values(inputs);
  const formFilled = inputHooks.every(i => !i.required || i.touched);
  const formValid = inputHooks.every(i => i.errors === null);

  const submit = (submitAction: string, body?: any) => {
    setAction(submitAction);
    refetch(body);
  }

  const value = {
    id: formId,
    error: formError,
    loading: formLoading,
    disabled,
    action,
    valid: formValid,
    filled: formFilled,
    submit,
  };

  return <FormContext.Provider value={value}>
    { children }
  </FormContext.Provider>
}