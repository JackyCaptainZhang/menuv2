const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
const path = require('path');
require('dotenv').config();

// 初始化 Firebase Admin
if (!admin.apps.length) {
  try {
    // 尝试使用本地服务账号文件
    const serviceAccount = require('./menu-app-823bd-firebase-adminsdk-fbsvc-d76d867ba6.json');
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });
  } catch (error) {
    // 如果本地文件不存在，使用环境变量
    admin.initializeApp({
      credential: admin.credential.cert({
        "type": process.env.FIREBASE_TYPE,
        "project_id": process.env.FIREBASE_PROJECT_ID,
        "private_key_id": process.env.FIREBASE_PRIVATE_KEY_ID,
        "private_key": process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
        "client_email": process.env.FIREBASE_CLIENT_EMAIL,
        "client_id": process.env.FIREBASE_CLIENT_ID,
        "auth_uri": process.env.FIREBASE_AUTH_URI,
        "token_uri": process.env.FIREBASE_TOKEN_URI,
        "auth_provider_x509_cert_url": process.env.FIREBASE_AUTH_PROVIDER_X509_CERT_URL,
        "client_x509_cert_url": process.env.FIREBASE_CLIENT_X509_CERT_URL
      })
    });
  }
}

const db = admin.firestore();

const app = express();
app.use(cors());
app.use(express.json());

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.send('Hello from the backend!');
});

// ========== Admin Routes ==========
// Get all admins
app.get('/api/admins', async (req, res) => {
  try {
    console.log('Fetching admins...');
    const snapshot = await db.collection('admins').get();
    
    if (snapshot.empty) {
      console.log('No admin documents found');
      return res.json([]);
    }

    const admins = [];
    snapshot.forEach(doc => {
      console.log(`Processing admin document: ${doc.id}`);
      const data = doc.data();
      admins.push({
        email: data.email,
        name: doc.id
      });
    });

    console.log('Successfully retrieved admins:', admins);
    res.json(admins);
  } catch (error) {
    console.error('Error getting admins:', error);
    res.status(500).json({ 
      error: 'Failed to get admins', 
      details: error.message 
    });
  }
});

// Get all dishes
app.get('/api/dishes', async (req, res) => {
  try {
    const snapshot = await db.collection('dishes').get();
    const dishes = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(dishes);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get a single dish by ID
app.get('/api/dishes/:id', async (req, res) => {
  try {
    const doc = await db.collection('dishes').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Dish not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// 通用：生成安全ID
const toSafeId = (str) => {
  const processed = str
    .toLowerCase()
    .replace(/[^a-z0-9\u4e00-\u9fa5]/g, '_')  // 保留中文字符
    .replace(/_+/g, '_')
    .replace(/^_|_$/g, '');
  
  // 如果处理后的ID为空，使用时间戳作为后备
  if (!processed) {
    return `item_${Date.now()}`;
  }
  return processed;
};

// Create a new dish（用中文名或英文名作为ID）
app.post('/api/dishes', async (req, res) => {
  try {
    const data = req.body;
    let baseId = '';
    
    // 尝试从名称生成ID
    if (data.name && (data.name.zh || data.name.en)) {
      if (data.name.zh) {
        baseId = toSafeId(data.name.zh);
      }
      if (!baseId && data.name.en) {
        baseId = toSafeId(data.name.en);
      }
    }
    
    // 如果没有生成有效的ID，使用时间戳
    if (!baseId) {
      baseId = `dish_${Date.now()}`;
    }

    // 检查是否已存在同名ID
    const docRef = db.collection('dishes').doc(baseId);
    const doc = await docRef.get();
    if (doc.exists) {
      // 如果ID已存在，添加时间戳后缀
      baseId = `${baseId}_${Date.now()}`;
    }
    
    // 创建新文档
    await db.collection('dishes').doc(baseId).set(data);
    res.status(201).json({ id: baseId, ...data });
  } catch (error) {
    console.error('Error creating dish:', error);
    res.status(500).json({ error: error.message });
  }
});

// Update a dish
app.put('/api/dishes/:id', async (req, res) => {
  try {
    const docRef = db.collection('dishes').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    await docRef.update(req.body);
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a dish
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    const docRef = db.collection('dishes').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Dish not found' });
    }
    await docRef.delete();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ingredient_tips CRUD ==========
// Get all ingredient_tips
app.get('/api/ingredient_tips', async (req, res) => {
  try {
    const snapshot = await db.collection('ingredient_tips').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get one
app.get('/api/ingredient_tips/:id', async (req, res) => {
  try {
    const doc = await db.collection('ingredient_tips').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Create
app.post('/api/ingredient_tips', async (req, res) => {
  try {
    const data = req.body;
    let baseId = '';
    if (data.name && data.name.zh) {
      baseId = toSafeId(data.name.zh);
    } else if (data.name && data.name.en) {
      baseId = toSafeId(data.name.en);
    } else {
      return res.status(400).json({ error: 'Name is required' });
    }
    const docRef = db.collection('ingredient_tips').doc(baseId);
    const doc = await docRef.get();
    if (doc.exists) {
      return res.status(409).json({ error: 'Item with this name already exists' });
    }
    await docRef.set(data);
    res.status(201).json({ id: baseId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update
app.put('/api/ingredient_tips/:id', async (req, res) => {
  try {
    const docRef = db.collection('ingredient_tips').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await docRef.update(req.body);
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete
app.delete('/api/ingredient_tips/:id', async (req, res) => {
  try {
    const docRef = db.collection('ingredient_tips').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await docRef.delete();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== sauce_recipes CRUD ==========
// Get all
app.get('/api/sauce_recipes', async (req, res) => {
  try {
    const snapshot = await db.collection('sauce_recipes').get();
    const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    res.json(items);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Get one
app.get('/api/sauce_recipes/:id', async (req, res) => {
  try {
    const doc = await db.collection('sauce_recipes').doc(req.params.id).get();
    if (!doc.exists) return res.status(404).json({ error: 'Not found' });
    res.json({ id: doc.id, ...doc.data() });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Create
app.post('/api/sauce_recipes', async (req, res) => {
  try {
    const data = req.body;
    let baseId = '';
    if (data.name && data.name.zh) {
      baseId = toSafeId(data.name.zh);
    } else if (data.name && data.name.en) {
      baseId = toSafeId(data.name.en);
    } else {
      return res.status(400).json({ error: 'Name is required' });
    }
    const docRef = db.collection('sauce_recipes').doc(baseId);
    const doc = await docRef.get();
    if (doc.exists) {
      return res.status(409).json({ error: 'Item with this name already exists' });
    }
    await docRef.set(data);
    res.status(201).json({ id: baseId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Update
app.put('/api/sauce_recipes/:id', async (req, res) => {
  try {
    const docRef = db.collection('sauce_recipes').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await docRef.update(req.body);
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete
app.delete('/api/sauce_recipes/:id', async (req, res) => {
  try {
    const docRef = db.collection('sauce_recipes').doc(req.params.id);
    const doc = await docRef.get();
    if (!doc.exists) {
      return res.status(404).json({ error: 'Item not found' });
    }
    await docRef.delete();
    res.json({ id: req.params.id });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

// 导出 Express 应用
module.exports = app; 