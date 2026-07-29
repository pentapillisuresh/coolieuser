import client from './client';

export const getCategories = () => client.get('/categories');

export const getCategoryById = (id: number) => client.get(`/categories/${id}`);

export const getCategoryBySlug = (slug: string) =>
  client.get(`/categories/slug/${slug}`);

export const getCategoriesWithCount = () => client.get('/categories/with-count');