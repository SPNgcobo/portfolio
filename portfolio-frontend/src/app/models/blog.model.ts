export interface Blog {
    id?: string;
    title: string;
    slug: string;
    excerpt?: string;
    content?: string;
    seoTitle?: string;
    seoDescription?: string;
    keywords?: string[];
    thumbnailUrl?: string;
    thumbnailPublicId?: string;
    tags?: string[];
    categories?: string[];
    status?: 'DRAFT' | 'PUBLISHED';
    featured?: boolean;
    readTime?: number;
    publishedAt?: Date;
    createdAt?: Date;
    updatedAt?: Date;
}