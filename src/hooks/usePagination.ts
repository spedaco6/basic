"use client"

import { useState } from "react"
import { PER_PAGE } from "../lib/client/const";

export type Pagination = {
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  search: string;
}

export type UsePaginationResult = {
  searchParams: string;
  search: string;
  page: number;
  limit: number;
  sort: string;
  order: "asc" | "desc";
  totalItems: number;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  firstRecordDisplaying: number;
  lastRecordDisplaying: number;
  onFirstPage: () => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onLastPage: () => void;
  onChangePage: (val: number) => void;
  onChangeLimit: (val: number) => void;
  onChangeSort: (val: string) => void;
  onChangeOrder: (val: "asc" | "desc") => void;
  onChangeSearch: (val: string) => void;
}

export function usePagination(total: number = 0): UsePaginationResult {
  const [limit, setLimit] = useState(() => {
    if (typeof window !== "undefined") {
      let savedLimit = Number(window.sessionStorage.getItem("perPage"));
      if (!savedLimit) {
        savedLimit = PER_PAGE;
        window.sessionStorage.setItem("perPage", String(savedLimit));
      }
      return savedLimit;
    }
    return PER_PAGE;
  });    
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [sort, setSort] = useState("id");
  const [search, setSearch] = useState("");

  const totalPages = Math.ceil(total/limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const firstRecordDisplaying = total > 0 ? (page - 1) * limit + 1 : 0;
  const lastRecordDisplaying = hasNextPage
    ? page * limit
    : total; 

  // cast all pagination values to string
  const urlSearchParams = new URLSearchParams({
    page: String(page),
    limit: String(limit),
    order,
    sort,
    search,
  });
  const searchParams = "?" + urlSearchParams.toString();

  const onChangePage = (newPage: number) => {
    setPage(prev => {
      if (newPage > 0 && newPage <= totalPages) return newPage;
      return prev;
    });
  };

  const onFirstPage = () => {
    setPage(1);
  }
  const onNextPage = () => {
    if (hasNextPage) setPage(prev => prev + 1);
  }
  const onPrevPage = () => {
    if (hasPrevPage) setPage(prev => prev - 1);
  }
  const onLastPage = () => {
    setPage(totalPages);
  }

  const onChangeLimit = (newLimit: number) => {
    setPage(1);
    setLimit(prev => {
      if (newLimit > 0 && newLimit <= 100) {
        window.sessionStorage.setItem("perPage", String(newLimit)); 
        return newLimit;
      } 
      return prev;
    });
  };

  const onChangeOrder = (newOrder: "asc" | "desc") => {
    setOrder(prev => {
      if (newOrder === "asc" || newOrder === "desc") return newOrder;
      return prev;
    });
  };
  
  const onChangeSearch = (newSearch: string) => {
    setPage(1);
    setSearch(newSearch);
  };

  return {
    searchParams,
    search,
    page,
    limit,
    sort,
    order,
    totalItems: total,
    hasNextPage,
    hasPrevPage,
    firstRecordDisplaying,
    lastRecordDisplaying,
    onFirstPage,
    onLastPage,
    onNextPage,
    onPrevPage,
    onChangePage,
    onChangeLimit,
    onChangeSort: setSort,
    onChangeOrder,
    onChangeSearch,
  }
}