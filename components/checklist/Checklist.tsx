"use client"

import { ChecklistItemReponseData } from "@/app/api/checklists/route";
import { FetchResponseData, useFetch } from "@/hooks/useFetch";
import { useToken } from "@/hooks/useToken";
import { createChecklistItem, deleteChecklistItem, getAllChecklistItems, updateChecklistItem } from "@/lib/client/api/checklists";
import React, { ChangeEventHandler, FormEventHandler, useEffect, useState } from "react";

export interface IChecklistItem {
  id?: number,
  title: string,
  complete: boolean,
  creatorId?: number,
}

export const Checklist = (): React.ReactNode => {
  const get = useFetch<ChecklistItemReponseData>(getAllChecklistItems);
  const deleteItem = useFetch<
    FetchResponseData, 
    [number | undefined]
  >(deleteChecklistItem, {} , {immediate: false});
  const post = useFetch<
    ChecklistItemReponseData, 
    [Partial<IChecklistItem>]
  >(createChecklistItem, {}, {immediate: false});
  const put = useFetch<
    ChecklistItemReponseData,
    [IChecklistItem]
  >(updateChecklistItem, {}, { immediate: false });
  
  const [ list, setList ] = useState<(IChecklistItem & { pending: boolean })[]>([]);
  const [ newItem, setNewItem ] = useState("");
  const { id } = useToken();

  // for get routes
  useEffect(() => {
    if (get.data.success && !get.loading) {
      const items = get.data?.items?.map(item => {
        return { ...item, pending: false };
      }) ?? [];
      setList(items);
    }
  }, [get.data]);

  // for post routes
  useEffect(() => {
    if (post.data.success && !post.loading) {
      setList(prev => {
        const updated = [...prev];
        const index = prev.findIndex(item => item.title === post.data?.item?.title);
        if (index === -1) return updated;

        const updatedItem = { ...prev[index], pending: false, id: post.data?.item?.id };
        updated[index] = updatedItem;
        return updated;
      });
    } 
    if (post.error) {
      get.refetch();
    }
  }, [post.data, post.error]);

  // for put routes
  useEffect(() => {
    if (put.data.success && !put.loading) {
      setList(prev => {
        const updated = [...prev];
        const index = prev.findIndex(item => item.title === put.data?.item?.title);
        if (index === -1) return updated;

        const updatedItem = { ...prev[index], pending: false, id: put.data?.item?.id };
        updated[index] = updatedItem;
        return updated;
      });
    } 
    if (put.error) {
      get.refetch();
    }
  }, [put.data, put.error]);

  // For delete routes
  useEffect(() => {
    if (deleteItem.error) {
      get.refetch();
    }
  }, [deleteItem.error]);

  const handleChange: ChangeEventHandler<HTMLTextAreaElement> = (e): void => {
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
        ...prev[itemIndex],
        complete: !prev[itemIndex].complete,
      };
      updated[itemIndex] = updatedItem;
      put.refetch(updatedItem);
      return updated;
    });
  }

  const handleBlur = (): void => {
    if (newItem) {
      const item = { 
        title: newItem,
        complete: false,
        creatorId: id,
      };
      setList(prev => {
        const updated = [
          ...prev,
          { ...item, pending: true },
        ];
        return updated;
      });
      setNewItem("");
      post.refetch(item);
    }
  }

  const handleDelete = (id?: number): void => {
    setList(prev => {
      const updated = prev.filter(item => item.id !== id);
      return updated;
    });
    deleteItem.refetch(id);
  }  

  return <div className="mt-8 w-1/2">
    <h1 className="mb-4 font-bold">CHECKLIST COMPONENT</h1>
    { get.error && <p className="text-red-500">{ get.error }</p> }
    <ul className="flex flex-col gap-2">
      { list.length > 0 && list.map(item => <li 
        key={item.title}
        onClick={() => handleClick(item.title)}
        className="flex justify-between p-1"
      >
        <span 
          className={`${item.complete ? "line-through" : "" } cursor-pointer`}
        >
          { item.title }
        </span>
        <div className="flex gap-2">
          { item.pending && <div className="animate-spin"><i className="bi bi-arrow-repeat text-2xl w-fit" /></div> }
          <button onClick={() => handleDelete(item.id)} className="cursor-pointer"><i className="bi bi-trash hover:text-red-500" /></button>
        </div>
      </li>) }
      <form onSubmit={handleSubmit}>
        <textarea 
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