// hooks/useUserProfile.ts
import { useAuth } from '@/context/AuthContext'; // To check if authenticated
import api from '@/services/api'; // Import your configured axios instance
import * as SecureStore from 'expo-secure-store'; // NEW: Import SecureStore to access tokens directly
import { useEffect, useState } from 'react';

// Define the full UserProfile interface that matches your backend /api/user response
export interface UserProfile {
  id: string; // Or number
  email: string;
  fullName: string;
  firstName?: string; // Derived
  lastName?: string;  // Derived
  createdAt?: string;
  updatedAt?: string;
  enabled?: boolean;
  username?: string; // Often same as email
}

// Helper to process fullName (moved from AuthContext)
const processSingleUserData = (backendUserData: any): UserProfile => {
  const processedUser: UserProfile = { ...backendUserData };

  if (processedUser.fullName) {
    const nameParts = processedUser.fullName.split(' ').filter(part => part.trim() !== '');
    processedUser.firstName = nameParts.length > 0 ? nameParts[0] : undefined;
    processedUser.lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : undefined;
  } else {
    processedUser.firstName = undefined;
    processedUser.lastName = undefined;
  }
  return processedUser;
};

interface UseUserProfileReturn {
  userProfile: UserProfile | null;
  isLoadingProfile: boolean;
  errorProfile: string | null;
  refetchUserProfile: () => void; // Function to manually re-fetch profile
}

export function useUserProfile(): UseUserProfileReturn {
  const { isAuthenticated } = useAuth(); // Check authentication status from AuthContext
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [isLoadingProfile, setIsLoadingProfile] = useState(true);
  const [errorProfile, setErrorProfile] = useState<string | null>(null);
  const [refetchTrigger, setRefetchTrigger] = useState(0); // For manual refetch

  useEffect(() => {
    const fetchProfile = async () => {
      // If not authenticated, stop and clear any profile data
      if (!isAuthenticated) {
        setIsLoadingProfile(false);
        setUserProfile(null);
        setErrorProfile(null); // Clear any previous errors
        return;
      }

      setIsLoadingProfile(true);
      setErrorProfile(null);

      try {
        // Explicitly get the token from SecureStore for this specific API call
        const accessToken = await SecureStore.getItemAsync('accessToken');

        if (!accessToken) {
          // This scenario indicates an inconsistency: isAuthenticated is true but no token found.
          console.error("useUserProfile: Authentication state is true, but no accessToken found in SecureStore.");
          setErrorProfile("Authentication token missing.");
          setIsLoadingProfile(false);
          setUserProfile(null);
          // Potentially force logout here if this state indicates a critical auth issue
          // (e.g., useAuth().logout();) - but handle carefully to avoid infinite loops
          return;
        }

        // Pass the accessToken explicitly in the headers for this request
        const response = await api.get('/users', {
          headers: {
            Authorization: `Bearer ${accessToken}`, // <--- THIS IS THE KEY CHANGE
          },
        });

        const usersArray: any[] = response.data; // Expect an array of users

        if (Array.isArray(usersArray) && usersArray.length > 0) {
          // --- KEY CHANGE 3: Pick the first user from the array ---
          // IMPORTANT: This is a TEMPORARY workaround.
          // In a real app, you'd find the user matching the authenticated user's ID.
          const firstUser = usersArray[0];
          const processedProfile = processSingleUserData(firstUser);
          setUserProfile(processedProfile);
        } else {
          // Handle case where array is empty or not an array
          setErrorProfile("No user data found or invalid response format from /users.");
          setUserProfile(null);
        }
      } catch (err: any) {
        console.error("useUserProfile: Failed to fetch user profile:", err.response?.data || err.message);
        setErrorProfile(err.response?.data?.message || "Failed to load profile.");
        setUserProfile(null);

        // If the error is 401 or 403, and the token was present, it might indicate
        // a backend issue with token validation or insufficient permissions.
        // The axios interceptor should handle 401 for token refresh/logout.
        // For 403, it's typically a permission issue with a valid token.
      } finally {
        setIsLoadingProfile(false);
      }
    };

    fetchProfile();
  }, [isAuthenticated, refetchTrigger]); // Re-fetch when auth status changes or triggered manually

  const refetchUserProfile = () => {
    setRefetchTrigger(prev => prev + 1); // Increment to trigger useEffect
  };

  return { userProfile, isLoadingProfile, errorProfile, refetchUserProfile };
}