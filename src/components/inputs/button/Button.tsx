import { LoaderCircle } from "lucide-react";

export type ButtonProps = React.ComponentPropsWithRef<"button"> & {
  style?: string;
  icon?: boolean;
  showLoading?: boolean;
  loading?: boolean;
};

export function Button({
  showLoading=false, 
  children,
  style="primary",
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
      ${style} 
      ${className}
    `}
    disabled={buttonDisabled}
    type={type}
    {...props}
  >
    { displayLoadingSpinner && <div className="animate-spin"><LoaderCircle /></div> }
    { (!showLoading || (showLoading && !loading)) && children }
  </button>
}