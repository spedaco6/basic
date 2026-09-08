import { LoaderCircle } from "lucide-react";

export type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  variant?: "primary" | "secondary" | "danger" | "success" | "none";
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