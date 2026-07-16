export interface AccessRequest {
    id?: string;
    name: string;
    email: string;
    company?: string;
    reason: string;
    mediaId?: string;
    projectId?: string;
    requestType?: 'PROJECT' | 'MEDIA';
    status: 'PENDING' | 'APPROVED' | 'REJECTED';
    adminMessage?: string;
    createdAt?: Date;
    updatedAt?: Date;
}

export type AccessStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type AccessRequestType = 'PROJECT' | 'MEDIA';