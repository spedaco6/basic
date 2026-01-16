import React from "react"

export const LoadingProfileCard = (): React.ReactElement => {

  return <div className="max-w-[50rem] overflow-hidden h-[14rem] border-1 rounded-sm animate-pulse">
    <div className="w-full p-8 flex gap-4 justify-end items-center h-[8rem] border-b-1 bg-gray-200">
      <div className="h-[1rem] bg-gray-400 w-[10rem]"></div>
      <div className="h-[1rem] bg-gray-400 w-[5rem]"></div>
      <div className="h-[1rem] bg-gray-400 w-[20rem]"></div>
    </div>
    <div className="w-full h-[3rem] border-b-1 bg-gray-200"></div>
    <div className="w-full h-[3rem] border-b-1 bg-gray-200"></div>
  </div> 
}