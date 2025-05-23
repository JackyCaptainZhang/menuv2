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
      return { bg: '#e8f5e9', border: '#81c784' }; // 绿色
    case 'testing':
      return { bg: '#fff3e0', border: '#ffb74d' }; // 橙色
    case 'locked':
      return { bg: '#f5f5f5', border: '#bdbdbd' }; // 灰色
    default:
      return { bg: '#f5f5f5', border: '#bdbdbd' };
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
      borderRadius: '8px',
      boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
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
            fontWeight: 500
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
        <div key={category.id} style={{ margin: '10px', backgroundColor: '#fff', borderRadius: '8px' }}>
          <div
            onClick={() => handleCategoryClick(category.id)}
            style={{
              padding: '15px',
              cursor: 'pointer',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <h3 style={{ margin: 0 }}>{category.name[lang]}</h3>
            <span>{expandedCategory === category.id ? '▼' : '▶'}</span>
          </div>
          
          {expandedCategory === category.id && (
            <div style={{ padding: '0 15px 15px' }}>
              {Array.from(new Set(category.dishes.map(d => d.subcategoryName[lang]))).map(subcat => (
                <div key={subcat} style={{ marginBottom: '15px' }}>
                  <h4 style={{ color: '#666', marginBottom: '10px' }}>{subcat}</h4>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    {sortDishesByStatus(category.dishes.filter(d => d.subcategoryName[lang] === subcat))
                      .map(dish => {
                        const colors = getStatusColor(dish.status);
                        return (
                          <div
                            key={dish.id}
                            onClick={() => handleDishClick(dish)}
                            style={{
                              padding: '8px 16px',
                              borderRadius: '20px',
                              backgroundColor: colors.bg,
                              border: `1px solid ${colors.border}`,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <span>{dish.name[lang]}</span>
                            {dish.emoji && <span>{dish.emoji}</span>}
                            {dish.rating && <span style={{ color: '#ffc107' }}>⭐{dish.rating}</span>}
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
      
      {selectedDish && (
        <DishCard dish={selectedDish} onClose={() => setSelectedDish(null)} />
      )}
    </div>
  );
};

export default MenuPage; 