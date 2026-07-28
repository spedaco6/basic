import type { ButtonHTMLAttributes } from "react"
import { LoaderCircle } from "lucide-react";

export type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  style?: "primary" | "secondary" | "danger" | "success";
  icon?: boolean;
  showLoadingSpinner?: boolean;
  loading?: boolean;
};

export default function Button({
  showLoadingSpinner=false, 
  children,
  style="primary",
  icon=false,
  type="button",
  loading=false,
  disabled=false,
  className="",
  ...props
}: ButtonProps) {
  const displayLoadingSpinner = showLoadingSpinner && loading;
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
    { (!showLoadingSpinner || (showLoadingSpinner && !loading)) && children }
  </button>
}