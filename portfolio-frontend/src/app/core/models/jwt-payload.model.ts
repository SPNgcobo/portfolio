export interface JwtPayload {

    sub: string;

    role: string;

    exp: number;

    iat: number;
}