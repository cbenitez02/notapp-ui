export interface CategoryResponse {
  id: string;
  name: string;
  description?: string;
  color?: string;
  icon?: string;
  active: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}
