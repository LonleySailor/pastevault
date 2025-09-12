export interface APIError {
    error: string;
    code?: string;
    details?: any;
}

export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationResponse {
    error: string;
    errors: ValidationError[];
}

export interface HealthResponse {
    status: string;
    database: string;
    version: string;
}
