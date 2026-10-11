import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export const SocialAuthButtons = ({ mode = 'login' }) => {
  const { loginWithGoogle, loginWithAws, loading } = useAuth();
  const navigate = useNavigate();
  const [socialLoading, setSocialLoading] = useState(null);
  const [authError, setAuthError] = useState('');
  const googleBtnRef = useRef(null);

  // Client ID from environment or prompt setup
  const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID || '';

  // Initialize Google Identity Services if client ID is set
  useEffect(() => {
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: async (response) => {
            if (response.credential) {
              setSocialLoading('google');
              const res = await loginWithGoogle({ credential: response.credential });
              if (res.success) {
                navigate('/dashboard');
              } else {
                setAuthError(res.message || 'Google authentication failed.');
              }
              setSocialLoading(null);
            }
          },
        });

        if (googleBtnRef.current) {
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: 'outline',
            size: 'large',
            width: '100%',
            text: mode === 'signup' ? 'signup_with' : 'signin_with',
            shape: 'pill',
          });
        }
      } catch (err) {
        console.warn('Google Identity initialization error:', err);
      }
    }
  }, [googleClientId, mode]);

  const handleGoogleOAuthPopup = () => {
    setAuthError('');
    setSocialLoading('google');

    if (!googleClientId) {
      setAuthError('Please set VITE_GOOGLE_CLIENT_ID in your frontend/.env file.');
      setSocialLoading(null);
      return;
    }

    if (window.google?.accounts?.oauth2) {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: googleClientId,
          scope: 'https://www.googleapis.com/auth/userinfo.profile https://www.googleapis.com/auth/userinfo.email openid',
          callback: async (tokenResponse) => {
            if (tokenResponse?.access_token) {
              try {
                const userInfoRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
                  headers: { Authorization: `Bearer ${tokenResponse.access_token}` },
                });
                const googleData = await userInfoRes.json();

                const res = await loginWithGoogle({
                  email: googleData.email,
                  name: googleData.name,
                  picture: googleData.picture,
                  googleId: googleData.sub,
                });

                if (res.success) {
                  navigate('/dashboard');
                } else {
                  setAuthError(res.message || 'Failed to authenticate Google user.');
                }
              } catch (e) {
                setAuthError('Could not fetch Google profile data.');
              }
            }
            setSocialLoading(null);
          },
          error_callback: (err) => {
            console.error('Google OAuth error:', err);
            setAuthError('Google sign-in was closed or failed.');
            setSocialLoading(null);
          },
        });

        client.requestAccessToken();
        return;
      } catch (err) {
        console.error('Google token client initialization error:', err);
      }
    }

    // Direct Google OAuth 2.0 Web Popup fallback
    const redirectUri = `${window.location.origin}/login`;
    const googleAuthUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(
      googleClientId
    )}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=token&scope=${encodeURIComponent(
      'openid email profile'
    )}&prompt=select_account`;

    const popup = window.open(googleAuthUrl, 'google_oauth_window', 'width=500,height=600');
    if (!popup) {
      setAuthError('Popup blocked by browser. Please allow popups.');
      setSocialLoading(null);
    }
  };

  const handleAwsCognitoAuth = async () => {
    setSocialLoading('aws');
    try {
      const awsCognitoProfile = {
        name: 'AWS Cloud Verified Analyst',
        email: `aws.analyst.${Math.floor(1000 + Math.random() * 9000)}@truthguard.cloud`,
        sub: `aws-cognito-sub-${Date.now()}`,
      };

      const res = await loginWithAws(awsCognitoProfile);
      if (res.success) {
        navigate('/dashboard');
      }
    } finally {
      setSocialLoading(null);
    }
  };

  return (
    <div className="space-y-3">
      {authError && (
        <div className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-500 text-xs text-center font-medium">
          {authError}
        </div>
      )}

      {/* Google Sign In Official / OAuth Button */}
      <button
        type="button"
        disabled={loading || socialLoading}
        onClick={handleGoogleOAuthPopup}
        className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900/80 hover:bg-slate-50 dark:hover:bg-slate-800/90 text-slate-800 dark:text-slate-100 font-semibold text-xs md:text-sm shadow-sm transition-all flex items-center justify-center gap-3 group"
      >
        <svg className="w-4 h-4 flex-shrink-0" viewBox="0 0 24 24">
          <path
            fill="#4285F4"
            d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
          />
          <path
            fill="#34A853"
            d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
          />
          <path
            fill="#FBBC05"
            d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
          />
          <path
            fill="#EA4335"
            d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
          />
        </svg>
        <span>
          {socialLoading === 'google'
            ? 'Opening Google Popup...'
            : mode === 'signup'
            ? 'Sign up with Google'
            : 'Continue with Google'}
        </span>
      </button>

      {/* Hidden container for official Google Identity Services button if rendered */}
      <div ref={googleBtnRef} className="hidden" />

      {/* Divider */}
      <div className="relative flex items-center justify-center py-2">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-slate-200 dark:border-slate-800" />
        </div>
        <div className="relative px-3 bg-white dark:bg-[#0b1329] text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
          Or continue with email
        </div>
      </div>
    </div>
  );
};

export default SocialAuthButtons;
