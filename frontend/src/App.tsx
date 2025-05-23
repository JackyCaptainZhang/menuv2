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
    <div
      className="titlebar-root"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: '#fff',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 100,
        padding: 0,
        width: '100%',
      }}
    >
      <div
        className="titlebar-inner"
        style={{
          display: 'flex',
          flexDirection: 'row',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 16px',
          height: '56px',
        }}
      >
        <div
          className="titlebar-title"
          style={{
            margin: 0,
            fontSize: '20px',
            color: '#e91e63',
            fontWeight: 700,
            flex: 1,
            textAlign: 'left',
          }}
        >
          {lang === 'en' ? "Jacky & Yuan's Menu 😋" : '乐乐&袁宝の美味Menu😋'}
        </div>
        <div
          className="titlebar-actions"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <LoginButton style={{
            padding: '4px 10px',
            borderRadius: '14px',
            fontSize: '13px',
            height: '32px',
            minWidth: 'auto',
          }} />
          <button
            onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
            style={{
              padding: '4px 10px',
              borderRadius: '14px',
              border: '1px solid #e91e63',
              backgroundColor: '#fff',
              color: '#e91e63',
              cursor: 'pointer',
              fontSize: '13px',
              fontWeight: 500,
              height: '32px',
              minWidth: 'auto',
            }}
          >
            {lang === 'en' ? '切换为中文' : 'Switch to English'}
          </button>
        </div>
      </div>
      {/* 手机端按钮单独一行 */}
      <div className="titlebar-actions-mobile">
        <LoginButton style={{
          padding: '4px 10px',
          borderRadius: '14px',
          fontSize: '13px',
          height: '32px',
          minWidth: 'auto',
        }} />
        <button
          onClick={() => setLang(lang === 'en' ? 'zh' : 'en')}
          style={{
            padding: '4px 10px',
            borderRadius: '14px',
            border: '1px solid #e91e63',
            backgroundColor: '#fff',
            color: '#e91e63',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            height: '32px',
            minWidth: 'auto',
            marginLeft: '8px',
          }}
        >
          {lang === 'en' ? '切换为中文' : 'Switch to English'}
        </button>
      </div>
      {/* 响应式样式 */}
      <style>{`
        .titlebar-actions-mobile {
          display: none;
        }
        @media (max-width: 600px) {
          .titlebar-inner {
            flex-direction: column !important;
            align-items: flex-start !important;
            height: auto !important;
            padding: 8px 16px 0 16px !important;
          }
          .titlebar-title {
            font-size: 17px !important;
            padding-bottom: 0 !important;
            width: 100% !important;
            text-align: left !important;
          }
          .titlebar-actions {
            display: none !important;
          }
          .titlebar-actions-mobile {
            display: flex !important;
            flex-direction: row;
            align-items: center;
            gap: 8px;
            width: 100%;
            justify-content: flex-start;
            padding: 4px 16px 8px 16px;
          }
        }
        @media (min-width: 601px) {
          .titlebar-inner {
            flex-direction: row !important;
            align-items: center !important;
            height: 56px !important;
            padding: 0 16px !important;
          }
          .titlebar-title {
            font-size: 20px !important;
            width: auto !important;
          }
          .titlebar-actions {
            display: flex !important;
          }
          .titlebar-actions-mobile {
            display: none !important;
          }
        }
      `}</style>
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

  // 响应式 paddingTop，防止内容被 TitleBar 遮挡
  const [paddingTop, setPaddingTop] = useState(56);
  useEffect(() => {
    const updatePadding = () => {
      if (window.innerWidth <= 600) {
        setPaddingTop(96); // 手机端 TitleBar 约两行高度
      } else {
        setPaddingTop(56); // 电脑端 TitleBar 一行高度
      }
    };
    updatePadding();
    window.addEventListener('resize', updatePadding);
    return () => window.removeEventListener('resize', updatePadding);
  }, []);

  return (
    <div style={{ 
      minHeight: '100vh', 
      backgroundColor: '#fff0f5',
      paddingTop: paddingTop,
    }}>
      {/* 状态说明组件应在这里插入（如有） */}
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
