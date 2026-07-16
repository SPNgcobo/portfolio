export interface UserProfile {
    id?: string;
    username: string;
    email: string;
    role: string;
    createdAt?: Date;
    updatedAt?: Date;
    passwordLastChanged?: Date;
}

export interface ChangePasswordRequest {
    currentPassword: string;
    newPassword: string;
}

export interface UpdateProfileRequest {
    username: string;
}

export interface UserProfileResponse {
    id: string;
    username: string;
    email: string;
    role: string;
    createdAt: Date;
    updatedAt: Date;
    passwordLastChanged: Date;
}