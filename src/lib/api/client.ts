import { getAccessToken } from './auth';
import type {
  CategoryDto,
  WebsiteProductDetailDto,
  WebsiteProductDto,
  PaginatedResponse,
} from './types';

const API_HOST = process.env.API_HOST ?? 'https://localhost:44351';

async function apiFetch<T>(path: string, params?: Record<string, string | number>): Promise<T> {
  const token = await getAccessToken();
  const url = new URL(`${API_HOST}${path}`);

  if (params) {
    for (const [key, value] of Object.entries(params)) {
      url.searchParams.set(key, String(value));
    }
  }

  const response = await fetch(url.toString(), {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/json',
    },
  });

  if (!response.ok) {
    throw new Error(`API ${response.status} for ${path}: ${await response.text()}`);
  }

  return response.json() as Promise<T>;
}

export async function fetchCategories(pageSize = 100): Promise<PaginatedResponse<CategoryDto>> {
  return apiFetch<PaginatedResponse<CategoryDto>>(
    '/api/catalog/v1/categories',
    { pageSize },
  );
}

export async function fetchProducts(pageSize = 100, pageIndex = 0): Promise<PaginatedResponse<WebsiteProductDto>> {
  return apiFetch<PaginatedResponse<WebsiteProductDto>>(
    '/api/catalog/v1/products/website',
    { pageSize, pageIndex },
  );
}

export async function fetchProductDetail(id: number): Promise<WebsiteProductDetailDto> {
  return apiFetch<WebsiteProductDetailDto>(`/api/catalog/v1/products/website/${id}`);
}
