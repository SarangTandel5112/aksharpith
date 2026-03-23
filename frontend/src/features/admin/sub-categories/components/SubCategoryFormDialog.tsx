'use client'

import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form"
import { Input } from "@shared/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@shared/components/ui/select"
import { Textarea } from "@shared/components/ui/textarea"
import type React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const SubCategoryFormSchema = z.object({
  name: z.string().min(1, "Sub-category name is required").max(100),
  categoryId: z.string().min(1, "Please select a parent category"),
  description: z.string().max(500).optional().transform(v => v || undefined),
  isActive: z.boolean().default(true),
})

type SubCategoryFormValues = z.infer<typeof SubCategoryFormSchema>

const CATEGORIES = ["Electronics", "Clothing", "Food & Beverage", "Home Appliances", "Books", "Sports"] as const

type SubCategory = {
  id: string
  name: string
  categoryName: string
  description: string | null
  isActive: boolean
}

type SubCategoryFormDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: SubCategoryFormValues) => void
  isSubmitting: boolean
  subCategory?: SubCategory
}

export function SubCategoryFormDialog(props: SubCategoryFormDialogProps): React.JSX.Element {
  const form = useForm<z.input<typeof SubCategoryFormSchema>, unknown, SubCategoryFormValues>({
    resolver: zodResolver(SubCategoryFormSchema),
    defaultValues: {
      name: props.subCategory?.name ?? "",
      categoryId: props.subCategory?.categoryName ?? "",
      description: props.subCategory?.description ?? "",
      isActive: props.subCategory?.isActive ?? true,
    },
  })

  const title = props.subCategory ? "Edit Sub-category" : "Add Sub-category"
  const description = props.subCategory ? "Update the sub-category details." : "Create a new product sub-category."

  function handleSubmit(values: SubCategoryFormValues): void {
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
                    <FormControl>
                      <Input placeholder="Sub-category name" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Parent Category</FormLabel>
                    <Select value={field.value} onValueChange={field.onChange}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {CATEGORIES.map(cat => (
                          <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
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
                    <FormControl>
                      <Textarea placeholder="Optional description" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 space-y-0">
                    <FormControl>
                      <Checkbox checked={field.value ?? false} onCheckedChange={field.onChange} />
                    </FormControl>
                    <FormLabel className="font-normal text-sm text-zinc-700 cursor-pointer">Active</FormLabel>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter className="border-t border-zinc-100 pt-4">
              <Button type="button" variant="outline" onClick={props.onClose} disabled={props.isSubmitting}>Cancel</Button>
              <Button type="submit" disabled={props.isSubmitting}>
                {props.isSubmitting ? "Saving…" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  )
}
