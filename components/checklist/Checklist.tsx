"use client"

import React, { ChangeEventHandler, FocusEventHandler, FormEventHandler, useState } from "react";

interface ChecklistItem {
  title: string,
  complete: boolean,
}

export const Checklist = (): React.ReactNode => {
  const [ list, setList ] = useState<ChecklistItem[]>([]);
  const [ newItem, setNewItem ] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e): void => {
    const { value } = e.target;
    setNewItem(value);
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e): void => {
    e.preventDefault();
    handleBlur();
  }

  const handleClick = (title: string): void => {
    setList(prev => {
      const updated = [...prev];
      const itemIndex = prev.findIndex(item => item.title === title);
      if (itemIndex === -1) return updated;
      const updatedItem = {
        title,
        complete: !prev[itemIndex].complete,
      };
      updated[itemIndex] = updatedItem;
      return updated;
    });
  }

  const handleBlur = (): void => {
    if (newItem) {
      setList(prev => {
        const updated = [
          ...prev,
          { title: newItem, complete: false }
        ];
        return updated;
      });
      setNewItem("");
    }
  }

  const handleDelete = (title: string): void => {
    setList(prev => {
      const updated = prev.filter(item => item.title !== title);
      return updated;
    });
  }  


  return <div className="mt-8 w-1/2">
    <h1 className="mb-4 font-bold">CHECKLIST COMPONENT</h1>
    <ul className="flex flex-col gap-2">
      { list.length > 0 && list.map(item => <li 
        key={item.title}
        onClick={() => handleClick(item.title)}
        className="flex justify-between p-1"
      >
        <span className={`${item.complete ? "line-through" : "" } cursor-pointer`}>{ item.title }</span>
        <div className="flex gap-2">
          <button onClick={() => handleDelete(item.title)} className="cursor-pointer"><i className="bi bi-trash hover:text-red-500" /></button>
        </div>
      </li>) }
      <form onSubmit={handleSubmit}>
        <input 
          className="border w-full p-1 rounded-sm" 
          onBlur={handleBlur} 
          onChange={handleChange} 
          value={newItem} 
          autoFocus
        />
      </form>
    </ul>

    { list.length === 0 && <p className="text-center mt-10 w-full">No checklist items</p> }
  </div>
}