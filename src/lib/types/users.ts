// Tipo para os dados do formulário de criação de utilizador
export interface CreateUserFormData {
  email: string;
  name?: string; 
  password: string;
}

export interface CreatedUser {
  id: number;
  email: string;
  name?: string | null; 
  createdAt: Date;
  updatedAt: Date;
}

// Tipo para a resposta da API de criação de utilizador
export interface CreateUserApiResponse {
  user: CreatedUser;
  message: string;
}

// Tipo para a resposta de erro da API (pode ser mais genérico)
export interface ApiErrorResponse {
  message: string;
  errors?: { [key: string]: string[] | undefined }; // Para erros de validação Zod, por exemplo
}

export interface UserProfile {
  name: string
  email: string
  avatarUrl?: string
  bio?: string
  location?: string
}