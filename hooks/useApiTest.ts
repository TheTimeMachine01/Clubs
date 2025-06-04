import { useAuth } from '@/context/AuthContext';
import api from '@/services/api'; // Import your configured axios instance
import * as SecureStore from 'expo-secure-store'; // NEW: Import SecureStore to access tokens directly
import { useEffect, useState } from 'react';

interface ApiTestOptions {
    endpoint: string; // The API endpoint to test, e.g., '/users', '/products'
    triggerOnAuth?: boolean; // Whether to automatically fetch when isAuthenticated becomes true (default: true)
}

interface ApiTestResult<T> {
    data: T | null;
    isLoading: boolean;
    error: string | null;
    fetchData: () => void; // Function to manually trigger a fetch
}

/**
 * A custom hook to test API endpoints.
 * Fetches data from a given endpoint, manages loading/error states, and ensures token is attached.
 *
 * @param options - Configuration for the API test.
 * @returns An object containing data, isLoading, error, and a fetchData function.
 */


export function useApiTest<T = any>(options: ApiTestOptions): ApiTestResult<T> {
    const { endpoint, triggerOnAuth = true } = options;
    const { isAuthenticated } = useAuth(); // Get auth status from context

    const [data, setData] = useState<T | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [fetchTrigger, setFetchTrigger] = useState(0); // For manual refetch

    const fetchData = async () => {
        // If not authenticated and not explicitly allowed for unauthenticated calls, return
        if (!isAuthenticated && triggerOnAuth) {
            setIsLoading(false);
            setData(null);
            setError("Not authenticated to fetch data.");
            return;
        }

        setIsLoading(true);
        setError(null);

        try {
            // Get the token directly from SecureStore for this specific API call
            const accessToken = await SecureStore.getItemAsync('accessToken');

            // Prepare headers - only add Authorization if accessToken exists
            const headers: { Authorization?: string } = {};
            if (accessToken) {
                headers.Authorization = `Bearer ${accessToken}`;
            } else if (triggerOnAuth) { // If it's a protected endpoint and no token, show error
                setError("No authentication token found for protected endpoint.");
                setIsLoading(false);
                return;
            }

            const response = await api.get(endpoint, { headers }); // Make the API call

            setData(response.data);
            console.log(`useApiTest: Data from ${endpoint}:`, response.data); // Log success
        } catch (err: any) {
            console.error(`useApiTest: Error fetching ${endpoint}:`, err.response?.data || err.message);
            setError(err.response?.data?.message || err.message || `Failed to fetch from ${endpoint}.`);
            setData(null);
        } finally {
            setIsLoading(false);
        }
    };

    // Effect to automatically fetch data when authentication status changes or on initial mount
    useEffect(() => {
        // Only fetch automatically if triggerOnAuth is true OR if it's the first fetch attempt
        if (triggerOnAuth || fetchTrigger === 0) {
            fetchData();
        }
    }, [isAuthenticated, fetchTrigger, endpoint, triggerOnAuth]); // Re-run when these dependencies change

    // Function to allow manual refetch from the component
    const manualFetch = () => {
        setFetchTrigger((prev: number) => prev + 1);
    };

    return { data, isLoading, error, fetchData: manualFetch };
}
