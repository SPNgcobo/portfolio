import { LoginResponse } from './login-response.model';

export interface LoginApiResponse {
    success: boolean;
    message: string;
    data: LoginResponse;
}