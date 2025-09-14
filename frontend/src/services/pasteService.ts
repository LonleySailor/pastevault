import api from './api';
import type {
    Paste,
    PasteListItem,
    UserPastesResponse,
    CreatePasteRequest,
    CreatePasteResponse
} from '../types/paste';

export class PasteService {
    /**
     * Create a new paste
     */
    static async createPaste(data: CreatePasteRequest): Promise<CreatePasteResponse> {
        const response = await api.post<CreatePasteResponse>('/paste', data);
        return response.data;
    }

    /**
     * Get a paste by ID
     */
    static async getPaste(id: string, password?: string): Promise<Paste> {
        let url = `/paste/${id}`;
        if (password) {
            url += `?password=${encodeURIComponent(password)}`;
        }

        const response = await api.get<Paste>(url);
        return response.data;
    }

    /**
     * Get paste raw content
     */
    static async getPasteRaw(id: string, password?: string): Promise<string> {
        let url = `/paste/${id}/raw`;
        if (password) {
            url += `?password=${encodeURIComponent(password)}`;
        }

        const response = await api.get<string>(url, {
            headers: {
                'Accept': 'text/plain',
            },
        });
        return response.data;
    }

    /**
     * Unlock a password-protected paste
     */
    static async unlockPaste(id: string, password: string): Promise<Paste> {
        const response = await api.post<Paste>(`/paste/${id}/unlock`, {
            password,
        });
        return response.data;
    }

    /**
     * Delete a paste (requires authentication)
     */
    static async deletePaste(id: string): Promise<void> {
        await api.delete(`/paste/${id}`);
    }

    /**
     * Get user's pastes (requires authentication)
     */
    static async getUserPastes(): Promise<PasteListItem[]> {
        const response = await api.get<UserPastesResponse>('/user/pastes');
        return response.data.pastes || [];
    }

    /**
     * Check if paste exists and get basic info without content
     */
    static async checkPaste(id: string): Promise<{ exists: boolean; hasPassword: boolean; expired?: boolean }> {
        try {
            const response = await api.head(`/paste/${id}`);
            return {
                exists: true,
                hasPassword: response.headers['x-has-password'] === 'true',
                expired: false,
            };
        } catch (error: any) {
            if (error.response?.status === 404) {
                return { exists: false, hasPassword: false };
            }
            if (error.response?.status === 410) {
                return { exists: true, hasPassword: false, expired: true };
            }
            throw error;
        }
    }
}
