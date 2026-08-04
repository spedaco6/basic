import { useEffect, useId, useRef } from "react";
import { Input as BaseInput } from "../inputs/input/Input";
import type { InputProps } from "../inputs/input/Input";
import { Button as BaseButton } from "../inputs/button/Button";
import type { ButtonProps } from "../inputs/button/Button";
import { FormContextProvider, useFormCtx } from "../../context/FormContext";
import type { UseInputResult } from "../../hooks/useInput";
import { useFetch, type FetchResponseData, type RefetchFunction } from "../../hooks/useFetch";
import { Send, Trash2 } from "lucide-react";

export type FormProps = React.ComponentPropsWithoutRef<"form"> & {
  id?: string;
  name?: string;
  url: string;
  inputs: Record<string, UseInputResult>;
  loading?: boolean;
  disabled?: boolean;
  headers?: HeadersInit;
  
/*   method?: "POST" | "PATCH" | "PUT";
  successRedirect?: string;
  failureRedirect?: string;
  onSuccess?: (data: FetchResponseData) => void;
  onFailure?: (error: string) => void; */
}

const Form = ({
  id,
  name,
  children,
  className="",
  inputs,
  url,
  headers,
  ...props
}: FormProps) => {
  let formId = useId();
  if (name) formId = name + "_" + formId;
  if (id) formId = id;

  const fetch = useFetch(url, false, headers);

  // prevents default in case of onSubmit event handler
  const handleSubmit = async (e: React.SubmitEvent<HTMLFormElement>) => {
    e.preventDefault();
    const body: Record<string, any> = {};
    for (const k in inputs) {
      body[k] = inputs[k].value;
    }
    fetch.refetch(body);
  }

  return <FormContextProvider 
    id={formId} 
    inputs={inputs}
    fetch={fetch}
    {...props}
  >
    <form id={formId} name={name} className={className} onSubmit={handleSubmit}>
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

type FormButtonProps = ButtonProps & {
  action: string;
}
const Button = ({ 
  children, 
  disabled,
  loading,
  action,
  onClick,
  ...props
}: FormButtonProps) => {
  const formCtx = useFormCtx();

  const actionLoading = formCtx.action === action && formCtx.loading;
  const actionDisabled = formCtx.action !== action && formCtx.loading;

  const buttonLoading = loading || actionLoading;
  const buttonDisabled = disabled || formCtx.disabled || actionDisabled;

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    formCtx.setAction(action);
    if (onClick) onClick(e);
  }

  return <BaseButton
    form={formCtx.id}
    showLoading
    disabled={buttonDisabled}
    loading={buttonLoading}
    onClick={handleClick}
    { ...props }
  >
    { children }
  </BaseButton>
}

const Submit = ({ children, type, ...props }: Omit<FormButtonProps, "action">) => {
  return <Button 
    type="submit" 
    action="submit" 
    icon
    {...props}
  >
    { children ? children : <><Send size={16}/>Submit</> }
  </Button>
}

const Delete = ({ children, type, ...props }: Omit<FormButtonProps, "action">) => {
  const formCtx = useFormCtx();
  const called = useRef(false);
  const handleClick = () => {
    called.current = true;
    formCtx.refetch("DELETE");
  }

  useEffect(() => {
    if (formCtx.action === "delete") {
      if (formCtx.success) {
        console.log("DELETED SUCCESSFULLY");
      } else {
        console.log("DELETION FAILED");
      }
    }
  }, [formCtx.success, formCtx.action]);

  return <Button 
    type="button" 
    action="delete"
    style="danger" 
    onClick={handleClick} 
    icon
    {...props}
  >
    { children ? children : <><Trash2 size={16}/>Delete</> }
  </Button>
}

Button.Submit = Submit;
Button.Delete = Delete;

Form.Input = Input;
Form.Button = Button;

export { Form };