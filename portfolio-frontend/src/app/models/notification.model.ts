export interface Notification {
    id?: string;
    title: string;
    message: string;
    type: 'banner' | 'alert' | 'update' | 'info' | 'warning' | 'success';
    active: boolean;
    createdAt?: Date;
}

export type NotificationType = 'banner' | 'alert' | 'update' | 'info' | 'warning' | 'success';