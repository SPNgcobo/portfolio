export interface Project {
    id?: string;

    title: string;
    description: string;

    problem?: string;
    architecture?: string;

    features?: string[];
    challenges?: string;

    images?: string[];
    techStack?: string[];

    github?: string;
    githubVisible?: boolean;

    liveDemo?: string;

    createdAt?: Date;
    updatedAt?: Date;
}