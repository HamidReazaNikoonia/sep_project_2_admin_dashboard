export interface Product {
  _id: string;
  title: string;
  subtitle: string;
  description: string;
  slug: string;
  brand: string;
  qr_code?: string;
  images: string[];
  category: string;
  thumbnail: string;
  discountable: {
    status: boolean;
    percent: number;
  };
  price: number;
  countInStock: number;
  status: string;
}

export interface Category {
  _id: string;
  name: string;
}

export interface CreateProductDto {
  title: string;
  subtitle: string;
  description: string;
  brand: string;
  qr_code?: string;
  images: string[];
  category: string;
  thumbnail: string;
  discountable?: {
    status: boolean;
    percent: number;
  };
  price: number;
}

export interface UpdateProductDto extends Partial<CreateProductDto> {}

export interface CreateCategoryDto {
  name: string;
} 