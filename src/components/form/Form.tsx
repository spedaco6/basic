import { useId } from "react";
import { Input as BaseInput } from "../inputs/input/Input";
import type { InputProps } from "../inputs/input/Input";
import { Button as BaseButton } from "../inputs/button/Button";
import type { ButtonProps } from "../inputs/button/Button";
import { FormContextProvider, useFormCtx } from "../../context/FormContext";
import type { UseInputResult } from "../../hooks/useInput";
import type { FetchResponseData } from "../../hooks/useFetch";

export type FormProps = React.ComponentPropsWithoutRef<"form"> & {
  id?: string;
  name?: string;
  url: string;
  inputs: Record<string, UseInputResult>;
  loading?: boolean;
  disabled?: boolean;
  
  method?: "POST" | "PATCH" | "PUT";
  successRedirect?: string;
  failureRedirect?: string;
  onSuccess?: (data: FetchResponseData) => void;
  onFailure?: (error: string) => void;
}

function Form({
  id,
  name,
  children,
  className="",
  ...props
}: FormProps) {
  let formId = useId();
  if (name) formId = name + "_" + formId;
  if (id) formId = id;
  
  return <FormContextProvider 
    id={formId} 
    {...props}
  >
    <form id={formId} name={name} className={className}>
      { children }
    </form>
  </FormContextProvider>
}

function Input({
  name,
  disabled,
  ...props
}: InputProps) {
  const formCtx = useFormCtx();
  const inputDisabled = disabled || formCtx.disabled || formCtx.loading;

  return <BaseInput
    name={name}
    disabled={inputDisabled}
    { ...props } 
  />
}

function Button({ 
  children, 
  disabled,
  loading,
  action,
  onClick,
  ...props
}: ButtonProps & { action?: string }) {
  const formCtx = useFormCtx();

  const buttonLoading = loading || formCtx.loading;
  const buttonDisabled = disabled || formCtx.disabled;
  
  const buttonClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (action) formCtx.setAction(action);
    if (onClick) onClick(e);
  }
  console.log(formCtx.action);

  return <BaseButton
    showLoading
    disabled={buttonDisabled}
    loading={buttonLoading}
    onClick={buttonClick}
    { ...props }
  >
    { children }
  </BaseButton>
}

Form.Input = Input;
Form.Button = Button;

export { Form };