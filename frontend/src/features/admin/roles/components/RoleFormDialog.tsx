"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/button";
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
  roleName: z.string().min(1, "Role name is required").max(100),
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
      roleName: props.role?.roleName ?? props.role?.name ?? "",
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
            className="flex min-h-0 flex-1 flex-col"
          >
            <div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-6">
              <FormField
                control={form.control}
                name="roleName"
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
