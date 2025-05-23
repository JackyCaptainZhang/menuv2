import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import DishCard from './DishCard';
import EditButton from './EditButton';
import EditForm from './EditForm';
import axios from 'axios';
import { config } from '../config';

const { API_BASE } = config;

interface BilingualField {
  en: string;
  zh: string;
}

interface Dish {
  id: string;
  name: BilingualField;
  rating?: number;
  emoji?: string;
  notes?: BilingualField;
  status: 'unlocked' | 'testing' | 'locked';
  categoryName: BilingualField;
  categoryId: string;
  subcategoryName: BilingualField;
  [key: string]: string | number | BilingualField | undefined;
}

interface Category {
  id: string;
  name: BilingualField;
  dishes: Dish[];
}

interface MenuPageProps {
  categories: Category[];
  isAdmin: boolean;
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

const MenuPage: React.FC<MenuPageProps> = ({ categories, isAdmin }) => {
  const { lang } = useLanguage();
  const [expandedCategory, setExpandedCategory] = useState<string | null>(null);
  const [selectedDish, setSelectedDish] = useState<Dish | null>(null);
  const [editingDish, setEditingDish] = useState<Dish | null>(null);
  const [localCategories, setLocalCategories] = useState<Category[]>(categories);
  const [newDishInfo, setNewDishInfo] = useState<{
    categoryName?: BilingualField;
    categoryId?: string;
    subcategoryName?: BilingualField;
  } | null>(null);
  const [highlightedDishId, setHighlightedDishId] = useState<string | null>(null);

  // 滚动到指定菜品
  const scrollToDish = (dishId: string) => {
    setTimeout(() => {
      const element = document.getElementById(`dish-${dishId}`);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        setHighlightedDishId(dishId);
        // 3秒后取消高亮
        setTimeout(() => setHighlightedDishId(null), 3000);
      }
    }, 100); // 给一点时间让DOM更新
  };

  // 处理删除菜品
  const handleDeleteDish = async (dishId: string) => {
    try {
      await axios.delete(`${API_BASE}/dishes/${dishId}`);
      setLocalCategories(prevCategories => 
        prevCategories.map(category => ({
          ...category,
          dishes: category.dishes.filter(dish => dish.id !== dishId)
        }))
      );
      setSelectedDish(null);
    } catch (error) {
      alert(lang === 'en' ? 'Failed to delete dish' : '删除失败');
    }
  };

  // 处理添加新菜品
  const handleAddDish = (categoryId?: string, categoryName?: BilingualField, subcategoryName?: BilingualField) => {
    let finalCategoryName = categoryName;
    let finalSubcategoryName = subcategoryName;

    // 如果提供了categoryId，尝试从该分类下找到一个已有的菜品来获取完整的分类和子分类信息
    if (categoryId && subcategoryName) {
      const category = localCategories.find(c => c.id === categoryId);
      if (category) {
        // 查找同一子分类下的任意一个菜品
        const existingDish = category.dishes.find(dish => 
          dish.subcategoryName.zh === subcategoryName.zh || 
          dish.subcategoryName.en === subcategoryName.en
        );
        if (existingDish) {
          // 使用已有菜品的分类和子分类信息
          finalCategoryName = existingDish.categoryName;
          finalSubcategoryName = existingDish.subcategoryName;
        }
      }
    }

    setNewDishInfo({
      categoryId,
      categoryName: finalCategoryName,
      subcategoryName: finalSubcategoryName
    });
    setEditingDish({
      id: '',
      name: { en: '', zh: '' },
      status: 'locked',
      categoryName: finalCategoryName || { en: '', zh: '' },
      subcategoryName: finalSubcategoryName || { en: 'Others', zh: '其他' },
      categoryId
    } as Dish);
  };

