'use client';

import { useMemo } from 'react';
import { ColumnDef, createColumnHelper, flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table';
import { MoreHorizontal, RotateCcw, Eye, Archive, RefreshCcw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import type { OfferTemplateItem } from '@/types/template';

interface TemplateTableProps {
  data: OfferTemplateItem[];
  selectedIds: string[];
  onSelectionChange: (ids: string[]) => void;
  onEdit: (id: string) => void;
  onPreview: (id: string) => void;
  onDuplicate: (id: string) => void;
  onArchive: (id: string) => void;
  onRestore: (id: string) => void;
}

const columnHelper = createColumnHelper<OfferTemplateItem>();

export function TemplateTable({ data, selectedIds, onSelectionChange, onEdit, onPreview, onDuplicate, onArchive, onRestore }: TemplateTableProps) {
  const allSelected = data.length > 0 && selectedIds.length === data.length;

  const columns = useMemo<ColumnDef<OfferTemplateItem, any>[]>(
    () => [
      columnHelper.display({
        id: 'select',
        header: () => (
          <input
            type="checkbox"
            checked={allSelected}
            onChange={() => {
              if (allSelected) {
                onSelectionChange([]);
              } else {
                onSelectionChange(data.map((template) => template.id));
              }
            }}
            className="h-4 w-4 rounded border-slate-600 text-cyan-500"
          />
        ),
        cell: ({ row }) => {
          const item = row.original;
          const checked = selectedIds.includes(item.id);
          return (
            <input
              type="checkbox"
              checked={checked}
              onChange={() => {
                const nextSelection = checked
                  ? selectedIds.filter((id) => id !== item.id)
                  : [...selectedIds, item.id];
                onSelectionChange(nextSelection);
              }}
              className="h-4 w-4 rounded border-slate-600 text-cyan-500"
            />
          );
        },
      }),
      columnHelper.accessor('title', {
        header: 'Title',
        cell: (info) => <span className="font-medium text-white">{info.getValue()}</span>,
      }),
      columnHelper.accessor('category', {
        header: 'Category',
        cell: (info) => <Badge variant="default">{info.getValue()}</Badge>,
      }),
      columnHelper.accessor('createdBy', {
        header: 'Author',
      }),
      columnHelper.accessor('updatedAt', {
        header: 'Updated',
      }),
      columnHelper.accessor('isArchived', {
        header: 'Status',
        cell: (info) => (
          <Badge variant={info.getValue() ? 'default' : 'info'}>
            {info.getValue() ? 'Archived' : 'Active'}
          </Badge>
        ),
      }),
      columnHelper.display({
        id: 'actions',
        header: 'Actions',
        cell: ({ row }) => {
          const item = row.original;
          return (
            <div className="flex flex-wrap items-center gap-2">
              <Button type="button" variant="ghost" className="rounded-3xl px-3 py-2" onClick={() => onPreview(item.id)}>
                <Eye className="h-4 w-4" />
              </Button>
              <Button type="button" variant="secondary" className="rounded-3xl px-3 py-2" onClick={() => onEdit(item.id)}>
                Edit
              </Button>
              <Button type="button" variant="ghost" className="rounded-3xl px-3 py-2" onClick={() => onDuplicate(item.id)}>
                <RotateCcw className="h-4 w-4" />
              </Button>
              {item.isArchived ? (
                <Button type="button" variant="outline" className="rounded-3xl px-3 py-2" onClick={() => onRestore(item.id)}>
                  <RefreshCcw className="h-4 w-4" />
                </Button>
              ) : (
                <Button type="button" variant="ghost" className="rounded-3xl px-3 py-2" onClick={() => onArchive(item.id)}>
                  <Archive className="h-4 w-4" />
                </Button>
              )}
            </div>
          );
        },
      }),
    ],
    [allSelected, data, onArchive, onDuplicate, onEdit, onPreview, onRestore, onSelectionChange, selectedIds]
  );

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
  });

  return (
    <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-4">
      <div className="overflow-x-auto">
        <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
          <thead className="bg-slate-950/90 text-slate-400">
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map((header) => (
                  <th key={header.id} className="border-b border-slate-800 px-4 py-3 font-medium">
                    {header.isPlaceholder ? null : flexRender(header.column.columnDef.header, header.getContext())}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="hover:bg-slate-950/90 transition-colors">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="border-b border-slate-800 px-4 py-4 align-top text-slate-200">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
