'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form"
import { Input } from "@shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import type React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"
import type { User } from "../types/users.types"

const ROLES = ["Admin", "Manager", "Staff", "Viewer"] as const

const UserFormSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().min(1, "Email is required").email("Enter a valid email"),
  roleName: z.string().min(1, "Please select a role"),
  isActive: z.boolean().default(true),
})
type UserFormValues = z.infer<typeof UserFormSchema>

type UserFormDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: UserFormValues) => void
  isSubmitting: boolean
  user?: User
}

export function UserFormDialog(props: UserFormDialogProps): React.JSX.Element {
  const form = useForm<z.input<typeof UserFormSchema>, unknown, UserFormValues>({
    resolver: zodResolver(UserFormSchema),
    defaultValues: {
      firstName: props.user?.firstName ?? "",
      lastName: props.user?.lastName ?? "",
      email: props.user?.email ?? "",
      roleName: props.user?.roleName ?? "",
      isActive: props.user?.isActive ?? true,
    },
  })

  const title = props.user ? "Edit User" : "Add User"
  const description = props.user ? "Update user details and access role." : "Create a new user account."

  function handleSubmit(values: UserFormValues): void {
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
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Personal Details</p>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="firstName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>First Name</FormLabel>
                      <FormControl><Input placeholder="First name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="lastName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Last Name</FormLabel>
                      <FormControl><Input placeholder="Last name" {...field} /></FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl><Input type="email" placeholder="user@example.com" {...field} /></FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400">Access</p>
              <FormField
                control={form.control}
                name="roleName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger><SelectValue placeholder="Select a role" /></SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {ROLES.map(r => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                      </SelectContent>
                    </Select>
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
