import { useState, useCallback } from 'react';
import { PasteService } from '../services/pasteService';
import type {
    Paste,
    PasteListItem,
    CreatePasteRequest,
    CreatePasteResponse
} from '../types/paste';
import type { APIError } from '../types/api';

interface UsePasteState {
    paste: Paste | null;
    loading: boolean;
    error: APIError | null;
}

interface UseCreatePasteState {
    loading: boolean;
    error: APIError | null;
    response: CreatePasteResponse | null;
}

/**
 * Hook for managing paste operations
 */
export function usePaste() {
    const [state, setState] = useState<UsePasteState>({
        paste: null,
        loading: false,
        error: null,
    });

    const getPaste = useCallback(async (id: string, password?: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const paste = await PasteService.getPaste(id, password);
            setState(prev => ({ ...prev, paste, loading: false }));
            return paste;
        } catch (error) {
            const apiError = error as APIError;
            setState(prev => ({ ...prev, error: apiError, loading: false, paste: null }));
            throw error;
        }
    }, []);

    const unlockPaste = useCallback(async (id: string, password: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const paste = await PasteService.unlockPaste(id, password);
            setState(prev => ({ ...prev, paste, loading: false }));
            return paste;
        } catch (error) {
            const apiError = error as APIError;
            setState(prev => ({ ...prev, error: apiError, loading: false }));
            throw error;
        }
    }, []);

    const getPasteRaw = useCallback(async (id: string, password?: string) => {
        setState(prev => ({ ...prev, loading: true, error: null }));

        try {
            const content = await PasteService.getPasteRaw(id, password);
            setState(prev => ({ ...prev, loading: false }));
            return content;
        } catch (error) {
            const apiError = error as APIError;
            setState(prev => ({ ...prev, error: apiError, loading: false }));
            throw error;
        }
    }, []);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const clearPaste = useCallback(() => {
        setState({
            paste: null,
            loading: false,
            error: null,
        });
    }, []);

    return {
        ...state,
        getPaste,
        unlockPaste,
        getPasteRaw,
        clearError,
        clearPaste,
    };
}

/**
 * Hook for creating pastes
 */
export function useCreatePaste() {
    const [state, setState] = useState<UseCreatePasteState>({
        loading: false,
        error: null,
        response: null,
    });

    const createPaste = useCallback(async (data: CreatePasteRequest) => {
        setState(prev => ({ ...prev, loading: true, error: null, response: null }));

        try {
            const response = await PasteService.createPaste(data);
            setState(prev => ({ ...prev, response, loading: false }));
            return response;
        } catch (error) {
            const apiError = error as APIError;
            setState(prev => ({ ...prev, error: apiError, loading: false, response: null }));
            throw error;
        }
    }, []);

    const clearError = useCallback(() => {
        setState(prev => ({ ...prev, error: null }));
    }, []);

    const clearResponse = useCallback(() => {
        setState(prev => ({ ...prev, response: null }));
    }, []);

    const reset = useCallback(() => {
        setState({
            loading: false,
            error: null,
            response: null,
        });
    }, []);

    return {
        ...state,
        createPaste,
        clearError,
        clearResponse,
        reset,
    };
}

/**
 * Hook for user's pastes (requires authentication)
 */
export function useUserPastes() {
    const [pastes, setPastes] = useState<PasteListItem[]>([]);
    const [loading, setLoading] = useState<boolean>(false);
    const [error, setError] = useState<APIError | null>(null);

    const fetchUserPastes = useCallback(async () => {
        setLoading(true);
        setError(null);

        try {
            const userPastes = await PasteService.getUserPastes();
            setPastes(userPastes);
        } catch (error) {
            const apiError = error as APIError;
            setError(apiError);
        } finally {
            setLoading(false);
        }
    }, []);

    const deletePaste = useCallback(async (id: string) => {
        // Optimistic update
        const previousPastes = [...pastes];
        setPastes(prev => prev.filter(paste => paste.id !== id));

        try {
            await PasteService.deletePaste(id);
        } catch (error) {
            // Revert optimistic update on error
            setPastes(previousPastes);
            const apiError = error as APIError;
            setError(apiError);
            throw error;
        }
    }, [pastes]);

    const createPaste = useCallback(async (data: CreatePasteRequest) => {
        try {
            const response = await PasteService.createPaste(data);
            // Create a minimal paste object for the list
            const newPaste: PasteListItem = {
                id: response.id,
                language: data.language,
                created_at: response.created_at,
                expires_at: response.expires_at,
                has_password: !!data.password,
                size: data.content.length,
            };
            // Update cache with new paste
            setPastes(prev => [newPaste, ...prev]);
            return response;
        } catch (error) {
            const apiError = error as APIError;
            setError(apiError);
            throw error;
        }
    }, []);

    return {
        pastes,
        loading,
        error,
        fetchUserPastes,
        deletePaste,
        createPaste,
    };
}
