import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import DishCard from './DishCard';

interface Dish {
  id: string;
  name: { en: string; zh: string };
  rating?: number;
  emoji?: string;
  notes?: { en: string; zh: string };
  status: 'unlocked' | 'testing' | 'locked';
  subcategoryName: { en: string; zh: string };
}

interface Category {
  id: string;
  name: { en: string; zh: string };
  dishes: Dish[];
}

const getStatusColor = (status: string) => {
  switch (status) {
    case 'unlocked':
      return { bg: '#e8f5e9', border: '#81c784', shadow: '0 2px 8px rgba(129, 199, 132, 0.2)' };
    case 'testing':
      return { bg: '#fff3e0', border: '#ffb74d', shadow: '0 2px 8px rgba(255, 183, 77, 0.2)' };
    case 'locked':
      return { bg: '#f5f5f5', border: '#bdbdbd', shadow: '0 2px 8px rgba(189, 189, 189, 0.2)' };
    default:
      return { bg: '#f5f5f5', border: '#bdbdbd', shadow: '0 2px 8px rgba(189, 189, 189, 0.2)' };
  }
};

// 状态标识说明组件
const StatusLegend = ({ lang }: { lang: 'en' | 'zh' }) => {
  const statuses = [
    { value: 'unlocked', label: { en: 'Unlocked', zh: '已解锁' }, color: '#4caf50', bg: '#e8f5e9' },
    { value: 'testing', label: { en: 'Testing', zh: '测试中' }, color: '#ff9800', bg: '#fff3e0' },
    { value: 'locked', label: { en: 'Locked', zh: '待解锁' }, color: '#9e9e9e', bg: '#f5f5f5' }
  ];

  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center',
      gap: '10px',
      padding: '12px',
      backgroundColor: '#fff',
      margin: '10px',
      borderRadius: '12px',
      boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
      transform: 'translateY(0)',
      transition: 'transform 0.3s ease, box-shadow 0.3s ease',
    }}>
      {statuses.map(status => (
        <div
          key={status.value}
          style={{
            padding: '6px 12px',
            borderRadius: '16px',
            backgroundColor: status.bg,
            color: status.color,
            fontSize: '14px',
            fontWeight: 500,
            transition: 'transform 0.2s ease',
          }}
        >
          {status.label[lang]}
        </div>
      ))}
    </div>
  );
};

const MenuPage: React.FC<{ categories: Category[] }> = ({ categories }) => {
  const { lang } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
  };

  // 按状态排序菜品
  const sortDishesByStatus = (dishes: Dish[]) => {
    return [...dishes].sort((a, b) => {
      const statusWeight = { unlocked: 0, testing: 1, locked: 2 };
      return statusWeight[a.status] - statusWeight[b.status];
    });
  };

  return (
    <div style={{ paddingBottom: '70px' }}>
      <StatusLegend lang={lang} />
      {categories.map(category => (
        <div 
          key={category.id} 
          style={{ 
            margin: '16px',
            backgroundColor: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(0,0,0,0.1)';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.05)';
          }}
        >
          <div
            onClick={() => handleCategoryClick(category.id)}
            style={{
              padding: '20px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: expandedCategory === category.id ? '1px solid #f0f0f0' : 'none',
              transition: 'all 0.3s ease'
            }}
          >
            <h3 style={{ 
              margin: 0,
              fontSize: '18px',
              color: '#333',
              fontWeight: 600
            }}>
              {category.name[lang]}
            </h3>
            <span style={{
              transform: `rotate(${expandedCategory === category.id ? 180 : 0}deg)`,
              transition: 'transform 0.3s ease',
              color: '#666',
              fontSize: '14px'
            }}>▼</span>
          </div>
          
          <div style={{
            height: expandedCategory === category.id ? 'auto' : '0',
            opacity: expandedCategory === category.id ? 1 : 0,
            overflow: 'hidden',
            transition: 'all 0.3s ease',
            padding: expandedCategory === category.id ? '0 20px 20px' : '0 20px',
          }}>
            {Array.from(new Set(category.dishes.map(d => d.subcategoryName[lang]))).map(subcat => (
              <div key={subcat} style={{ marginTop: '16px' }}>
                <h4 style={{ 
                  color: '#666',
                  margin: '0 0 12px 0',
                  fontSize: '16px',
                  fontWeight: 500
                }}>
                  {subcat}
                </h4>
                <div style={{ 
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '12px'
                }}>
                  {sortDishesByStatus(category.dishes.filter(d => d.subcategoryName[lang] === subcat))
                    .map((dish, index) => {
                      const colors = getStatusColor(dish.status);
                      return (
                        <div
                          key={dish.id}
                          onClick={() => handleDishClick(dish)}
                          style={{
                            padding: '10px 16px',
                            borderRadius: '20px',
                            backgroundColor: colors.bg,
                            border: `1px solid ${colors.border}`,
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '6px',
                            boxShadow: colors.shadow,
                            transform: 'translateY(0) scale(1)',
                            transition: 'all 0.2s ease',
                            animation: `fadeIn 0.3s ease forwards ${index * 0.05}s`,
                          }}
                          onMouseEnter={e => {
                            e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                            e.currentTarget.style.boxShadow = colors.shadow.replace('2px 8px', '4px 12px');
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.transform = 'translateY(0) scale(1)';
                            e.currentTarget.style.boxShadow = colors.shadow;
                          }}
                        >
                          <span style={{
                            fontSize: '15px',
                            color: '#333',
                            fontWeight: 500
                          }}>
                            {dish.name[lang]}
                          </span>
                          {dish.emoji && <span>{dish.emoji}</span>}
                          {dish.rating && (
                            <span style={{ 
                              color: '#ffc107',
                              fontSize: '14px',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '2px'
                            }}>
                              ⭐<span style={{ fontSize: '13px' }}>{dish.rating}</span>
                            </span>
                          )}
                        </div>
                      );
                    })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
      
      {selectedDish && (
        <DishCard dish={selectedDish} onClose={() => setSelectedDish(null)} />
      )}

      <style>
        {`
          @keyframes fadeIn {
            from {
              opacity: 0;
              transform: translateY(10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }
        `}
      </style>
    </div>
  );
};

export default MenuPage; 