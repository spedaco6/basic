import React from "react"

export const LoadingProfileCard = (): React.ReactElement => {

  return <div className="w-[40rem] overflow-hidden h-[25rem] border-1 rounded-lg animate-pulse">
    <div className="w-[40rem] h-[15rem] border-b-1 bg-gray-300"></div>
    <div className="w-[40rem] h-[5rem] border-b-1 bg-gray-200"></div>
    <div className="w-[40rem] h-[5rem] border-b-1 bg-gray-200"></div>
  </div> 
}