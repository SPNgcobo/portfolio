export interface AuditLog {
    id?: string;
    action: string;
    actor: string;
    targetId?: string;
    details?: string;
    createdAt: Date;
}

export type AuditLogAction =
    | 'COMMENT_APPROVED'
    | 'COMMENT_DELETED'
    | 'COMMENT_EDITED'
    | 'ADMIN_REPLY'
    | 'PROJECT_CREATED'
    | 'PROJECT_UPDATED'
    | 'PROJECT_DELETED'
    | 'PROJECT_PUBLISHED'
    | 'PROJECT_UNPUBLISHED'
    | 'BLOG_CREATED'
    | 'BLOG_UPDATED'
    | 'BLOG_DELETED'
    | 'BLOG_PUBLISHED'
    | 'BLOG_UNPUBLISHED'
    | 'MEDIA_UPLOADED'
    | 'MEDIA_DELETED'
    | 'MEDIA_UPDATED'
    | 'NOTIFICATION_CREATED'
    | 'NOTIFICATION_UPDATED'
    | 'NOTIFICATION_DELETED'
    | 'SKILL_CREATED'
    | 'SKILL_UPDATED'
    | 'SKILL_DELETED'
    | 'TOOL_CREATED'
    | 'TOOL_UPDATED'
    | 'TOOL_DELETED'
    | 'ACCESS_REQUEST_CREATED'
    | 'ACCESS_REQUEST_APPROVED'
    | 'ACCESS_REQUEST_REJECTED'
    | 'CONTACT_MESSAGE'
    | 'ACCOUNT_DELETED'
    | 'NEW_USER';