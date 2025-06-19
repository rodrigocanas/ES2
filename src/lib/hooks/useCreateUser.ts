
import { useState } from 'react';
import { CreateUserFormData, CreatedUser, CreateUserApiResponse, ApiErrorResponse } from '@/lib/types/users'; // Ajusta o caminho

interface UseCreateUserHook {
  createUser: (formData: CreateUserFormData) => Promise<void>;
  isLoading: boolean;
  error: string | null; 
  // validationErrors: ApiErrorResponse['errors'] | null; // Para erros de campo específicos
  successMessage: string | null;
  createdUser: CreatedUser | null;
}

export function useCreateUser(): UseCreateUserHook {
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  // const [validationErrors, setValidationErrors] = useState<ApiErrorResponse['errors'] | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [createdUser, setCreatedUser] = useState<CreatedUser | null>(null);

  const createUser = async (formData: CreateUserFormData) => {
    setIsLoading(true);
    setError(null);
    // setValidationErrors(null);
    setSuccessMessage(null);
    setCreatedUser(null);

    try {
      const response = await fetch('/api/users/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      //? Tenta fazer o parse do JSON independentemente do status para obter a mensagem de erro
      const responseData = await response.json();

      if (!response.ok) {
        const apiError = responseData as ApiErrorResponse;
        // if (apiError.errors) {
        //   setValidationErrors(apiError.errors);
        // }
        throw new Error(apiError.message || `Erro ${response.status}`);
      }

      const successData = responseData as CreateUserApiResponse;
      setSuccessMessage(successData.message || 'Utilizador criado com sucesso!');
      setCreatedUser(successData.user);

    } catch (err: any) {
      setError(err.message || 'Falha ao criar utilizador. Tenta novamente.');
      console.error("useCreateUser hook error:", err);
    } finally {
      setIsLoading(false);
    }
  };

  return { createUser, isLoading, error, successMessage, createdUser };
}