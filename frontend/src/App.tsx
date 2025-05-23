import React, { useEffect, useState } from 'react';
import { LanguageProvider, useLanguage } from './LanguageContext';
import { AuthProvider, useAuth } from './AuthContext';
import uiText from './i18n';
import axios from 'axios';
import BottomNav from './components/BottomNav';
import MenuPage from './components/MenuPage';
import RecipePage from './components/RecipePage';
import LoginButton from './components/LoginButton';
import { config } from './config';

const { API_BASE } = config;

const STATUS_COLORS: Record<string, string> = {
  unlocked: '#4caf50', // 已解锁
  testing: '#ff9800',  // 测试中
  locked: '#9e9e9e',   // 待解锁
  '已解锁': '#4caf50',
  '测试中': '#ff9800',
  '待解锁': '#9e9e9e',
};

const LanguageSwitcher = () => {
  const { lang, setLang } = useLanguage();
  return (
    <button onClick={() => setLang(lang === 'en' ? 'zh' : 'en')} style={{ position: 'absolute', top: 10, right: 10 }}>
      {uiText[lang].switchLang}
    </button>
  );
};

function getStatusLabel(status: string, lang: 'en' | 'zh') {
  if (!status) return '';
  if (lang === 'zh') {
    if (status === 'unlocked') return '已解锁';
    if (status === 'testing') return '测试中';
    if (status === 'locked') return '待解锁';
    return status;
  } else {
    if (status === '已解锁') return 'Unlocked';
    if (status === '测试中') return 'Testing';
    if (status === '待解锁') return 'Locked';
    return status;
  }
}

const DishDetailModal = ({ dish, onClose, lang }: { dish: any; onClose: () => void; lang: 'en' | 'zh' }) => {
  if (!dish) return null;
  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(60,0,30,0.15)', zIndex: 200, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div style={{ background: '#fde8ec', borderRadius: 20, padding: 32, minWidth: 400, maxWidth: '90vw', boxShadow: '0 4px 32px #0002', position: 'relative' }}>
        <h2>{dish.name?.[lang]} {dish.emoji && <span>{dish.emoji}</span>}</h2>
        {dish.rating && <div style={{ color: '#ffb300', fontWeight: 700, fontSize: 22, margin: '8px 0' }}>⭐ {dish.rating}{lang === 'zh' ? '分' : ''}</div>}
        <div style={{ margin: '12px 0 4px 0', fontWeight: 600 }}>{lang === 'en' ? 'Notes' : '备注'}</div>
        <div style={{ background: '#f8bbd0', borderRadius: 8, padding: 12, color: '#333', fontSize: 16 }}>
          {dish.notes?.[lang] || (lang === 'en' ? 'No notes.' : '无备注')}
        </div>
        <button style={{ position: 'absolute', right: 24, bottom: 24, background: '#4caf50' }} onClick={onClose}>{lang === 'en' ? 'Close' : '关闭'}</button>
        {dish.status && <span style={{ position: 'absolute', right: 24, top: 24, background: STATUS_COLORS[dish.status] || '#ccc', color: '#fff', borderRadius: 8, padding: '4px 12px', fontWeight: 600 }}>{getStatusLabel(dish.status, lang)}</span>}
      </div>
    </div>
  );
};

const TipsPage = ({ tips, sauces, lang }: { tips: any[]; sauces: any[]; lang: 'en' | 'zh' }) => (
  <div style={{ padding: '24px 0 80px 0', maxWidth: 900, margin: '0 auto' }}>
    <h2>{lang === 'en' ? 'Ingredient Tips' : '食材选择'}</h2>
    <ul style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #eee' }}>
      {tips.map(item => (
        <li key={item.id} style={{ margin: '8px 0', fontSize: 18 }}>
          <b>{item.name?.[lang]}</b><br />
          <span style={{ color: '#666' }}>{item.description?.[lang]}</span>
        </li>
      ))}
    </ul>
    <h2 style={{ marginTop: 32 }}>{lang === 'en' ? 'Sauce Recipes' : '酱汁配方'}</h2>
    <ul style={{ background: '#fff', borderRadius: 8, padding: 16, boxShadow: '0 2px 8px #eee' }}>
      {sauces.map(item => (
        <li key={item.id} style={{ margin: '8px 0', fontSize: 18 }}>
          <b>{item.name?.[lang]}</b><br />
          <span style={{ color: '#666' }}>{item.recipe?.[lang]}</span>
        </li>
      ))}
    </ul>
  </div>
);

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
