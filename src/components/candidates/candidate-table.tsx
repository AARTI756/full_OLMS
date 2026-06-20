'use client';

import { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createColumnHelper, flexRender, getCoreRowModel, getSortedRowModel, useReactTable } from '@tanstack/react-table';
import { FileText, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import type { CandidateListItem } from '@/types/candidate';
import { apiFetch } from '@/lib/api';

interface CandidateTableProps {
  data: CandidateListItem[];
  total: number;
  search: string;
  status: string;
  department: string;
  page: number;
  sortBy: string;
  sortOrder: string;
  onSearch: (value: string) => void;
  onStatus: (value: string) => void;
  onDepartment: (value: string) => void;
  onSortBy: (value: string) => void;
  onSortOrder: (value: string) => void;
  onPage: (value: number) => void;
  totalPages: number;
  onRefresh: () => void;
}

const statusClasses: Record<string, string> = {
  NEW: 'bg-slate-900 text-slate-200',
  SCREENING: 'bg-amber-500/10 text-amber-300 border border-amber-500/20',
  INTERVIEW: 'bg-sky-500/10 text-sky-300 border border-sky-500/20',
  OFFERED: 'bg-cyan-500/10 text-cyan-300 border border-cyan-500/20',
  HIRED: 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/20',
  REJECTED: 'bg-rose-500/10 text-rose-300 border border-rose-500/20',
};

const candidateStatuses = ['', 'NEW', 'SCREENING', 'INTERVIEW', 'OFFERED', 'HIRED', 'REJECTED'];
const departments = ['', 'Engineering', 'HR', 'Sales', 'Marketing', 'Finance'];

function CandidateStatusBadge({ status }: { status: string }) {
  return (
    <span className={cn('inline-flex rounded-full px-3 py-1 text-xs font-semibold', statusClasses[status] ?? 'bg-slate-900 text-slate-200')}>
      {status || 'Unknown'}
    </span>
  );
}

const columnHelper = createColumnHelper<CandidateListItem>();

const columns = [
  columnHelper.display({
    id: 'select',
    header: ({ table }) => (
      <input
        type="checkbox"
        checked={table.getIsAllRowsSelected()}
        onChange={table.getToggleAllRowsSelectedHandler()}
        className="h-4 w-4 rounded border-slate-600 text-cyan-500"
      />
    ),
    cell: ({ row }) => (
      <input
        type="checkbox"
        checked={row.getIsSelected()}
        onChange={row.getToggleSelectedHandler()}
        className="h-4 w-4 rounded border-slate-600 text-cyan-500"
      />
    ),
  }),
  columnHelper.accessor('fullName', {
    header: 'Candidate',
    cell: (info) => (
      <div>
        <div className="font-semibold text-white">{info.getValue()}</div>
        <div className="text-xs text-slate-500">{info.row.original.email}</div>
      </div>
    ),
  }),
  columnHelper.accessor('department', {
    header: 'Department',
  }),
  columnHelper.accessor('role', {
    header: 'Role',
  }),
  columnHelper.accessor('status', {
    header: 'Status',
    cell: (info) => <CandidateStatusBadge status={info.getValue()} />,
  }),
  columnHelper.accessor('experienceYears', {
    header: 'Experience',
    cell: (info) => `${info.getValue()} yrs`,
  }),
  columnHelper.accessor('expectedCtc', {
    header: 'Expected CTC',
    cell: (info) => `$${Number(info.getValue()).toLocaleString()}`,
  }),
  columnHelper.accessor('recruiterName', {
    header: 'Recruiter',
    cell: (info) => info.getValue() ?? 'Unassigned',
  }),
];

function createCSV(data: CandidateListItem[]) {
  const headers = ['Full Name', 'Email', 'Department', 'Role', 'Status', 'Experience', 'Expected CTC', 'Recruiter'];
  const rows = data.map((candidate) => [
    candidate.fullName,
    candidate.email,
    candidate.department,
    candidate.role,
    candidate.status,
    String(candidate.experienceYears),
    String(candidate.expectedCtc),
    candidate.recruiterName ?? 'Unassigned',
  ]);
  const csv = [headers, ...rows].map((row) => row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(',')).join('\n');
  return csv;
}

export function CandidateTable({
  data,
  total,
  search,
  status,
  department,
  page,
  sortBy,
  sortOrder,
  onSearch,
  onStatus,
  onDepartment,
  onSortBy,
  onSortOrder,
  onPage,
  totalPages,
  onRefresh,
}: CandidateTableProps) {
  const router = useRouter();
  const [selectedRowIds, setSelectedRowIds] = useState<Record<string, boolean>>({});

  const table = useReactTable({
    data,
    columns,
    state: {
      rowSelection: selectedRowIds,
      sorting: sortBy ? [{ id: sortBy as any, desc: sortOrder === 'desc' }] : [],
    },
    onRowSelectionChange: setSelectedRowIds,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    manualSorting: true,
    enableRowSelection: true,
  });

  const selectedIds = Object.keys(selectedRowIds).filter((key) => selectedRowIds[key]);

  async function handleBulkDelete() {
    if (!selectedIds.length) return;
    const confirmed = window.confirm(`Delete ${selectedIds.length} selected candidate(s)? This action cannot be undone.`);
    if (!confirmed) return;

    await apiFetch('/api/candidates', {
      method: 'DELETE',
      body: JSON.stringify({ ids: selectedIds }),
    });
    setSelectedRowIds({});
    onRefresh();
  }

  function handleExport() {
    const csv = createCSV(data);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `candidates-${new Date().toISOString().slice(0, 10)}.csv`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    URL.revokeObjectURL(url);
  }

  return (
    <div className="space-y-6">
      <div className="rounded-[32px] bg-slate-950/90 p-6 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60">
        <div className="flex flex-col gap-4 xl:flex-row xl:items-center xl:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.24em] text-cyan-300/70">Candidate pipeline</p>
            <h1 className="mt-2 text-3xl font-semibold text-white">Talent command center</h1>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            <Button variant="secondary" onClick={handleExport} className="rounded-3xl">
              Export CSV
            </Button>
            <Button variant="secondary" onClick={handleBulkDelete} className="rounded-3xl" disabled={!selectedIds.length}>
              <Trash2 className="mr-2 h-4 w-4" /> Delete selected
            </Button>
          </div>
        </div>

        <div className="mt-6 grid gap-4 xl:grid-cols-6">
          <Input value={search} onChange={(event) => onSearch(event.target.value)} placeholder="Search candidates, role, location..." />
          <Select value={status} onChange={(event) => onStatus(event.target.value)}>
            {candidateStatuses.map((option) => (
              <option key={option} value={option}>{option || 'All statuses'}</option>
            ))}
          </Select>
          <Select value={department} onChange={(event) => onDepartment(event.target.value)}>
            {departments.map((option) => (
              <option key={option} value={option}>{option || 'All departments'}</option>
            ))}
          </Select>
          <Select value={sortBy} onChange={(event) => onSortBy(event.target.value)}>
            <option value="createdAt">Newest</option>
            <option value="fullName">Name</option>
            <option value="expectedCtc">Expected CTC</option>
            <option value="status">Status</option>
          </Select>
          <Select value={sortOrder} onChange={(event) => onSortOrder(event.target.value as 'asc' | 'desc')}>
            <option value="desc">Descending</option>
            <option value="asc">Ascending</option>
          </Select>
          <div className="flex items-center gap-2 rounded-3xl bg-slate-900/80 px-4 py-3 text-sm text-slate-300">
            <span className="font-medium">Page</span>
            <span>{page} / {totalPages}</span>
          </div>
        </div>
      </div>

      <div className="rounded-[32px] bg-slate-950/90 p-4 shadow-2xl shadow-slate-950/20 ring-1 ring-slate-800/60 overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-y-3 text-left text-sm text-slate-200">
          <thead>
            <tr className="text-slate-400">
              {table.getHeaderGroups()[0].headers.map((header) => (
                <th key={header.id} className="px-4 py-3">
                  {header.isPlaceholder ? null : (
                    <button
                      type="button"
                      className="flex items-center gap-2"
                      onClick={header.column.getToggleSortingHandler()}
                    >
                      {flexRender(header.column.columnDef.header, header.getContext())}
                      {{ asc: '↑', desc: '↓' }[header.column.getIsSorted() as string] ?? null}
                    </button>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data.length ? (
              table.getRowModel().rows.map((row) => (
                <tr
                  key={row.id}
                  className="cursor-pointer rounded-[22px] bg-slate-900/70 transition hover:bg-slate-900/90"
                  onClick={() => router.push(`/candidates/${row.original.id}`)}
                >
                  {row.getVisibleCells().map((cell) => (
                    <td key={cell.id} className="px-4 py-4 align-top">
                      {flexRender(cell.column.columnDef.cell, cell.getContext())}
                    </td>
                  ))}
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-slate-400">
                  No candidates found for the selected filters.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <p className="text-sm text-slate-400">Showing {data.length} of {total} candidates</p>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={page <= 1} onClick={() => onPage(Math.max(1, page - 1))}>Previous</Button>
          <Button variant="outline" disabled={page >= totalPages} onClick={() => onPage(Math.min(totalPages, page + 1))}>Next</Button>
        </div>
      </div>
    </div>
  );
}
