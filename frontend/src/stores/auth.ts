import { reactive, readonly } from 'vue';
import apiClient from '../api/client';

interface User {
    _id: string;
    username: string;
    avatar: string;
    discriminator: string;
    discordId: string;
}

interface AuthState {
    user: User | null;
    isAuthenticated: boolean;
    loading: boolean;
}

const state = reactive<AuthState>({
    user: null,
    isAuthenticated: false,
    loading: true,
});

export const useAuth = () => {
    const fetchUser = async () => {
        try {
            state.loading = true;
            const response = await apiClient.get('/auth/user');
            if (response.data.user) {
                state.user = response.data.user;
                state.isAuthenticated = true;
            } else {
                state.user = null;
                state.isAuthenticated = false;
            }
        } catch (error) {
            console.error('Failed to fetch user:', error);
            state.user = null;
            state.isAuthenticated = false;
        } finally {
            state.loading = false;
        }
    };

    const login = () => {
        window.location.href = `${import.meta.env.VITE_API_URL}/auth/discord`;
    };

    const logout = async () => {
        try {
            await apiClient.post('/auth/logout');
            state.user = null;
            state.isAuthenticated = false;
            window.location.href = '/';
        } catch (error) {
            console.error('Logout failed:', error);
        }
    };

    return {
        state: readonly(state),
        fetchUser,
        login,
        logout,
    };
};
