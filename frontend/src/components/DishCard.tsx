import React from 'react';
import { useLanguage } from '../LanguageContext';

interface DishCardProps {
  dish: {
    id: string;
    name: { en: string; zh: string };
    rating?: number;
    emoji?: string;
    notes?: { en: string; zh: string };
    status: 'unlocked' | 'testing' | 'locked';
  };
  onClose: () => void;
  isAdmin?: boolean;
  onEdit?: () => void;
  onDelete?: () => void;
}

const getStatusInfo = (status: string, lang: 'en' | 'zh'): { text: string; color: string; bg: string } => {
  switch (status) {
    case 'unlocked':
      return {
        text: lang === 'en' ? 'Unlocked' : '已解锁',
        color: '#4caf50',
        bg: '#e8f5e9'
      };
    case 'testing':
      return {
        text: lang === 'en' ? 'Testing' : '测试中',
        color: '#ff9800',
        bg: '#fff3e0'
      };
    case 'locked':
      return {
        text: lang === 'en' ? 'Locked' : '待解锁',
        color: '#9e9e9e',
        bg: '#f5f5f5'
      };
    default:
      return {
        text: lang === 'en' ? 'Unknown' : '未知',
        color: '#9e9e9e',
        bg: '#f5f5f5'
      };
  }
};

const DishCard: React.FC<DishCardProps> = ({ dish, onClose, isAdmin, onEdit, onDelete }) => {
  const { lang } = useLanguage();
  const statusInfo = getStatusInfo(dish.status, lang);

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm(lang === 'en' ? 'Are you sure to delete this dish?' : '确定要删除这道菜吗？')) {
      onDelete?.();
    }
  };

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0,0,0,0.5)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      zIndex: 1000,
    }} onClick={onClose}>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '12px',
        padding: '20px',
        maxWidth: '90%',
        width: '400px',
        position: 'relative',
      }} onClick={e => e.stopPropagation()}>
        <div style={{ 
          marginBottom: '16px', 
          display: 'flex', 
          alignItems: 'flex-start',
        }}>
          <div style={{ flex: 1 }}>
            <h2 style={{ margin: 0, marginBottom: '8px' }}>
              {dish.name[lang]} {dish.emoji}
            </h2>
            {dish.rating && (
              <div style={{ color: '#ffc107', fontSize: '18px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                ⭐ <span style={{ fontSize: '16px' }}>{dish.rating}{lang === 'zh' ? '分' : ''}</span>
              </div>
            )}
          </div>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px'
          }}>
            <div style={{
              padding: '6px 12px',
              borderRadius: '16px',
              backgroundColor: statusInfo.bg,
              color: statusInfo.color,
              fontSize: '14px',
              fontWeight: 500,
              display: 'flex',
              alignItems: 'center',
              height: '28px'
            }}>
              {statusInfo.text}
            </div>
            {isAdmin && (
              <>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    onEdit?.();
                  }}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#e91e63',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    transition: 'background-color 0.2s',
                    fontSize: '18px'
                  }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = '#fff0f5')}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  ✎
                </button>
                <button
                  onClick={handleDelete}
                  style={{
                    background: 'none',
                    border: 'none',
                    cursor: 'pointer',
                    color: '#f44336',
                    padding: '4px',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: '32px',
                    height: '32px',
                    borderRadius: '16px',
                    transition: 'background-color 0.2s',
                    fontSize: '18px'
                  }}
                  onMouseOver={e => (e.currentTarget.style.backgroundColor = '#ffebee')}
                  onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                >
                  🗑️
                </button>
              </>
            )}
            <button 
              onClick={onClose}
              style={{
                background: 'none',
                border: 'none',
                fontSize: '24px',
                cursor: 'pointer',
                color: '#666',
                padding: '4px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '32px',
                height: '32px',
                borderRadius: '16px',
                transition: 'background-color 0.2s',
              }}
              onMouseOver={e => (e.currentTarget.style.backgroundColor = '#f5f5f5')}
              onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
            >
              ×
            </button>
          </div>
        </div>
        {dish.notes && (
          <div>
            <div style={{ 
              color: '#666', 
              marginBottom: '8px',
              fontSize: '14px',
              fontWeight: 500
            }}>
              {lang === 'en' ? 'Notes' : '备注'}
            </div>
            <div style={{ 
              backgroundColor: '#fff0f5', 
              padding: '12px', 
              borderRadius: '8px',
              color: '#333',
              fontSize: '14px',
              lineHeight: '1.5',
              whiteSpace: 'pre-wrap'
            }}>
              {dish.notes[lang]}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DishCard; 