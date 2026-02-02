"use client"

import React, { ChangeEventHandler, FocusEventHandler, FormEventHandler, MouseEventHandler, useState } from "react";

interface ChecklistItem {
  title: string,
  complete: boolean,
}

export const Checklist = (): React.ReactNode => {
  const [ list, setList ] = useState<ChecklistItem[]>([]);
  const [ newItem, setNewItem ] = useState("");

  const handleChange: ChangeEventHandler<HTMLInputElement> = (e) => {
    const { value } = e.target;
    setNewItem(value);
  }

  const handleSubmit: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
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

  const handleClick = (title: string) => {
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

  return <div className="mt-8">
    <h1>CHECKLIST COMPONENT</h1>
    <ul>
      { list.length > 0 && list.map(item => <li 
        key={item.title}
        onClick={() => handleClick(item.title)}
        className={`${item.complete ? "line-through" : ""} cursor-pointer`}
      >
        { item.title }
      </li>) }
      <form onSubmit={handleSubmit}>
        <input className="border" onChange={handleChange} value={newItem} />
      </form>
    </ul>

    { list.length === 0 && <p>No checklist items</p> }
  </div>
}