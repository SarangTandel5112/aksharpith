"use client";

import { useCategoriesList } from "@features/admin/categories/hooks/useCategories";
import type { Category } from "@features/admin/categories/types/categories.types";
import { useDepartmentsList } from "@features/admin/departments/hooks/useDepartments";
import type { Department } from "@features/admin/departments/types/departments.types";
import { useSubCategoriesList } from "@features/admin/sub-categories/hooks/useSubCategories";
import type { SubCategory } from "@features/admin/sub-categories/types/sub-categories.types";
import { useState } from "react";
import { useProductMutations, useProductsList } from "../hooks/useProducts";
import type { CreateProductInput } from "../schemas/products.schema";
import type { Product } from "../types/products.types";

export function ProductsModule(): React.JSX.Element {
  const { data, isLoading, isError } = useProductsList();
  const { create, update, remove } = useProductMutations();
  const [editItem, setEditItem] = useState<Product | null>(null);
  const [showCreate, setShowCreate] = useState(false);

  if (isLoading)
    return (
      <div className="animate-pulse h-40 rounded-lg bg-[var(--surface-subtle)]" />
    );
  if (isError)
    return (
      <p className="text-sm text-[var(--color-danger)]">
        Failed to load products.
      </p>
    );

  const items: Product[] = (data?.data?.items ?? []) as Product[];

  return (
    <div>
      <div className="flex items-center justify-between mb-4">
        <h1 className="text-xl font-semibold text-[var(--text-heading)]">
          Products
        </h1>
        <button
          type="button"
          onClick={() => setShowCreate(true)}
          className="rounded-md bg-[var(--primary-500)] px-3 py-1.5 text-sm font-medium text-white hover:bg-[var(--primary-600)]"
        >
          Add Product
        </button>
      </div>
      <div className="rounded-lg border border-[var(--surface-border)] bg-[var(--surface-page)] overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[var(--surface-border)] bg-[var(--surface-subtle)]">
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Name
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                SKU
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Price
              </th>
              <th className="text-left px-4 py-3 font-medium text-[var(--text-muted)]">
                Category
              </th>
              <th className="text-right px-4 py-3 font-medium text-[var(--text-muted)]">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {items.length === 0 ? (
              <tr>
                <td
                  colSpan={5}
                  className="text-center py-8 text-[var(--text-muted)]"
                >
                  No products found.
                </td>
              </tr>
            ) : (
              items.map((item) => (
                <tr
                  key={item.id}
                  className="border-b border-[var(--surface-border)] last:border-0"
                >
                  <td className="px-4 py-3 font-medium text-[var(--text-heading)]">
                    {item.name}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">
                    {item.sku}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">
                    {(item.price / 100).toFixed(2)}
                  </td>
                  <td className="px-4 py-3 text-[var(--text-body)]">
                    {item.category.name}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setEditItem(item)}
                        className="text-xs text-[var(--primary-500)] hover:underline"
                      >
                        Edit
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`Delete "${item.name}"?`))
                            remove.mutate(item.id);
                        }}
                        className="text-xs text-[var(--color-danger)] hover:underline"
                      >
                        Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      {showCreate && (
        <ProductForm
          onSubmit={(input) =>
            create.mutate(input, { onSuccess: () => setShowCreate(false) })
          }
          onCancel={() => setShowCreate(false)}
          isSubmitting={create.isPending}
        />
      )}
      {editItem !== null && (
        <ProductForm
          initial={editItem}
          onSubmit={(input) =>
            update.mutate(
              { id: editItem.id, input },
              { onSuccess: () => setEditItem(null) },
            )
          }
          onCancel={() => setEditItem(null)}
          isSubmitting={update.isPending}
        />
      )}
    </div>
  );
}

type ProductFormProps = {
  initial?: Product;
  onSubmit: (input: CreateProductInput) => void;
  onCancel: () => void;
  isSubmitting: boolean;
};

