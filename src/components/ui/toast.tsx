"use client"

import * as React from "react"

import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"

const ToastProvider = React.Fragment

export type ToastProps = React.ComponentPropsWithoutRef<"li"> & {
  id: string | number
  title?: React.ReactNode
  description?: React.ReactNode
  action?: React.ReactElement
  variant?: "default" | "destructive"
  open?: boolean
  onOpenChange?: (open: boolean) => void
}

export type ToastActionElement = React.ReactElement<{
  altText: string
}>

const TOAST_VARIANTS: Record<string, string> = {
  default: "border bg-popover text-popover-foreground",
  destructive:
    "destructive group border-destructive/30 bg-destructive/10 text-destructive backdrop-blur",
}

export function Toast({ id, title, description, className, variant = "default", ...props }: ToastProps) {
  return (
    <li
      role="status"
      aria-live="polite"
      data-state="open"
      data-swipe="end"
      data-variant={variant}
      className={cn(
        "group pointer-events-auto relative flex w-full items-center justify-between space-x-4 overflow-hidden rounded-md p-6 pr-8 shadow-lg transition-all",
        TOAST_VARIANTS[variant] ?? TOAST_VARIANTS.default,
        className
      )}
      {...props}
    >
      <div className="flex flex-col gap-1">
        {title ? <div className="text-sm font-semibold">{title}</div> : null}
        {description ? (
          <div className="text-sm opacity-90 [&_p]:leading-relaxed">{description}</div>
        ) : null}
      </div>
    </li>
  )
}

export function Toaster() {
  const { toasts } = useToast()

  return (
    <ToastProvider>
      <section
        aria-label="Notifications"
        tabIndex={-1}
        className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse gap-2 p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"
      >
        <ul className="flex flex-col gap-2">
          {toasts.map(({ id, title, description, variant, ...props }) => (
            <Toast
              key={id}
              id={id}
              title={title}
              description={description}
              variant={variant}
              {...props}
            />
          ))}
        </ul>
      </section>
    </ToastProvider>
  )
}
