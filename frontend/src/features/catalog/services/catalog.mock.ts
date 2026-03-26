import type {
  CategoryResponseDto,
} from "@features/admin/categories/contracts/categories.contracts";
import type { DepartmentResponseDto } from "@features/departments/contracts/departments.contracts";
import type { ApiResponse, PaginatedResponse } from "@shared/types/core";
import type { CatalogProduct, FilterState } from "../types/catalog.types";
import {
  MOCK_CATEGORIES,
  MOCK_DEPARTMENTS,
  MOCK_PRODUCTS,
  getCategoryForProduct,
} from "@features/admin/products/services/product-admin.mock";

function paginate<T>(
  items: T[],
  page: number,
  limit: number,
): PaginatedResponse<T> {
  const total = items.length;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const currentPage = Math.min(Math.max(page, 1), totalPages);
  const start = (currentPage - 1) * limit;

  return {
    items: items.slice(start, start + limit),
    total,
    page: currentPage,
    limit,
    totalPages,
  };
}

function buildEnvelope<T>(data: T): ApiResponse<T> {
  return {
    statusCode: 200,
    message: "OK",
    data,
  };
}

export function getCatalogCategory(
  product: CatalogProduct,
): CategoryResponseDto | undefined {
  return getCategoryForProduct(product);
}

export function getCatalogProducts(
  filters: Partial<FilterState>,
): ApiResponse<PaginatedResponse<CatalogProduct>> {
  const searchTerm = filters.search?.trim().toLowerCase() ?? "";
  const page = filters.page ?? 1;
  const limit = filters.limit ?? 12;

  const filtered = MOCK_PRODUCTS.filter((product) => {
    const category = getCatalogCategory(product);
    const matchesSearch =
      searchTerm.length === 0
        ? true
        : [
            product.name,
            product.code,
            product.description ?? "",
            product.department?.name ?? "",
            product.subCategory?.name ?? "",
            category?.name ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(searchTerm);
    const matchesCategory =
      filters.categoryId === null || filters.categoryId === undefined
        ? true
        : category?.id === filters.categoryId;
    const matchesDepartment =
      filters.departmentId === null || filters.departmentId === undefined
        ? true
        : product.departmentId === filters.departmentId;
    const matchesMinPrice =
      filters.minPrice === null || filters.minPrice === undefined
        ? true
        : product.price >= filters.minPrice;
    const matchesMaxPrice =
      filters.maxPrice === null || filters.maxPrice === undefined
        ? true
        : product.price <= filters.maxPrice;

    return (
      matchesSearch &&
      matchesCategory &&
      matchesDepartment &&
      matchesMinPrice &&
      matchesMaxPrice
    );
  });

  return buildEnvelope(paginate(filtered, page, limit));
}

export function getCatalogProductById(
  productId: string,
): ApiResponse<CatalogProduct> | undefined {
  const product = MOCK_PRODUCTS.find((item) => item.id === productId);

  return product ? buildEnvelope(product) : undefined;
}

export function getCatalogCategories(): ApiResponse<
  PaginatedResponse<CategoryResponseDto>
> {
  return buildEnvelope(
    paginate(MOCK_CATEGORIES, 1, Math.max(MOCK_CATEGORIES.length, 1)),
  );
}

export function getCatalogDepartments(): ApiResponse<
  PaginatedResponse<DepartmentResponseDto>
> {
  return buildEnvelope(
    paginate(MOCK_DEPARTMENTS, 1, Math.max(MOCK_DEPARTMENTS.length, 1)),
  );
}
