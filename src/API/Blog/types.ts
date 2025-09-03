// Blog related types

export interface BlogThumbnail {
  _id: string;
  file_name: string;
}

export interface BlogAuthor {
  _id: string;
  first_name?: string;
  last_name?: string;
  email?: string;
}

export interface Blog {
  id: any;
  _id: string;
  title: string;
  sub_title?: string;
  content: string;
  thumbnail?: BlogThumbnail;
  author: BlogAuthor;
  tags: string[];
  readingTime: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogListResponse {
  results: Blog[];
  page: number;
  limit: number;
  totalPages: number;
  totalResults: number;
}

export interface GetBlogsParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  author?: string;
  _id?: string;
  to_date?: string;
  from_date?: string;
  tags?: string[];
  q?: string;
}

export interface CreateBlogDto {
  title: string;
  sub_title?: string;
  content: string;
  thumbnail?: string;
  tags?: string[];
}

export type UpdateBlogDto = Partial<CreateBlogDto>;
