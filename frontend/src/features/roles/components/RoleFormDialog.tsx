"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@shared/components/ui/button";
import {
  Dialog,
  DialogContent,
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
import { Textarea } from "@shared/components/ui/textarea";
import type React from "react";
import { useForm } from "react-hook-form";
import type { z } from "zod";
import type { Role } from "../types/roles.types";
import {
  RoleFormSchema,
  type RoleFormValues,
} from "../validations/role-form.schema";

// ── Types ─────────────────────────────────────────────────────────────────────

type RoleFormDialogProps = {
  open: boolean;
  onClose: () => void;
  onSubmit: (values: RoleFormValues) => void;
  isSubmitting: boolean;
  role?: Role;
};

// ── Component ─────────────────────────────────────────────────────────────────

export function RoleFormDialog(
  props: RoleFormDialogProps,
): React.JSX.Element {
  const form = useForm<
    z.input<typeof RoleFormSchema>,
    unknown,
    RoleFormValues
  >({
    resolver: zodResolver(RoleFormSchema),
    defaultValues: {
      roleName: props.role?.roleName ?? "",
      description: props.role?.description ?? "",
    },
  });

  const title = props.role ? "Edit Role" : "Add Role";

  function handleSubmit(values: RoleFormValues): void {
    props.onSubmit(values);
  }

  function handleOpenChange(open: boolean): void {
    if (!open) props.onClose();
  }

  return (
    <Dialog open={props.open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="roleName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Role Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Role name" {...field} />
                  </FormControl>
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
                {props.isSubmitting ? "Saving\u2026" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
