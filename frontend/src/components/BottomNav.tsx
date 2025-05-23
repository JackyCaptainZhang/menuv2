import React from 'react';
import { useLanguage } from '../LanguageContext';

interface BottomNavProps {
  currentTab: 'menu' | 'recipe';
  onTabChange: (tab: 'menu' | 'recipe') => void;
}

const BottomNav: React.FC<BottomNavProps> = ({ currentTab, onTabChange }) => {
  const { lang } = useLanguage();

  return (
    <div style={{
      position: 'fixed',
      bottom: 0,
      left: 0,
      right: 0,
      height: '60px',
      backgroundColor: '#fff',
      display: 'flex',
      justifyContent: 'space-around',
      alignItems: 'center',
      boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
    }}>
      <div
        onClick={() => onTabChange('menu')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          color: currentTab === 'menu' ? '#1976d2' : '#666',
        }}
      >
        <span style={{ fontSize: '24px' }}>📋</span>
        <span>{lang === 'en' ? 'Menu' : '菜单'}</span>
      </div>
      <div
        onClick={() => onTabChange('recipe')}
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          cursor: 'pointer',
          color: currentTab === 'recipe' ? '#1976d2' : '#666',
        }}
      >
        <span style={{ fontSize: '24px' }}>📖</span>
        <span>{lang === 'en' ? 'Recipe' : '食谱秘籍'}</span>
      </div>
    </div>
  );
};

export default BottomNav; 