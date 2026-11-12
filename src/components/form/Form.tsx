import { FormContextProvider } from "../../context/FormContext"

export type FormProps = React.ComponentPropsWithRef<'form'> & {

};

export const Form = ({ children, ...props }: FormProps) => {
  return <FormContextProvider { ...props } >
    { children }
  </FormContextProvider>
}