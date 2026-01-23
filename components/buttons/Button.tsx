import React from "react";

interface IButton extends React.PropsWithChildren {
  type?: "default" | "secondary" | "outline" | "flat" | "danger" | "secondaryDanger" | "outlineDanger" | "flatDanger" |
  "accept" | "secondaryAccept" | "outlineAccept" | "flatAccept";
}

export const Button = ({ children, type="default", ...props }: IButton): React.ReactNode => {
  const styles = {
    default: "bg-gray-600 text-white border-1 border-gray-600 hover:border-gray-800 hover:bg-gray-800",
    secondary: "bg-gray-200 text-gray-800 hover:bg-gray-300",
    outline: "border-1 hover:outline border-gray-500 text-gray-600 hover:border-gray-900 hover:text-gray-900",
    flat: "hover:shadow-lg shadow-gray-400 border-1 border-transparent",
    danger: "bg-red-500 hover:bg-red-600 text-white",
    secondaryDanger: "bg-red-100 text-red-800 hover:bg-red-200",
    outlineDanger: "text-red-500 hover:border-red-600 hover:text-red-600 hover:outline border-1",
    flatDanger: "hover:shadow-red-600 hover:shadow-md text-red-500 hover:text-red-600",
    accept: "bg-green-500 hover:bg-green-600 text-white",
    secondaryAccept: "bg-green-100 text-green-800 hover:bg-green-200",
    outlineAccept: "text-green-500 hover:border-green-600 hover:text-green-600 hover:outline border-1",
    flatAccept: "hover:shadow-green-600 hover:shadow-md text-green-500 hover:text-green-600",
    
  }


  return <button
    className={`${styles[type]} cursor-pointer py-2 px-3 min-w-fit rounded-lg`}
    { ...props }>
      { children }
  </button>
}