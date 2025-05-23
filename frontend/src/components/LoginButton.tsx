import React from 'react';
import { useAuth } from '../AuthContext';
import { signInWithGoogle, signOutUser } from '../firebase';
import { useLanguage } from '../LanguageContext';

interface LoginButtonProps {
  style?: React.CSSProperties;
}

const LoginButton: React.FC<LoginButtonProps> = ({ style }) => {
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
        padding: '4px 10px',
        borderRadius: '14px',
        border: '1px solid #e91e63',
        backgroundColor: user ? '#fff' : '#e91e63',
        color: user ? '#e91e63' : '#fff',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '6px',
        fontSize: '13px',
        fontWeight: 500,
        height: '32px',
        minWidth: 'auto',
        transition: 'all 0.2s ease',
        ...style
      }}
    >
      {user ? (
        <>
          <img 
            src={user.photoURL || ''} 
            alt="profile" 
            style={{ 
              width: '20px', 
              height: '20px', 
              borderRadius: '10px',
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