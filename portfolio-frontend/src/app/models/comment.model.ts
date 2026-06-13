export interface Comment {
    id?: string;
    projectId: string;
    projectTitle?: string;  
    username: string;
    email: string;
    content: string;
    parentCommentId?: string;
    adminReply: boolean;
    approved: boolean;
    createdAt?: Date;
}