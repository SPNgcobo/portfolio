export interface Comment {
    id?: string;
    projectId: string;
    projectTitle?: string;
    username: string;
    email: string;
    content: string;
    originalContent?: string;
    edited?: boolean;
    editedAt?: Date;
    editCount?: number;
    parentCommentId?: string;
    adminReply: boolean;
    approved: boolean;
    deleted?: boolean;
    deletedAt?: Date;
    deletedBy?: string;  
    createdAt?: Date;
}