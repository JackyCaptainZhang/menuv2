import React from 'react';
import { useAuth } from '../AuthContext';
import { signInWithGoogle, signOutUser } from '../firebase';
import { useLanguage } from '../LanguageContext';

const LoginButton: React.FC = () => {
  const { user, isAdmin } = useAuth();
  const { lang } = useLanguage();

  const handleAuth = async () => {
    try {
      if (user) {
        await signOutUser();
      } else {
        await signInWithGoogle();
      }
    } catch (error) {
      console.error('Auth error:', error);
    }
  };

  return (
    <button
      onClick={handleAuth}
      style={{
        padding: '8px 16px',
        borderRadius: '20px',
        border: '1px solid #e91e63',
        backgroundColor: user ? '#fff' : '#e91e63',
        color: user ? '#e91e63' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '8px',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
      }}
    >
      {user ? (
        <>
          <img 
            src={user.photoURL || ''} 
            alt="profile" 
            style={{ 
              width: '24px', 
              height: '24px', 
              borderRadius: '12px',
              border: '1px solid #e91e63'
            }} 
          />
          {isAdmin && <span style={{ color: '#4caf50' }}>👑</span>}
          {lang === 'en' ? 'Sign Out' : '退出登录'}
        </>
      ) : (
        <>
          <span>G</span>
          {lang === 'en' ? 'Sign In' : '谷歌登录'}
        </>
      )}
    </button>
  );
};

export default LoginButton; 