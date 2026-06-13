export interface Media {
    id?: string;
    projectId: string;
    title: string;
    description: string;
    url: string;
    publicId: string;
    type: 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'CERTIFICATE' | 'CV';
    visibility: 'PUBLIC' | 'PRIVATE' | 'VAULT';
    size: number;
    format: string;
    createdAt?: Date;
}

export type MediaType = 'IMAGE' | 'VIDEO' | 'AUDIO' | 'PDF' | 'CERTIFICATE' | 'CV';
export type VisibilityType = 'PUBLIC' | 'PRIVATE' | 'VAULT';