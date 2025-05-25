import axios from '../axios';
import { Product, Category, CreateProductDto, UpdateProductDto, CreateCategoryDto } from './types';

const productsApi = {
  // Products endpoints
  getProducts: async (params?: { page?: number; limit?: number; q?: string }) => {
    const { data } = await axios.get<{ data: {products: Product[], count: number}  }>('admin/product', { params });
    return data;
  },

  getProductById: async (productId: string) => {
    const { data } = await axios.get<Product>(`admin/product?_id=${productId}`);
    return data;
  },

  createProduct: async (productData: CreateProductDto) => {
    const { data } = await axios.post<Product>('admin/product', productData);
    return data;
  },

  updateProduct: async (productId: string, updateData: UpdateProductDto) => {
    const { data } = await axios.patch<Product>(`admin/product/${productId}`, updateData);
    return data;
  },

  deleteProduct: async (productId: string) => {
    const { data } = await axios.delete<{ success: boolean }>(`admin/product/${productId}`);
    return data;
  },

  // Categories endpoints
  getCategories: async () => {
    const { data } = await axios.get<Category[]>('product/categories');
    return data;
  },

  createCategory: async (categoryData: CreateCategoryDto) => {
    const { data } = await axios.post<Category>('admin/product/categories', categoryData);
    return data;
  },
};

export default productsApi; 