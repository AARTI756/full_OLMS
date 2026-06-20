'use client';

import { create } from "zustand";
import type { OfferSortBy, SortOrder } from "@/types/offer";

interface OfferFilterState {
  search: string;
  status: string;
  department: string;
  recruiter: string;
  page: number;
  sortBy: OfferSortBy;
  sortOrder: SortOrder;
  setSearch: (search: string) => void;
  setStatus: (status: string) => void;
  setDepartment: (department: string) => void;
  setRecruiter: (recruiter: string) => void;
  setPage: (page: number) => void;
  setSortBy: (sortBy: OfferSortBy) => void;
  setSortOrder: (sortOrder: SortOrder) => void;
}

export const useOfferFilterStore = create<OfferFilterState>((set) => ({
  search: "",
  status: "",
  department: "",
  recruiter: "",
  page: 1,
  sortBy: "offerDate",
  sortOrder: "desc",
  setSearch: (search) => set({ search, page: 1 }),
  setStatus: (status) => set({ status, page: 1 }),
  setDepartment: (department) => set({ department, page: 1 }),
  setRecruiter: (recruiter) => set({ recruiter, page: 1 }),
  setPage: (page) => set({ page }),
  setSortBy: (sortBy) => set({ sortBy, page: 1 }),
  setSortOrder: (sortOrder) => set({ sortOrder, page: 1 }),
}));