function ProductForm(props: ProductFormProps): React.JSX.Element {
  const { data: deptData } = useDepartmentsList();
  const { data: catData } = useCategoriesList();
  const { data: subCatData } = useSubCategoriesList();
  const depts: Department[] = (deptData?.data?.items ?? []) as Department[];
  const cats: Category[] = (catData?.data?.items ?? []) as Category[];
  const subCats: SubCategory[] = (subCatData?.data?.items ??
    []) as SubCategory[];

  const [name, setName] = useState(props.initial?.name ?? "");
  const [description, setDescription] = useState(
    props.initial?.description ?? "",
  );
  const [sku, setSku] = useState(props.initial?.sku ?? "");
  const [price, setPrice] = useState<number>(props.initial?.price ?? 0);
  const [departmentId, setDepartmentId] = useState(
    props.initial?.department.id ?? "",
  );
  const [categoryId, setCategoryId] = useState(
    props.initial?.category.id ?? "",
  );
  const [subCategoryId, setSubCategoryId] = useState(
    props.initial?.subCategory.id ?? "",
  );

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
      <div className="bg-[var(--surface-page)] rounded-lg p-6 w-full max-w-lg shadow-xl overflow-y-auto max-h-screen">
        <h2 className="text-base font-semibold text-[var(--text-heading)] mb-4">
          {props.initial !== undefined ? "Edit Product" : "Create Product"}
        </h2>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            props.onSubmit({
              name,
              description,
              sku,
              price,
              departmentId,
              categoryId,
              subCategoryId,
            });
          }}
          className="flex flex-col gap-3"
        >
          <div className="flex flex-col gap-1">
            <label
              htmlFor="prod-name"
              className="text-sm text-[var(--text-muted)]"
            >
              Name *
            </label>
            <input
              id="prod-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            />
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="prod-description"
              className="text-sm text-[var(--text-muted)]"
            >
              Description
            </label>
            <input
              id="prod-description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
            />
          </div>
          <div className="flex gap-3">
            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="prod-sku"
                className="text-sm text-[var(--text-muted)]"
              >
                SKU *
              </label>
              <input
                id="prod-sku"
                value={sku}
                onChange={(e) => setSku(e.target.value)}
                className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
                required
              />
            </div>
            <div className="flex flex-col gap-1 flex-1">
              <label
                htmlFor="prod-price"
                className="text-sm text-[var(--text-muted)]"
              >
                Price (paise) *
              </label>
              <input
                id="prod-price"
                type="number"
                value={price}
                onChange={(e) => setPrice(Number(e.target.value))}
                className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
                required
                min={1}
              />
            </div>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="prod-department"
              className="text-sm text-[var(--text-muted)]"
            >
              Department *
            </label>
            <select
              id="prod-department"
              value={departmentId}
              onChange={(e) => setDepartmentId(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            >
              <option value="">Select department</option>
              {depts.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="prod-category"
              className="text-sm text-[var(--text-muted)]"
            >
              Category *
            </label>
            <select
              id="prod-category"
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            >
              <option value="">Select category</option>
              {cats.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex flex-col gap-1">
            <label
              htmlFor="prod-sub-category"
              className="text-sm text-[var(--text-muted)]"
            >
              Sub-Category *
            </label>
            <select
              id="prod-sub-category"
              value={subCategoryId}
              onChange={(e) => setSubCategoryId(e.target.value)}
              className="rounded border border-[var(--surface-border)] bg-[var(--surface-page)] px-3 py-2 text-sm text-[var(--text-body)]"
              required
            >
              <option value="">Select sub-category</option>
              {subCats.map((sc) => (
                <option key={sc.id} value={sc.id}>
                  {sc.name}
                </option>
              ))}
            </select>
          </div>
          <div className="flex justify-end gap-2 mt-2">
            <button
              type="button"
              onClick={props.onCancel}
              className="px-4 py-2 text-sm rounded border border-[var(--surface-border)] text-[var(--text-body)]"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={props.isSubmitting}
              className="px-4 py-2 text-sm rounded bg-[var(--primary-500)] text-white disabled:opacity-60"
            >
              {props.isSubmitting ? "Saving…" : "Save"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
