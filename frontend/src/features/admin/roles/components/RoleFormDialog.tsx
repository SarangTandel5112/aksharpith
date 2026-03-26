"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/button";
import { Checkbox } from "@shared/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@shared/components/ui/form";
import { Input } from "@shared/components/ui/input";
import type React from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import type { Role } from "../types/roles.types";

const RoleFormSchema = z.object({
  name: z.string().min(1, "Role name is required").max(100),
  isActive: z.boolean().default(true),
});

type RoleFormValues = z.infer<typeof RoleFormSchema>;

type RoleFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => void;
  isSubmitting: boolean;
  role?: Role;
};

export function RoleFormDialog(props: RoleFormDialogProps): React.JSX.Element {
  const form = useForm<
    z.input<typeof RoleFormSchema>,
    unknown,
    RoleFormValues
  >({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      name: props.role?.name ?? "",
      isActive: props.role?.isActive ?? true,
    },
  });
  return (
    <Dialog open={props.open} onOpenChange={(open) => !open && props.onClose()}>
      <DialogContent className="sm:max-w-[540px]">
        <DialogHeader>
          <DialogTitle>{props.role ? "Edit Role" : "Add Role"}</DialogTitle>
          <DialogDescription>Enter the role name.</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => props.onSubmit(values))}
            className="space-y-6"
          >
            <div className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Role Name</FormLabel>
                    <FormControl>
                      <Input placeholder="e.g. Admin" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="isActive"
                render={({ field }) => (
                  <FormItem className="flex items-center gap-3 rounded-2xl border border-zinc-200 px-4 py-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value ?? false}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1">
                      <FormLabel className="text-sm font-medium text-zinc-900">
                        Active
                      </FormLabel>
                      <p className="text-sm text-zinc-500">
                        Allow this role to be assigned to users.
                      </p>
                    </div>
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={props.onClose}
                disabled={props.isSubmitting}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={props.isSubmitting}>
                {props.isSubmitting ? "Saving…" : "Save Role"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
