import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import EditButton from './EditButton';
import EditForm from './EditForm';

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

const RecipePage: React.FC<RecipePageProps> = ({ ingredientTips, sauceRecipes, isAdmin }) => {
  const { lang } = useLanguage();
  const [editingItem, setEditingItem] = useState<{ type: 'ingredient' | 'sauce', data: any } | null>(null);
  const [showNewForm, setShowNewForm] = useState<'ingredient' | 'sauce' | null>(null);

  const handleEdit = (type: 'ingredient' | 'sauce', data: any) => {
    setEditingItem({ type, data });
  };

  const handleAdd = (type: 'ingredient' | 'sauce') => {
    setShowNewForm(type);
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
        <div style={{ position: 'absolute', top: '12px', right: '12px' }}>
          <EditButton onClick={() => handleEdit(type, item)} />
        </div>
      )}
      <h3 style={{ margin: '0 0 8px 0', color: '#e91e63' }}>{item.name[lang]}</h3>
      <p style={{ margin: 0, color: '#666' }}>
        {type === 'ingredient' ? item.description[lang] : item.recipe[lang]}
      </p>
    </div>
  );

  return (
    <div style={{ padding: '16px', paddingBottom: '70px' }}>
      <div style={{ marginBottom: '24px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#e91e63' }}>
            {lang === 'en' ? 'Ingredient Tips' : '食材小贴士'}
          </h2>
          {isAdmin && (
            <EditButton
              onClick={() => handleAdd('ingredient')}
              style={{
                backgroundColor: '#e91e63',
                color: '#fff'
              }}
            />
          )}
        </div>
        {ingredientTips.map(tip => renderCard(tip, 'ingredient'))}
      </div>

      <div>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '16px'
        }}>
          <h2 style={{ margin: 0, color: '#e91e63' }}>
            {lang === 'en' ? 'Sauce Recipes' : '酱料配方'}
          </h2>
          {isAdmin && (
            <EditButton
              onClick={() => handleAdd('sauce')}
              style={{
                backgroundColor: '#e91e63',
                color: '#fff'
              }}
            />
          )}
        </div>
        {sauceRecipes.map(recipe => renderCard(recipe, 'sauce'))}
      </div>

      {(editingItem || showNewForm) && (
        <EditForm
          type={(editingItem?.type || showNewForm) as 'ingredient' | 'sauce'}
          data={editingItem?.data || {
            name: { en: '', zh: '' },
            [editingItem?.type === 'ingredient' ? 'description' : 'recipe']: { en: '', zh: '' }
          }}
          onClose={() => {
            setEditingItem(null);
            setShowNewForm(null);
          }}
          onSave={() => {
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

export default RecipePage; 