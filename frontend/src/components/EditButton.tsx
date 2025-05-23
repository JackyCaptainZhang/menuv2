import React from 'react';
import { useLanguage } from '../LanguageContext';

interface EditButtonProps {
  onClick: () => void;
  style?: React.CSSProperties;
}

const EditButton: React.FC<EditButtonProps> = ({ onClick, style }) => {
  const { lang } = useLanguage();

  return (
    <button
      onClick={onClick}
      style={{
        padding: '6px 12px',
        borderRadius: '16px',
        border: '1px solid #e91e63',
        backgroundColor: '#fff',
        color: '#e91e63',
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center',
        gap: '4px',
        fontSize: '14px',
        fontWeight: 500,
        transition: 'all 0.2s ease',
        ...style
      }}
      onMouseEnter={e => {
        e.currentTarget.style.backgroundColor = '#e91e63';
        e.currentTarget.style.color = '#fff';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.backgroundColor = '#fff';
        e.currentTarget.style.color = '#e91e63';
      }}
    >
      ✏️ {lang === 'en' ? 'Edit' : '编辑'}
    </button>
  );
};

export default EditButton; 