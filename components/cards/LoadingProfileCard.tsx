import React from "react"

export const LoadingProfileCard = (): React.ReactElement => {

  return <div className="mx-auto w-full rounded-md border border-gray-300 p-4">
  <div className="flex animate-pulse">
    <div className="size-15 rounded-full bg-gray-200 mr-4 mb-4"></div>
    <div className="flex-1 space-y-6 py-1">
      <div className="h-4 rounded bg-gray-200"></div>
      <div className="space-y-3">
        <div className="grid grid-cols-3 gap-8">
          <div className="col-span-2 h-4 rounded bg-gray-200"></div>
          <div className="col-span-1 h-4 rounded bg-gray-200"></div>
        </div>
        <div className="h-4 rounded bg-gray-200"></div>
      </div>
    </div>
  </div>
</div>
}