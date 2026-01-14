import { useState, useEffect, useCallback } from 'react';

interface BiometricAuthState {
  isSupported: boolean;
  isAvailable: boolean;
  isRegistered: boolean;
  isLoading: boolean;
  error: string | null;
}

interface BiometricCredential {
  credentialId: string;
  publicKey: string;
  userId: string;
}

const STORAGE_KEY = 'minidrama_biometric_credentials';

export function useBiometricAuth() {
  const [state, setState] = useState<BiometricAuthState>({
    isSupported: false,
    isAvailable: false,
    isRegistered: false,
    isLoading: true,
    error: null,
  });

  // Check if WebAuthn is supported
  useEffect(() => {
    const checkSupport = async () => {
      try {
        // Check for PublicKeyCredential support
        const isSupported = 
          typeof window !== 'undefined' &&
          window.PublicKeyCredential !== undefined &&
          typeof window.PublicKeyCredential === 'function';

        if (!isSupported) {
          setState(prev => ({ 
            ...prev, 
            isSupported: false, 
            isAvailable: false,
            isLoading: false 
          }));
          return;
        }

        // Check for platform authenticator (fingerprint/face)
        let isAvailable = false;
        try {
          isAvailable = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
        } catch {
          isAvailable = false;
        }

        // Check if credentials are already registered
        const storedCredentials = localStorage.getItem(STORAGE_KEY);
        const isRegistered = !!storedCredentials;

        setState({
          isSupported: true,
          isAvailable,
          isRegistered,
          isLoading: false,
          error: null,
        });
      } catch (error) {
        setState(prev => ({
          ...prev,
          isSupported: false,
          isAvailable: false,
          isLoading: false,
          error: 'Failed to check biometric support',
        }));
      }
    };

    checkSupport();
  }, []);

  // Generate a random challenge for WebAuthn
  const generateChallenge = useCallback(() => {
    const array = new Uint8Array(32);
    crypto.getRandomValues(array);
    return array;
  }, []);

  // Convert ArrayBuffer to base64
  const arrayBufferToBase64 = useCallback((buffer: ArrayBuffer) => {
    const bytes = new Uint8Array(buffer);
    let binary = '';
    bytes.forEach(byte => binary += String.fromCharCode(byte));
    return btoa(binary);
  }, []);

  // Register biometric credentials
  const registerBiometric = useCallback(async (userId: string, userEmail: string): Promise<boolean> => {
    if (!state.isAvailable) {
      setState(prev => ({ ...prev, error: 'Biometric authentication not available' }));
      return false;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const challenge = generateChallenge();
      
      const createOptions: PublicKeyCredentialCreationOptions = {
        challenge,
        rp: {
          name: 'MiniDrama',
          id: window.location.hostname,
        },
        user: {
          id: new TextEncoder().encode(userId),
          name: userEmail,
          displayName: userEmail.split('@')[0],
        },
        pubKeyCredParams: [
          { type: 'public-key', alg: -7 },  // ES256
          { type: 'public-key', alg: -257 }, // RS256
        ],
        authenticatorSelection: {
          authenticatorAttachment: 'platform',
          userVerification: 'required',
          residentKey: 'preferred',
        },
        timeout: 60000,
        attestation: 'none',
      };

      const credential = await navigator.credentials.create({
        publicKey: createOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to create credential');
      }

      const response = credential.response as AuthenticatorAttestationResponse;
      
      // Store credential info locally
      const credentialData: BiometricCredential = {
        credentialId: arrayBufferToBase64(credential.rawId),
        publicKey: arrayBufferToBase64(response.getPublicKey() || new ArrayBuffer(0)),
        userId,
      };

      localStorage.setItem(STORAGE_KEY, JSON.stringify(credentialData));

      setState(prev => ({
        ...prev,
        isRegistered: true,
        isLoading: false,
        error: null,
      }));

      return true;
    } catch (error: any) {
      const errorMessage = error.name === 'NotAllowedError' 
        ? 'Biometric authentication was cancelled'
        : error.message || 'Failed to register biometric';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return false;
    }
  }, [state.isAvailable, generateChallenge, arrayBufferToBase64]);

  // Authenticate with biometrics
  const authenticateBiometric = useCallback(async (): Promise<string | null> => {
    if (!state.isRegistered) {
      setState(prev => ({ ...prev, error: 'No biometric credentials registered' }));
      return null;
    }

    setState(prev => ({ ...prev, isLoading: true, error: null }));

    try {
      const storedCredentials = localStorage.getItem(STORAGE_KEY);
      if (!storedCredentials) {
        throw new Error('No stored credentials found');
      }

      const credentialData: BiometricCredential = JSON.parse(storedCredentials);
      const challenge = generateChallenge();

      // Convert base64 credential ID back to ArrayBuffer
      const credentialIdBytes = Uint8Array.from(atob(credentialData.credentialId), c => c.charCodeAt(0));

      const getOptions: PublicKeyCredentialRequestOptions = {
        challenge,
        rpId: window.location.hostname,
        allowCredentials: [{
          type: 'public-key',
          id: credentialIdBytes,
          transports: ['internal'],
        }],
        userVerification: 'required',
        timeout: 60000,
      };

      const credential = await navigator.credentials.get({
        publicKey: getOptions,
      }) as PublicKeyCredential;

      if (!credential) {
        throw new Error('Failed to get credential');
      }

      setState(prev => ({
        ...prev,
        isLoading: false,
        error: null,
      }));

      // Return the user ID associated with this credential
      return credentialData.userId;
    } catch (error: any) {
      const errorMessage = error.name === 'NotAllowedError'
        ? 'Biometric authentication was cancelled'
        : error.message || 'Biometric authentication failed';
      
      setState(prev => ({
        ...prev,
        isLoading: false,
        error: errorMessage,
      }));
      return null;
    }
  }, [state.isRegistered, generateChallenge]);

  // Remove biometric credentials
  const removeBiometric = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setState(prev => ({
      ...prev,
      isRegistered: false,
      error: null,
    }));
  }, []);

  // Clear error
  const clearError = useCallback(() => {
    setState(prev => ({ ...prev, error: null }));
  }, []);

  return {
    ...state,
    registerBiometric,
    authenticateBiometric,
    removeBiometric,
    clearError,
  };
}
