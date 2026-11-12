import { FormContextProvider, useFormCtx } from "../../context/FormContext"
import { useId } from "../../hooks/useId";
import { Button } from "../inputs/button/Button";
import type { ButtonProps } from "../inputs/button/Button";
import { Input } from "../inputs/input/Input";
import type { InputProps } from "../inputs/input/Input";

export type FormProps = React.ComponentPropsWithRef<'form'> & {
  disabled?: boolean;
  loading?: boolean;
};

const Form = ({ children, ...props }: FormProps) => {
  return <FormContextProvider { ...props } >
    { children }
  </FormContextProvider>
}

const FormInput = ({ disabled, ...props }: InputProps) => {
  const ctx = useFormCtx();
  const inputDisabled = disabled || ctx.disabled || ctx.loading;

  return <Input
    form={ctx.id}
    disabled={inputDisabled}
    { ...props } 
  />
}

const FormButton = ({ children, disabled, loading, id, ...props }: ButtonProps) => {
  const buttonId = useId(id, "button");
  const ctx = useFormCtx();
  const buttonLoading = loading || ctx.loading;
  const buttonDisabled = disabled || ctx.disabled;

  return <Button
    id={buttonId} 
    form={ctx.id}
    disabled={buttonDisabled}
    loading={buttonLoading}
    { ...props }
  >
    { children }
  </Button>
}

Form.Input = FormInput;
Form.Button = FormButton;

export default Form;