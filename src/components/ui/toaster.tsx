"use client"

import { useToast } from "@/hooks/use-toast"
import { Toast } from "@/components/ui/toast"

export function Toaster() {
  const { toasts } = useToast()

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-[100] flex flex-col items-center gap-2 px-4 pb-6 sm:items-end">
      {toasts.map(({ id, title, description, variant, ...props }) => (
        <Toast
          key={id}
          id={id}
          title={title}
          description={description}
          variant={variant}
          className="pointer-events-auto"
          {...props}
        />
      ))}
    </div>
  )
}
