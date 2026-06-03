export interface Project {

    id?: string;

    title: string;

    description: string;

    shortDescription?: string;

    problem?: string;

    architecture?: string;

    challenges?: string;

    solution?: string;

    infoNote?: string;

    github?: string;

    githubVisible?: boolean;

    liveDemoUrl?: string;

    images?: string[];

    thumbnail?: string;

    videos?: string[];

    documents?: string[];

    techStack?: string[];

    tools?: string[];

    features?: string[];

    featured?: boolean;

    published?: boolean;

    viewCount?: number;

    likes?: number;

    commentsCount?: number;

    githubClicks?: number;

    demoClicks?: number;

    detailClicks?: number;

    createdAt?: Date;

    updatedAt?: Date;
}