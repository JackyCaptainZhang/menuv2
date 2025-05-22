const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');
require('dotenv').config();

const app = express();
app.use(cors());
app.use(express.json());

// 引用服务账号密钥文件
const serviceAccount = require('./menu-app-823bd-firebase-adminsdk-fbsvc-d76d867ba6.json');

// 用服务账号初始化
admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
});

// Firestore reference
const db = admin.firestore();

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.send('Hello from the backend!');
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
function toSafeId(str) {
  return str
    .replace(/\s+/g, '_')
    .replace(/[^\u4e00-\u9fa5a-zA-Z0-9_]/g, '')
    .toLowerCase();
}

// Create a new dish（用中文名或英文名作为ID）
app.post('/api/dishes', async (req, res) => {
  try {
    const data = req.body;
    let baseId = '';
    if (data.name && data.name.zh) {
      baseId = toSafeId(data.name.zh);
    } else if (data.name && data.name.en) {
      baseId = toSafeId(data.name.en);
    } else {
      return res.status(400).json({ error: 'Dish name is required' });
    }
    // 检查是否已存在同名ID
    const docRef = db.collection('dishes').doc(baseId);
    const doc = await docRef.get();
    if (doc.exists) {
      return res.status(409).json({ error: 'Dish with this name already exists' });
    }
    await docRef.set(data);
    res.status(201).json({ id: baseId });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update a dish
app.put('/api/dishes/:id', async (req, res) => {
  try {
    const data = req.body;
    await db.collection('dishes').doc(req.params.id).update(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete a dish
app.delete('/api/dishes/:id', async (req, res) => {
  try {
    await db.collection('dishes').doc(req.params.id).delete();
    res.json({ success: true });
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
    const data = req.body;
    await db.collection('ingredient_tips').doc(req.params.id).update(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete
app.delete('/api/ingredient_tips/:id', async (req, res) => {
  try {
    await db.collection('ingredient_tips').doc(req.params.id).delete();
    res.json({ success: true });
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
    const data = req.body;
    await db.collection('sauce_recipes').doc(req.params.id).update(data);
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});
// Delete
app.delete('/api/sauce_recipes/:id', async (req, res) => {
  try {
    await db.collection('sauce_recipes').doc(req.params.id).delete();
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
}); 