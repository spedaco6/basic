import { createContext, useContext, useEffect, useId, useState } from "react";
import type { UseInputResult } from "../hooks/useInput";
import { type RefetchFunction, type UseFetchResult } from "../hooks/useFetch";

type FormContextResult = {
  id: string;
  loading: boolean;
  error: string | null;
  disabled: boolean;
  valid: boolean;
  filled: boolean;
  inputs: Record<string, UseInputResult>;
  refetch: RefetchFunction;
  setAction: (action: string) => void;
  action: string;
  success: boolean;
}

type FormContextProviderProps = React.PropsWithChildren & {
  inputs: Record<string, UseInputResult>;
  id?: string;
  loading?: boolean;
  disabled?: boolean;
  error?: string | null;
  fetch: UseFetchResult; 
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
  error=null,
  fetch,
}: FormContextProviderProps) => {
  const [action, setAction] = useState<string>("");
  
  useEffect(() => {
    if (!fetch.loading) setAction("");
  }, [fetch.loading]);

  let formId = id
  if (!formId) formId = useId(); 

  let formError = fetch.error;
  if (error) formError = error;

  let formLoading = fetch.loading || loading || !!action;

  const inputHooks = Object.values(inputs);
  const formFilled = inputHooks.every(i => !i.required || i.touched);
  const formValid = inputHooks.every(i => i.errors === null);

  const value: FormContextResult = {
    id: formId,
    error: formError,
    loading: formLoading,
    disabled,
    valid: formValid,
    filled: formFilled,
    inputs,
    refetch: fetch.refetch,
    action,
    setAction,
    success: (!!fetch.data?.success || !!formError) && !formLoading,
  };

  return <FormContext.Provider value={value}>
    { children }
  </FormContext.Provider>
}