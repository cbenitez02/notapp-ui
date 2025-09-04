export interface User {
  id: string;
  fullname: string; // Cambiado de fullName a fullname para coincidir con la API
  email: string;
  role: 'buyer' | 'seller' | 'both' | 'admin';
  emailVerified: boolean;
  createdAt?: Date;
  updatedAt?: Date; // Agregado porque aparece en la respuesta
  isActive?: boolean;
}

export interface GetUserByIdResponse {
  success: true;
  data: User;
}
