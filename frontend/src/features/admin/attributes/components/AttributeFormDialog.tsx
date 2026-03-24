'use client'

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { Button } from "@shared/components/ui/button"
import { Checkbox } from "@shared/components/ui/checkbox"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@shared/components/ui/dialog"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@shared/components/ui/form"
import { Input } from "@shared/components/ui/input"
import { IconPlus, IconX } from "@tabler/icons-react"
import type React from "react"
import { useForm } from "react-hook-form"
import { z } from "zod"

const AttributeFormSchema = z.object({
  name: z.string().min(1, "Attribute name is required").max(100),
  isActive: z.boolean().default(true),
})
type AttributeFormValues = z.infer<typeof AttributeFormSchema>

type Attribute = {
  id: string
  name: string
  values: string[]
  isActive: boolean
}

type AttributeFormDialogProps = {
  open: boolean
  onClose: () => void
  onSubmit: (values: AttributeFormValues, attributeValues: string[]) => void
  isSubmitting: boolean
  attribute?: Attribute
}

export function AttributeFormDialog(props: AttributeFormDialogProps): React.JSX.Element {
  const [attributeValues, setAttributeValues] = useState<string[]>(
    props.attribute?.values ?? [""]
  )

  const form = useForm<z.input<typeof AttributeFormSchema>, unknown, AttributeFormValues>({
    resolver: zodResolver(AttributeFormSchema),
    defaultValues: {
      name: props.attribute?.name ?? "",
      isActive: props.attribute?.isActive ?? true,
    },
  })

  const title = props.attribute ? "Edit Attribute" : "Add Attribute"
  const description = props.attribute ? "Update attribute details and values." : "Create a new product attribute."

  function handleSubmit(values: AttributeFormValues): void {
    const nonEmptyValues = attributeValues.filter(v => v.trim().length > 0)
    props.onSubmit(values, nonEmptyValues)
  }

  function handleOpenChange(open: boolean): void {
    if (!open) props.onClose()
  }

  function addValue(): void {
    setAttributeValues(prev => [...prev, ""])
  }

  function removeValue(index: number): void {
    setAttributeValues(prev => prev.filter((_, i) => i !== index))
  }

  function updateValue(index: number, value: string): void {
    setAttributeValues(prev => prev.map((v, i) => (i === index ? value : v)))
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
                    <FormLabel>Attribute Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Color, Size, Material" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <div>
                <p className="text-xs font-semibold uppercase tracking-wide text-zinc-400 mb-3">Attribute Values</p>
                <div className="space-y-2">
                  {attributeValues.map((value, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <Input
                        value={value}
                        onChange={(e) => updateValue(index, e.target.value)}
                        placeholder={`Value ${index + 1}`}
                        className="flex-1"
                      />
                      {attributeValues.length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeValue(index)}
                          className="p-1.5 rounded hover:bg-zinc-100 text-zinc-400 hover:text-red-500 transition-colors"
                        >
                          <IconX size={16} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
                <button
                  type="button"
                  onClick={addValue}
                  className="mt-2 flex items-center gap-1.5 text-xs font-medium text-zinc-600 hover:text-zinc-900 transition-colors"
                >
                  <IconPlus size={14} />
                  Add Value
                </button>
              </div>
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
