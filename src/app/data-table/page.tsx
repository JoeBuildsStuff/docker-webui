'use client'

import DataTablePayments from '@/components/payments/data-table-payments'

export default function Page() {
  return (
    <div className="flex flex-col">
      <div className="flex items-center justify-between">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight">Payments</h1>
          <p className="text-muted-foreground">Manage your payments.</p>
        </div>
      </div>
      <DataTablePayments />
    </div>
  )
}
