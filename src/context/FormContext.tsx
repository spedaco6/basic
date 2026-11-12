import { createContext, useContext, useId } from "react";
import type { FormProps } from "../components/form/Form";

type FormContextResult = {
  id: string;
  disabled: boolean;
  loading: boolean;
  submitting: boolean;
  valid: boolean;
  complete: boolean;
}

const FormContext = createContext<undefined|FormContextResult>(undefined);

export const useFormCtx = () => {
  const ctx = useContext(FormContext);
  if (!ctx) {
    throw new Error("useFormCtx must be used with a FormContextProvider");
  }
  return ctx;
}

export const FormContextProvider = ({ 
  children, 
  id, 
  loading=false, 
  disabled=false, 
  ...props 
}: FormProps) => {
  let formId = "form_" + useId();
  if (id) formId = id;

  const value = {
    id: formId,
    disabled,
    loading,
    submitting: false,
    valid: false,
    complete: false,
  };

  return <FormContext.Provider value={value}>
    <form 
      id={formId}
      { ...props }
    >
      { children }
    </form>
  </FormContext.Provider>
}