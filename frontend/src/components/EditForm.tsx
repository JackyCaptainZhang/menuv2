import React, { useState } from 'react';
import { useLanguage } from '../LanguageContext';
import { v4 as uuidv4 } from 'uuid';
import pinyin from 'pinyin';

interface BilingualField {
  en: string;
  zh: string;
}

interface Category {
  id: string;
  name: BilingualField;
  dishes: any[];
}

interface FormData {
  id: string;
  name: BilingualField;
  status: 'unlocked' | 'testing' | 'locked';
  categoryName: BilingualField;
  categoryId: string;
  subcategoryName: BilingualField;
  rating?: number;
  emoji?: string;
  notes?: BilingualField;
  description?: BilingualField;
  recipe?: BilingualField;
  [key: string]: string | number | BilingualField | undefined;
}

interface EditFormProps {
  type: 'dish' | 'ingredient' | 'sauce';
  data: FormData;
  onClose: () => void;
  onSave: (updatedData: FormData) => void;
  categories?: Category[];
}

function getPinyinOrRaw(str: string): string {
  if (!str || typeof str !== 'string') return 'unknown';
  const hasChinese = /[\u4e00-\u9fa5]/.test(str);
  let base = '';
  if (hasChinese) {
    base = pinyin(str, { style: pinyin.STYLE_NORMAL })
      .flat()
      .join('');
  } else {
    base = str;
  }
  base = base.replace(/[^a-zA-Z0-9]/g, '').toLowerCase();
  return base || 'unknown';
}