  // 局部更新函数
  const handleDishUpdate = async (updatedDish: Dish) => {
    try {
      // 判断新建还是编辑，依据 editingDish.id 是否存在
      if (!editingDish || !editingDish.id) {
        // 新建，POST，保留 id 字段
        const response = await axios.post(`${API_BASE}/dishes`, updatedDish);
        updatedDish = { ...updatedDish, id: response.data.id };
      } else {
        // 编辑，PUT
        const { id, ...updateData } = updatedDish;
        await axios.put(`${API_BASE}/dishes/${updatedDish.id}`, updateData);
      }

      // 保存新的分类ID（从newDishInfo或者在localCategories中查找）
      let newCategoryId = newDishInfo?.categoryId;
      if (!newCategoryId) {
        const targetCategory = localCategories.find(category => 
          category.name.zh === updatedDish.categoryName.zh && 
          category.name.en === updatedDish.categoryName.en
        );
        newCategoryId = targetCategory?.id;
      }

      // 找到当前菜品所在的分类（如果是更新的情况）
      let oldCategoryId: string | undefined;
      if (updatedDish.id) {
        const oldCategory = localCategories.find(category => 
          category.dishes.some(dish => dish.id === updatedDish.id)
        );
        oldCategoryId = oldCategory?.id;
      }

      // 检查分类是否发生变化
      const categoryChanged = !oldCategoryId || oldCategoryId !== newCategoryId;
      
      setLocalCategories(prevCategories => {
        // 找到目标分类
        const targetCategory = prevCategories.find(category => 
          category.name.zh === updatedDish.categoryName.zh && 
          category.name.en === updatedDish.categoryName.en
        );

        if (!targetCategory) return prevCategories;

        if (!updatedDish.id) {
          // 如果是新菜品，直接添加到对应分类
          return prevCategories.map(category => {
            if (category.id === targetCategory.id) {
              return {
                ...category,
                dishes: [...category.dishes, updatedDish]
              };
            }
            return category;
          });
        }

        // 如果是更新已有菜品
        const oldCategory = prevCategories.find(category => 
          category.dishes.some(dish => dish.id === updatedDish.id)
        );

        // 如果在同一个分类内更新
        if (oldCategory?.id === targetCategory.id) {
          return prevCategories.map(category => ({
            ...category,
            dishes: category.dishes.map(dish => 
              dish.id === updatedDish.id ? updatedDish : dish
            )
          }));
        }

        // 如果更换了分类
        return prevCategories.map(category => {
          if (category.id === oldCategory?.id) {
            return {
              ...category,
              dishes: category.dishes.filter(dish => dish.id !== updatedDish.id)
            };
          }
          if (category.id === targetCategory.id) {
            return {
              ...category,
              dishes: [...category.dishes, updatedDish]
            };
          }
          return category;
        });
      });

      setEditingDish(null);
      setNewDishInfo(null);

      // 如果是新菜品或者分类发生变化，展开新的分类
      if (categoryChanged && newCategoryId) {
        setExpandedCategory(newCategoryId);
      }

      // 更新后显示更新后的菜品详情
      setTimeout(() => {
        setSelectedDish(updatedDish);
        // 滚动到更新后的菜品
        if (updatedDish.id) {
          scrollToDish(updatedDish.id);
        }
      }, 0);

    } catch (error) {
      alert(lang === 'en' ? 'Failed to save dish' : '保存失败');
    }
  };

  const handleCategoryClick = (categoryId: string) => {
    setExpandedCategory(expandedCategory === categoryId ? null : categoryId);
  };

  const handleDishClick = (dish: Dish) => {
    setSelectedDish(dish);
  };

