import React, { ButtonHTMLAttributes } from "react";

interface IButton extends ButtonHTMLAttributes<HTMLButtonElement> {
  btnStyle?: "default" | "secondary" | "outline" | "flat" | "danger" | "secondaryDanger" | "outlineDanger" | "flatDanger" |
  "accept" | "secondaryAccept" | "outlineAccept" | "flatAccept";
}

export const Button = ({ children, btnStyle="default", className="", ...props }: IButton): React.ReactNode => {
  const styles = {
    default: "bg-gray-600 text-white border border-gray-600 hover:border-gray-800 hover:bg-gray-800",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border border-gray-500 text-gray-600 hover:border-gray-900 hover:text-gray-900",
    flat: "shadow-gray-400 border border-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    secondaryDanger: "bg-red-100 text-red-800 hover:bg-red-200",
    outlineDanger: "text-red-500 hover:border-red-600 hover:text-red-600 shadow-red-600 border",
    flatDanger: "hover:shadow-red-600 text-red-500 hover:text-red-600",
    accept: "bg-green-500 border border-green-500 hover:border-green-600 hover:bg-green-600 text-white",
    secondaryAccept: "bg-green-100 text-green-800 hover:bg-green-200",
    outlineAccept: "text-green-500 hover:border-green-600 hover:text-green-600 shadow-green-200 border",
    flatAccept: "hover:shadow-green-600 text-green-500 hover:text-green-600",
  }


  return <button
    className={`${className} ${styles[btnStyle]} cursor-pointer py-2 px-3 min-w-fit rounded-md hover:shadow-sm`}
    { ...props }>
      { children }
  </button>
}