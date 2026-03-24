'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form"
import { Input } from "@shared/components/ui/input"
import { Textarea } from "@shared/components/ui/textarea"
import type React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const GroupFormSchema = z.object({
  name: z.string().min(1, "Group name is required").max(100),
  description: z.string().max(500).optional().transform(v => v || undefined),
  isActive: z.boolean().default(true),
})
type GroupFormValues = z.infer<typeof GroupFormSchema>

type Group = {
  id: string
  name: string
  description: string | null
  isActive: boolean
}

type GroupFormDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: GroupFormValues) => void
  isSubmitting: boolean
  group?: Group
}

export function GroupFormDialog(props: GroupFormDialogProps): React.JSX.Element {
  const form = useForm<z.input<typeof GroupFormSchema>, unknown, GroupFormValues>({
    resolver: zodResolver(GroupFormSchema),
    defaultValues: {
      name: props.group?.name ?? "",
      description: props.group?.description ?? "",
      isActive: props.group?.isActive ?? true,
    },
  })

  const title = props.group ? "Edit Group" : "Add Group"
  const description = props.group ? "Update the product group details." : "Create a new product group."

  function handleSubmit(values: GroupFormValues): void {
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
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name</FormLabel>
                    <FormControl><Input placeholder="Group name" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl><Textarea placeholder="Optional description" {...field} /></FormControl>
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
