import React, { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { AuthProvider, useAuth } from './AuthContext';
import axios from 'axios';
import BottomNav from './components/BottomNav';
import MenuPage from './components/MenuPage';
import RecipePage from './components/RecipePage';
import LoginButton from './components/LoginButton';
import { config } from './config';

const { API_BASE } = config;

// 标题栏组件
const TitleBar = () => {
  const { lang, setLang } = useLanguage();
  
  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '56px',
      backgroundColor: '#fff',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      zIndex: 100
    }}>
      <h1 style={{ 
        margin: 0, 
        fontSize: '20px',
        color: '#e91e63'
      }}>
        {lang === 'en' ? "Jacky & Yuan's Menu 😋" : '乐乐&袁宝の美味Menu😋'}
      </h1>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: '12px'
      }}>
        <LoginButton />
        <button
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          style={{
            padding: '8px 16px',
            borderRadius: '20px',
            border: '1px solid #e91e63',
            backgroundColor: '#fff',
            color: '#e91e63',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: 500
          }}
        >
          {lang === 'en' ? '切换为中文' : 'Switch to English'}
        </button>
      </div>
    </div>
  );
};

const MainContent = () => {
  const { lang } = useLanguage();
  const { isAdmin } = useAuth();
  const [currentTab, setCurrentTab] = useState<'menu' | 'recipe'>('menu');
  const [categories, setCategories] = useState<any[]>([]);
  const [ingredientTips, setIngredientTips] = useState<any[]>([]);
  const [sauceRecipes, setSauceRecipes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const [dishesRes, tipsRes, saucesRes] = await Promise.all([
          axios.get(`${API_BASE}/dishes`),
          axios.get(`${API_BASE}/ingredient_tips`),
          axios.get(`${API_BASE}/sauce_recipes`)
        ]);

        // Process dishes data
        const groupedDishes = dishesRes.data.reduce((acc: any, dish: any) => {
          const categoryId = dish.categoryId;
          if (!acc[categoryId]) {
            acc[categoryId] = {
              id: categoryId,
              name: dish.categoryName || { en: 'Others', zh: '其他' },
              dishes: []
            };
          }
          acc[categoryId].dishes.push({
            ...dish,
            status: dish.status || 'locked',
            subcategoryName: dish.subcategoryName || { en: 'Others', zh: '其他' }
          });
          return acc;
        }, {});

        setCategories(Object.values(groupedDishes));
        setIngredientTips(tipsRes.data);
        setSauceRecipes(saucesRes.data);
      } catch (error) {
        console.error('Failed to fetch data:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fff0f5',
      paddingTop: '56px'
    }}>
      {loading ? (
        <div style={{ padding: 32 }}>{lang === 'en' ? 'Loading...' : '加载中...'}</div>
      ) : (
        currentTab === 'menu' ? (
          <MenuPage categories={categories} isAdmin={isAdmin} />
        ) : (
          <RecipePage 
            ingredientTips={ingredientTips}
            sauceRecipes={sauceRecipes}
            isAdmin={isAdmin}
          />
        )
      )}
      <BottomNav currentTab={currentTab} onTabChange={setCurrentTab} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <LanguageProvider>
        <TitleBar />
        <MainContent />
      </LanguageProvider>
    </AuthProvider>
  );
}

export default App;
