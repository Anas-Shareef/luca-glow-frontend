import React from "react"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { AlertTriangle } from "lucide-react"

interface ConfirmDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
  title: string
  description: string
  confirmText?: string
  cancelText?: string
  variant?: "default" | "destructive"
}

export function ConfirmDialog({
  open,
  onOpenChange,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  variant = "destructive"
}: ConfirmDialogProps) {
  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent className="rounded-[24px] border-none shadow-2xl max-w-[380px] p-8">
        <AlertDialogHeader className="flex flex-col items-center text-center space-y-4">
          <div className={`w-14 h-14 rounded-full flex items-center justify-center ${variant === 'destructive' ? 'bg-rose-50 text-rose-500' : 'bg-slate-50 text-slate-500'}`}>
            <AlertTriangle className="w-7 h-7" />
          </div>
          <AlertDialogTitle className="text-xl font-display font-bold tracking-tight text-slate-900">
            {title}
          </AlertDialogTitle>
          <AlertDialogDescription className="text-slate-500 leading-relaxed text-sm">
            {description}
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col sm:flex-col gap-2 mt-6">
          <AlertDialogAction 
            onClick={onConfirm}
            className={`w-full py-6 rounded-xl font-bold text-sm shadow-none ${variant === 'destructive' ? 'bg-rose-600 hover:bg-rose-700 text-white' : 'bg-slate-900 hover:bg-slate-800 text-white'}`}
          >
            {confirmText}
          </AlertDialogAction>
          <AlertDialogCancel className="w-full py-6 rounded-xl font-bold text-sm border-none bg-slate-50 hover:bg-slate-100 text-slate-500 transition-colors">
            {cancelText}
          </AlertDialogCancel>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  )
}