  const handleEditClick = (dish: Dish) => {
    setSelectedDish(null);  // 关闭查看界面
    setEditingDish(dish);   // 打开编辑界面
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
      {isAdmin && (
        <div style={{ 
          margin: '16px', 
          display: 'flex', 
          justifyContent: 'flex-end' 
        }}>
          <button
            onClick={() => handleAddDish()}
            style={{
              padding: '8px 16px',
              borderRadius: '20px',
              border: '1px solid #e91e63',
              backgroundColor: '#fff',
              color: '#e91e63',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontSize: '14px',
              fontWeight: 500,
              transition: 'all 0.2s ease'
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
            ➕ {lang === 'en' ? 'Add Dish' : '添加菜品'}
          </button>
        </div>
      )}
      {localCategories.map(category => (
        <div key={category.id} style={{ margin: '16px' }}>
          <div style={{
            backgroundColor: '#fff',
            borderRadius: '16px',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.05)',
            transition: 'transform 0.3s ease, box-shadow 0.3s ease',
          }}>
            <div style={{
              padding: '20px',
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              borderBottom: expandedCategory === category.id ? '1px solid #f0f0f0' : 'none',
              cursor: 'pointer',
            }} onClick={() => handleCategoryClick(category.id)}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <h3 style={{ 
                  margin: 0,
                  fontSize: '18px',
                  color: '#333',
                  fontWeight: 600,
                }}>
                  {category.name[lang]}
                </h3>
                {isAdmin && (
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleAddDish(category.id, category.name);
                    }}
                    style={{
                      background: 'none',
                      border: 'none',
                      cursor: 'pointer',
                      color: '#4caf50',
                      padding: '4px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '28px',
                      height: '28px',
                      borderRadius: '14px',
                      transition: 'background-color 0.2s',
                      fontSize: '16px'
                    }}
                    onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e8f5e9')}
                    onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                  >
                    ➕
                  </button>
                )}
              </div>
              <span style={{
                transform: `rotate(${expandedCategory === category.id ? 180 : 0}deg)`,
                transition: 'transform 0.3s ease',
                color: '#666',
                fontSize: '14px',
              }}>
                ▼
              </span>
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
                  <div style={{ 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '8px',
                    marginBottom: '12px' 
                  }}>
                    <h4 style={{ 
                      color: '#666',
                      margin: 0,
                      fontSize: '16px',
                      fontWeight: 500
                    }}>
                      {subcat}
                    </h4>
                    {isAdmin && (
                      <button
                        onClick={() => handleAddDish(
                          category.id,
                          category.name,
                          { en: subcat, zh: subcat }  // 这里可能需要根据实际数据结构调整
                        )}
                        style={{
                          background: 'none',
                          border: 'none',
                          cursor: 'pointer',
                          color: '#4caf50',
                          padding: '2px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '24px',
                          height: '24px',
                          borderRadius: '12px',
                          transition: 'background-color 0.2s',
                          fontSize: '14px'
                        }}
                        onMouseOver={e => (e.currentTarget.style.backgroundColor = '#e8f5e9')}
                        onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        ➕
                      </button>
                    )}
                  </div>
                  <div style={{ 
                    display: 'flex',
                    flexWrap: 'wrap',
                    gap: '12px'
                  }}>
                    {sortDishesByStatus(category.dishes.filter(d => d.subcategoryName[lang] === subcat))
                      .map((dish, index) => {
                        const colors = getStatusColor(dish.status);
                        const isHighlighted = dish.id === highlightedDishId;
                        return (
                          <div
                            id={`dish-${dish.id}`}
                            key={dish.id}
                            onClick={() => handleDishClick(dish)}
                            style={{
                              padding: '10px 16px',
                              borderRadius: '20px',
                              backgroundColor: isHighlighted ? '#fff3e0' : colors.bg,
                              border: `1px solid ${isHighlighted ? '#ffb74d' : colors.border}`,
                              cursor: 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: isHighlighted ? '0 0 12px rgba(255, 183, 77, 0.4)' : colors.shadow,
                              transform: 'translateY(0) scale(1)',
                              transition: 'all 0.3s ease',
                              animation: isHighlighted ? 'highlight 3s ease' : `fadeIn 0.3s ease forwards ${index * 0.05}s`,
                            }}
                            onMouseEnter={e => {
                              e.currentTarget.style.transform = 'translateY(-2px) scale(1.02)';
                              e.currentTarget.style.boxShadow = isHighlighted 
                                ? '0 4px 16px rgba(255, 183, 77, 0.5)' 
                                : colors.shadow.replace('2px 8px', '4px 12px');
                            }}
                            onMouseLeave={e => {
                              e.currentTarget.style.transform = 'translateY(0) scale(1)';
                              e.currentTarget.style.boxShadow = isHighlighted 
                                ? '0 0 12px rgba(255, 183, 77, 0.4)' 
                                : colors.shadow;
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
        </div>
      ))}
      
      {selectedDish && (
        <DishCard 
          dish={selectedDish} 
          onClose={() => setSelectedDish(null)}
          isAdmin={isAdmin}
          onEdit={() => handleEditClick(selectedDish)}
          onDelete={() => handleDeleteDish(selectedDish.id)}
        />
      )}

      {editingDish && (
        <EditForm
          type="dish"
          data={editingDish}
          categories={localCategories}
          onClose={() => {
            setEditingDish(null);
            setNewDishInfo(null);
            // 如果是编辑已有菜品，取消时恢复显示原菜品
            // 如果是新建菜品，取消时不显示任何菜品
            if (editingDish.id) {
              setSelectedDish(editingDish);
            } else {
              setSelectedDish(null);
            }
          }}
          onSave={handleDishUpdate}
        />
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
          @keyframes highlight {
            0%, 100% {
              background-color: var(--bg-color);
              border-color: var(--border-color);
              box-shadow: var(--shadow);
            }
            50% {
              background-color: #fff3e0;
              border-color: #ffb74d;
              box-shadow: 0 0 12px rgba(255, 183, 77, 0.4);
            }
          }
        `}
      </style>
    </div>
  );
};

export default MenuPage; 