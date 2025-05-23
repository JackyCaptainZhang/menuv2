import React from 'react';
import { useLanguage } from '../LanguageContext';

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
}

const RecipePage: React.FC<RecipePageProps> = ({ ingredientTips, sauceRecipes }) => {
  const { lang } = useLanguage();

  const renderSection = (title: string, items: any[], renderItem: (item: any) => React.ReactNode) => (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '12px',
      padding: '16px',
      margin: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
    }}>
      <h2 style={{
        margin: '0 0 16px 0',
        color: '#333',
        fontSize: '20px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}>
        {title}
      </h2>
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '16px'
      }}>
        {items.map(renderItem)}
      </div>
    </div>
  );

  const renderIngredientTip = (tip: IngredientTip) => (
    <div key={tip.id} style={{
      backgroundColor: '#fff0f5',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <div style={{
        fontWeight: 600,
        marginBottom: '8px',
        color: '#e91e63'
      }}>
        {tip.name[lang]}
      </div>
      <div style={{
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        {tip.description[lang]}
      </div>
    </div>
  );

  const renderSauceRecipe = (sauce: SauceRecipe) => (
    <div key={sauce.id} style={{
      backgroundColor: '#fff0f5',
      borderRadius: '8px',
      padding: '16px',
    }}>
      <div style={{
        fontWeight: 600,
        marginBottom: '8px',
        color: '#e91e63'
      }}>
        {sauce.name[lang]}
      </div>
      <div style={{
        color: '#666',
        fontSize: '14px',
        lineHeight: '1.6'
      }}>
        {sauce.recipe[lang]}
      </div>
    </div>
  );

  return (
    <div style={{ 
      paddingBottom: '70px',
      backgroundColor: '#fff0f5'
    }}>
      {renderSection(
        lang === 'en' ? 'Ingredient Selection 🥘' : '食材选择 🥘',
        ingredientTips,
        renderIngredientTip
      )}
      {renderSection(
        lang === 'en' ? 'Secret Sauce Recipes 🤫' : '绝密🤫 调料配比 🍳',
        sauceRecipes,
        renderSauceRecipe
      )}
    </div>
  );
};

export default RecipePage; 