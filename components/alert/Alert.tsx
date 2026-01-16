"use client"

import React, { useEffect, useState } from "react";

export function Alert({ children }: React.PropsWithChildren): React.ReactElement {
  const [ show, setShow ] = useState(false);

  useEffect(() => {
    setShow(true);
    const id = setTimeout(() => setShow(false), 5000);
    return () => {
      if (id) clearTimeout(id);
    }
  }, []);

  return <>
    { show && <div onClick={() => setShow(false)} className="bottom-20 right-20 cursor-pointer fixed w-[20rem] h-[5rem] bg-gray-200 rounded-md shadow-2xl">
      <div className="flex justify-end w-full">
        <button className="cursor-pointer" onClick={() => setShow(false)}>
          <i className="bi bi-x text-2xl hover:text-red-500" />
        </button>
      </div>
      { children }
    </div>}
  </>
}