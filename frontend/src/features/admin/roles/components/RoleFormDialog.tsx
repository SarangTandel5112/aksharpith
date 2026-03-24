'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form"
import { Input } from "@shared/components/ui/input"
import type React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { Role } from "../types/roles.types"

const RoleFormSchema = z.object({
  roleName: z.string().min(2, "Role name must be at least 2 characters").max(50, "Role name must be at most 50 characters"),
  isActive: z.boolean().default(true),
})
type RoleFormValues = z.infer<typeof RoleFormSchema>

type RoleFormDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: RoleFormValues) => void
  isSubmitting: boolean
  role?: Role
}

export function RoleFormDialog(props: RoleFormDialogProps): React.JSX.Element {
  const form = useForm<z.input<typeof RoleFormSchema>, unknown, RoleFormValues>({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      roleName: props.role?.roleName ?? "",
      isActive: props.role?.isActive ?? true,
    },
  })

  const title = props.role ? "Edit Role" : "Add Role"
  const description = props.role ? "Update the role name." : "Create a new access role."

  function handleSubmit(values: RoleFormValues): void {
    props.onSubmit(values)
  }

  function handleOpenChange(open: boolean): void {
    if (!open) props.onClose()
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[560px]">
        <DialogHeader className="border-b border-zinc-100 pb-4">
          <DialogTitle className="text-base font-semibold text-zinc-900">{title}</DialogTitle>
          <DialogDescription className="text-sm text-zinc-500">{description}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)}>
            <div className="space-y-5 py-5">
              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl><Input placeholder="e.g. Manager, Staff" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl><Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} /></FormControl>
                    <FormLabel className="font-normal text-sm text-zinc-700 cursor-pointer">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="border-t border-zinc-100 pt-4">
              <Button type="button" variant="outline" onClick={props.onClose} disabled={props.isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={props.isSubmitting}>{props.isSubmitting ? "Saving…" : "Save"}</Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
