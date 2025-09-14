export interface Paste {
    id: string;
    content: string;
    language?: string;
    created_at: string;
    expires_at?: string;
    has_password: boolean;
    is_public?: boolean;
    title?: string;
    size?: number;
}

export interface PasteListItem {
    id: string;
    language?: string;
    created_at: string;
    expires_at?: string;
    has_password: boolean;
    size: number;
}

export interface UserPastesResponse {
    pastes: PasteListItem[];
    total: number;
    page: number;
    limit: number;
}

export interface CreatePasteRequest {
    content: string;
    password?: string;
    expiry?: string;
    language?: string;
}

export interface CreatePasteResponse {
    id: string;
    url: string;
    created_at: string;
    expires_at?: string;
}

export interface UnlockPasteRequest {
    password: string;
}

export type ExpiryOption = '1h' | '24h' | '7d' | 'never';

export interface PasteFormData {
    content: string;
    language?: string;
    password?: string;
    expiry: ExpiryOption;
    title?: string;
}
