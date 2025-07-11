'use client'

import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>, field: string) => {
    switch (field) {
      case 'fullName':
      case 'companyReservation':
        e.target.value = e.target.value.replace(/[^a-zA-ZÀ-ÿ\s-']/g, '')
        break
      case 'phone':
        e.target.value = e.target.value.replace(/[^0-9+()\s-]/g, '')
        break
      case 'email':
        e.target.value = e.target.value.replace(/[^a-zA-Z0-9@._-]/g, '')
        break
      default:
        break
    }
  }

  return (
    <input
      onChange={(e) => props.name && handleChange(e, props.name)}
      type={type}
      data-slot="input"
      className={cn(
        'file:text-foreground placeholder:text-muted-foreground selection:bg-primary selection:text-primary-foreground dark:bg-input/30 border-input flex h-9 w-full min-w-0 rounded-md border bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
        'focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px]',
        'aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
