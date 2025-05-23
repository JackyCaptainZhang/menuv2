import React, { useState, useEffect } from 'react';
import { useLanguage } from '../LanguageContext';
import EditButton from './EditButton';
import EditForm from './EditForm';
import axios from 'axios';
import { config } from '../config';

const { API_BASE } = config;

interface IngredientTip {
  id: string;
  name: { en: string; zh: string };
  description: { en: string; zh: string };
}

interface SauceRecipe {
  id: string;
  name: { en: string; zh: string };
  recipe: { en: string; zh: string };
}

interface RecipePageProps {
  ingredientTips: IngredientTip[];
  sauceRecipes: SauceRecipe[];
  isAdmin: boolean;
}

const RecipePage: React.FC<RecipePageProps> = ({ ingredientTips: initialIngredientTips, sauceRecipes: initialSauceRecipes, isAdmin }) => {
  const { lang } = useLanguage();
  const [editingItem, setEditingItem] = useState<{ type: 'ingredient' | 'sauce', data: any } | null>(null);
  const [showNewForm, setShowNewForm] = useState<'ingredient' | 'sauce' | null>(null);
  const [ingredientTips, setIngredientTips] = useState<IngredientTip[]>(initialIngredientTips);
  const [sauceRecipes, setSauceRecipes] = useState<SauceRecipe[]>(initialSauceRecipes);

  const handleEdit = (type: 'ingredient' | 'sauce', data: any) => {
    setEditingItem({ type, data });
  };

  const handleAdd = (type: 'ingredient' | 'sauce') => {
    setShowNewForm(type);
  };

  const handleSave = async (type: 'ingredient' | 'sauce', data: any) => {
    try {
      const endpoint = type === 'ingredient' ? 'ingredient_tips' : 'sauce_recipes';
      const cleanedData = type === 'ingredient' 
        ? {
            id: data.id,
            name: data.name,
            description: data.description
          }
        : {
            id: data.id,
            name: data.name,
            recipe: data.recipe
          };

      let updatedData: IngredientTip | SauceRecipe;

      // 判断是编辑还是新增
      const list = type === 'ingredient' ? ingredientTips : sauceRecipes;
      const isEdit = !!data.id && list.some(item => item.id === data.id);

      if (isEdit) {
        // 编辑
        const { id, ...updateData } = cleanedData;
        await axios.put(`${API_BASE}/${endpoint}/${data.id}`, updateData);
        updatedData = { ...cleanedData, id: data.id } as any;
      } else {
        // 新增
        const response = await axios.post(`${API_BASE}/${endpoint}`, cleanedData);
        updatedData = { ...cleanedData, id: response.data.id || data.id } as any;
      }

      // 更新本地状态
      if (type === 'ingredient') {
        setIngredientTips(prev => {
          if (isEdit) {
            return prev.map(item => item.id === data.id ? updatedData as IngredientTip : item);
          } else {
            return [...prev, updatedData as IngredientTip];
          }
        });
      } else {
        setSauceRecipes(prev => {
          if (isEdit) {
            return prev.map(item => item.id === data.id ? updatedData as SauceRecipe : item);
          } else {
            return [...prev, updatedData as SauceRecipe];
          }
        });
      }

      setEditingItem(null);
      setShowNewForm(null);
    } catch (error) {
      alert(lang === 'en' ? 'Failed to save' : '保存失败');
    }
  };

  const handleDelete = async (type: 'ingredient' | 'sauce', id: string) => {
    if (!window.confirm(lang === 'en' ? 'Are you sure to delete?' : '确定要删除吗？')) {
      return;
    }

    try {
      const endpoint = type === 'ingredient' ? 'ingredient_tips' : 'sauce_recipes';
      await axios.delete(`${API_BASE}/${endpoint}/${id}`);

      // 更新本地状态
      if (type === 'ingredient') {
        setIngredientTips(prev => prev.filter(item => item.id !== id));
      } else {
        setSauceRecipes(prev => prev.filter(item => item.id !== id));
      }
    } catch (error) {
      alert(lang === 'en' ? 'Failed to delete' : '删除失败');
    }
  };

  const renderCard = (item: any, type: 'ingredient' | 'sauce') => (
    <div
      key={item.id}
      style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '16px',
        marginBottom: '16px',
        boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
        position: 'relative',
        transition: 'transform 0.2s ease, box-shadow 0.2s ease',
      }}
      onMouseEnter={e => {
        e.currentTarget.style.transform = 'translateY(-2px)';
        e.currentTarget.style.boxShadow = '0 4px 12px rgba(0,0,0,0.15)';
      }}
      onMouseLeave={e => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)';
      }}
    >
      {isAdmin && (
        <div style={{ 
          position: 'absolute', 
          top: '12px', 
          right: '12px',
          display: 'flex',
          gap: '8px'
        }}>
          <EditButton onClick={() => handleEdit(type, item)} />
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(type, item.id);
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: '#f44336',
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
            onMouseOver={e => (e.currentTarget.style.backgroundColor = '#ffebee')}
            onMouseOut={e => (e.currentTarget.style.backgroundColor = 'transparent')}
          >
            🗑️
          </button>
        </div>
      )}
      <h3 style={{ margin: '0 0 8px 0', color: '#e91e63', paddingRight: isAdmin ? '80px' : '0' }}>{item.name[lang]}</h3>
      <p style={{ margin: 0, color: '#666', whiteSpace: 'pre-wrap' }}>
        {type === 'ingredient' ? item.description[lang] : item.recipe[lang]}
      </p>
    </div>
  );

  return (
    <div style={{ padding: '16px', paddingBottom: '70px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#e91e63' }}>
            {lang === 'en' ? 'Ingredient Tips' : '食材小贴士'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => handleAdd('ingredient')}
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
        {ingredientTips.map(tip => renderCard(tip, 'ingredient'))}
      </div>

      <div>
        <div style={{ 
          display: 'flex', 
          alignItems: 'center',
          gap: '12px',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#e91e63' }}>
            {lang === 'en' ? 'Sauce Recipes' : '酱料配方'}
          </h2>
          {isAdmin && (
            <button
              onClick={() => handleAdd('sauce')}
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
        {sauceRecipes.map(recipe => renderCard(recipe, 'sauce'))}
      </div>

      {(editingItem || showNewForm) && (
        <EditForm
          type={(editingItem?.type || showNewForm) as 'ingredient' | 'sauce'}
          data={editingItem?.data || {
            id: '',
            name: { en: '', zh: '' },
            [showNewForm === 'ingredient' ? 'description' : 'recipe']: { en: '', zh: '' }
          }}
          onClose={() => {
            setEditingItem(null);
            setShowNewForm(null);
          }}
          onSave={(updatedData) => {
            handleSave((editingItem?.type || showNewForm) as 'ingredient' | 'sauce', updatedData);
          }}
        />
      )}
    </div>
  );
};

export default RecipePage; 