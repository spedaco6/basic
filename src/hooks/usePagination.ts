"use client"

import { useEffect, useState, type ChangeEvent } from "react"
import { PER_PAGE, MAX_PER_PAGE } from "../lib/client/const";

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
  onChangeLimit: (val: number | ChangeEvent<HTMLSelectElement>) => void;
  onChangeSort: (val: string) => void;
  onChangeOrder: (val: "asc" | "desc") => void;
  onChangeSearch: (val: string) => void;
}

export function usePagination(total: number = 0): UsePaginationResult {
  const [limit, setLimit] = useState(PER_PAGE);
  const [page, setPage] = useState(1);
  const [order, setOrder] = useState<"asc" | "desc">("asc");
  const [sort, setSort] = useState("id");
  const [search, setSearch] = useState("");

  // Runs once, client-side only (effects never run during SSR), so the
  // server-rendered HTML and the client's first render always agree on
  // PER_PAGE — avoiding a hydration mismatch — then upgrades to the saved
  // value immediately after mount, if one exists and is still valid.
  useEffect(() => {
    const savedLimit = Number(window.sessionStorage.getItem("perPage"));
    if (savedLimit > 0 && savedLimit <= MAX_PER_PAGE) {
      setLimit(savedLimit);
    } else {
      window.sessionStorage.setItem("perPage", String(PER_PAGE));
    }
  }, []);

  const totalPages = Math.ceil(total/limit);
  const hasNextPage = page < totalPages;
  const hasPrevPage = page > 1;
  const firstRecordDisplaying = total > 0 ? (page - 1) * limit + 1 : 0;
  const lastRecordDisplaying = hasNextPage
    ? page * limit
    : total; 

  // keep page inside [1, totalPages] whenever total/limit changes for any
  // reason (e.g. an external filter shrinks the result set) — mirrors the
  // same "clamp to last valid page, or 1 if there are no pages" logic used
  // by onLastPage, but runs automatically instead of requiring a handler call
  useEffect(() => {
    if (totalPages > 0 && page > totalPages) {
      setPage(totalPages);
    } else if (totalPages === 0 && page !== 1) {
      setPage(1);
    }
  }, [totalPages, page]);

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
    const lastPage = totalPages > 0 ? totalPages : 1;
    setPage(lastPage);
  }

  const onChangeLimit = (newLimitData: number | React.ChangeEvent<HTMLSelectElement>) => {
    let newLimit: number;
    if (typeof newLimitData === "number") {
      newLimit = newLimitData;
    } else if ("target" in newLimitData) {
      newLimit = Number(newLimitData.target.value);
    } else {
      return; // malformed input — leave existing state untouched
    }

    if (Number.isNaN(newLimit) || newLimit <= 0 || newLimit > MAX_PER_PAGE) return;
    window.sessionStorage.setItem("perPage", String(newLimit));
    setLimit(newLimit);
    setPage(1);
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