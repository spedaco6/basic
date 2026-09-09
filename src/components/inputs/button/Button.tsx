import { LoaderCircle } from "lucide-react";

export type ButtonVariant = "primary" | "secondary" | "success" | "danger" | "none";

export type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  // Known variants get autocomplete; the `string & {}` branch still allows
  // an arbitrary custom class name (e.g. one defined outside button.css)
  // without collapsing the whole type down to a bare, unchecked `string`.
  variant?: ButtonVariant | (string & {});
  icon?: boolean;
  showLoading?: boolean;
  loading?: boolean;
};

export function Button({
  showLoading=false, 
  children,
  variant="primary",
  icon=false,
  type="button",
  loading=false,
  disabled=false,
  className="",
  ...props
}: ButtonProps): React.ReactNode {
  const displayLoadingSpinner = showLoading && loading;
  const buttonDisabled = disabled || loading;
  
  return <button 
    className={`
      button
      ${loading ? "loading" : ""}
      ${disabled ? "disabled" : ""}
      ${icon || displayLoadingSpinner ? "icon" : ""}
      ${variant} 
      ${className}
    `}
    disabled={buttonDisabled}
    type={type}
    {...props}
  >
    { displayLoadingSpinner && <div className="spin"><LoaderCircle /></div> }
    { !displayLoadingSpinner && children }
  </button>
}