const EditForm: React.FC<EditFormProps> = ({ type, data, onClose, onSave, categories }) => {
  const { lang } = useLanguage();
  const [formData, setFormData] = useState<FormData>({
    ...data,
    id: data.id || '',
    status: data.status || 'locked',
    categoryName: data.categoryName || { en: '', zh: '' },
    subcategoryName: data.subcategoryName || { en: 'Others', zh: '其他' }
  });
  const [errors, setErrors] = useState<{
    nameEn?: string;
    nameZh?: string;
  }>({});

  const handleChange = (field: string, value: any) => {
    if (field === 'rating') {
      const numValue = Number(value);
      const validRating = !isNaN(numValue) && numValue > 0 && numValue <= 100 ? numValue : undefined;
      setFormData((prev: FormData) => ({
        ...prev,
        [field]: validRating
      }));
    } else {
      setFormData((prev: FormData) => ({
        ...prev,
        [field]: value
      }));
    }
  };

  const handleBilingualChange = (field: string, language: 'en' | 'zh', value: string) => {
    setFormData((prev: FormData) => ({
      ...prev,
      [field]: {
        ...(prev[field] as BilingualField || { en: '', zh: '' }),
        [language]: value
      }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const newErrors: { nameEn?: string; nameZh?: string; } = {};
    if (!formData.name.en.trim()) {
      newErrors.nameEn = lang === 'en' ? 'English name is required' : '英文名称为必填项';
    }
    if (!formData.name.zh.trim()) {
      newErrors.nameZh = lang === 'en' ? 'Chinese name is required' : '中文名称为必填项';
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    let cleanedData: any;
    if (type === 'dish') {
      let id = formData.id;
      if (!id || id.trim() === '') {
        const zhName = formData.name.zh;
        const py = getPinyinOrRaw(zhName);
        id = `dish_${py}_${uuidv4()}`;
      }
      if (!formData.subcategoryName.en.trim() || !formData.subcategoryName.zh.trim()) {
        formData.subcategoryName = { en: 'Others', zh: '其他' };
      }
      cleanedData = {
        id,
        name: {
          en: formData.name.en.trim(),
          zh: formData.name.zh.trim()
        },
        status: formData.status,
        categoryName: formData.categoryName || { en: '', zh: '' },
        categoryId: formData.categoryId,
        subcategoryName: formData.subcategoryName || { en: 'Others', zh: '其他' },
        rating: formData.rating,
        emoji: formData.emoji,
        notes: formData.notes
      };
    } else if (type === 'ingredient') {
      let id = formData.id;
      if (!id || id.trim() === '') {
        const zhName = formData.name.zh;
        const py = getPinyinOrRaw(zhName);
        id = `ingredient_${py}_${uuidv4()}`;
      }
      cleanedData = {
        id,
        name: {
          en: formData.name.en.trim(),
          zh: formData.name.zh.trim()
        },
        description: formData.description || { en: '', zh: '' }
      };
    } else if (type === 'sauce') {
      let id = formData.id;
      if (!id || id.trim() === '') {
        const zhName = formData.name.zh;
        const py = getPinyinOrRaw(zhName);
        id = `sauce_${py}_${uuidv4()}`;
      }
      cleanedData = {
        id,
        name: {
          en: formData.name.en.trim(),
          zh: formData.name.zh.trim()
        },
        recipe: formData.recipe || { en: '', zh: '' }
      };
    }

    onSave(cleanedData);
    onClose();
  };

  const renderField = (label: string, field: string, type: 'text' | 'number' = 'text', isBilingual = false, isMultiline = false) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ marginBottom: '4px', color: '#666', fontSize: '14px' }}>{label}</div>
      {isBilingual ? (
        <div style={{ display: 'flex', gap: '8px', flexDirection: isMultiline ? 'column' : 'row' }}>
          {isMultiline ? (
            <>
              <textarea
                value={(formData[field] as BilingualField)?.zh || ''}
                onChange={e => handleBilingualChange(field, 'zh', e.target.value)}
                placeholder="中文"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: errors.nameZh && field === 'name' ? '1px solid #f44336' : '1px solid #ddd',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
              <textarea
                value={(formData[field] as BilingualField)?.en || ''}
                onChange={e => handleBilingualChange(field, 'en', e.target.value)}
                placeholder="English"
                style={{
                  width: '100%',
                  padding: '8px',
                  borderRadius: '8px',
                  border: errors.nameEn && field === 'name' ? '1px solid #f44336' : '1px solid #ddd',
                  minHeight: '100px',
                  resize: 'vertical'
                }}
              />
            </>
          ) : (
            <>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <input
                  type={type}
                  value={(formData[field] as BilingualField)?.zh || ''}
                  onChange={e => handleBilingualChange(field, 'zh', e.target.value)}
                  placeholder="中文"
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: errors.nameZh && field === 'name' ? '1px solid #f44336' : '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
                {errors.nameZh && field === 'name' && (
                  <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>
                    {errors.nameZh}
                  </div>
                )}
              </div>
              <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                <input
                  type={type}
                  value={(formData[field] as BilingualField)?.en || ''}
                  onChange={e => handleBilingualChange(field, 'en', e.target.value)}
                  placeholder="English"
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: errors.nameEn && field === 'name' ? '1px solid #f44336' : '1px solid #ddd',
                    fontSize: '14px'
                  }}
                />
                {errors.nameEn && field === 'name' && (
                  <div style={{ color: '#f44336', fontSize: '12px', marginTop: '4px' }}>
                    {errors.nameEn}
                  </div>
                )}
              </div>
            </>
          )}
        </div>
      ) : (
        <input
          type={type}
          value={formData[field]?.toString() || ''}
          onChange={e => handleChange(field, e.target.value)}
          placeholder={field === 'rating' ? '1-100' : ''}
          maxLength={field === 'rating' ? 3 : undefined}
          style={{
            width: '100%',
            padding: '6px',
            borderRadius: '6px',
            border: '1px solid #ddd',
            fontSize: '14px'
          }}
        />
      )}
    </div>
  );

  const renderCategorySelect = (label: string) => (
    <div style={{ marginBottom: '12px' }}>
      <div style={{ marginBottom: '4px', color: '#666', fontSize: '14px' }}>{label}</div>
      <select
        value={categories?.find(c => 
          c.name.zh === formData.categoryName.zh && 
          c.name.en === formData.categoryName.en
        )?.id || ''}
        onChange={e => {
          const selectedCategory = categories?.find(c => c.id === e.target.value);
          if (selectedCategory) {
            handleChange('categoryName', selectedCategory.name);
            handleChange('categoryId', selectedCategory.id);
          }
        }}
        style={{
          width: '100%',
          padding: '6px',
          borderRadius: '6px',
          border: '1px solid #ddd',
          fontSize: '14px'
        }}
      >
        <option value="">{lang === 'en' ? 'Select category' : '选择分类'}</option>
        {categories?.map(category => (
          <option key={category.id} value={category.id}>
            {category.name[lang]}
          </option>
        ))}
      </select>
    </div>
  );

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
    }}>
      <style>
        {`
          input[type="number"]::-webkit-outer-spin-button,
          input[type="number"]::-webkit-inner-spin-button {
            -webkit-appearance: none;
            margin: 0;
          }
          input[type="number"] {
            -moz-appearance: textfield;
          }
        `}
      </style>
      <div style={{
        backgroundColor: '#fff',
        borderRadius: '16px',
        padding: '20px',
        width: '90%',
        maxWidth: '500px',
        maxHeight: '90vh',
        overflow: 'auto'
      }}>
        <h2 style={{ margin: '0 0 16px 0', color: '#e91e63', fontSize: '18px' }}>
          {type === 'dish' ? 
            (!data.id ? (lang === 'en' ? 'Add Dish' : '添加菜品') : (lang === 'en' ? 'Edit Dish' : '编辑菜品')) :
           type === 'ingredient' ? 
            (!data.id ? (lang === 'en' ? 'Add Ingredient' : '添加食材') : (lang === 'en' ? 'Edit Ingredient' : '编辑食材')) :
            (!data.id ? (lang === 'en' ? 'Add Sauce' : '添加酱料') : (lang === 'en' ? 'Edit Sauce' : '编辑酱料'))}
        </h2>
        <form onSubmit={handleSubmit}>
          {renderField(lang === 'en' ? 'Name' : '名称', 'name', 'text', true)}
          
          {type === 'dish' ? (
            <>
              {renderCategorySelect(lang === 'en' ? 'Category' : '分类')}
              {renderField(lang === 'en' ? 'Subcategory' : '子分类', 'subcategoryName', 'text', true)}
              <div style={{ display: 'flex', gap: '8px' }}>
                <div style={{ flex: 1 }}>
                  {renderField(lang === 'en' ? 'Rating' : '评分', 'rating', 'number')}
                </div>
                <div style={{ flex: 1 }}>
                  {renderField(lang === 'en' ? 'Emoji' : '表情', 'emoji')}
                </div>
              </div>
              {renderField(lang === 'en' ? 'Notes' : '备注', 'notes', 'text', true, true)}
              <div style={{ marginBottom: '12px' }}>
                <div style={{ marginBottom: '4px', color: '#666', fontSize: '14px' }}>
                  {lang === 'en' ? 'Status' : '状态'}
                </div>
                <select
                  value={formData.status}
                  onChange={e => handleChange('status', e.target.value as 'unlocked' | 'testing' | 'locked')}
                  style={{
                    width: '100%',
                    padding: '6px',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '14px'
                  }}
                >
                  <option value="unlocked">{lang === 'en' ? 'Unlocked' : '已解锁'}</option>
                  <option value="testing">{lang === 'en' ? 'Testing' : '测试中'}</option>
                  <option value="locked">{lang === 'en' ? 'Locked' : '待解锁'}</option>
                </select>
              </div>
            </>
          ) : type === 'ingredient' ? (
            renderField(lang === 'en' ? 'Description' : '描述', 'description', 'text', true, true)
          ) : (
            renderField(lang === 'en' ? 'Recipe' : '配方', 'recipe', 'text', true, true)
          )}

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', marginTop: '20px' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid #666',
                backgroundColor: '#fff',
                color: '#666',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {lang === 'en' ? 'Cancel' : '取消'}
            </button>
            <button
              type="submit"
              style={{
                padding: '6px 16px',
                borderRadius: '20px',
                border: '1px solid #e91e63',
                backgroundColor: '#e91e63',
                color: '#fff',
                cursor: 'pointer',
                fontSize: '14px'
              }}
            >
              {lang === 'en' ? 'Save' : '保存'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditForm; 