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
app.use(express.json({ limit: '1mb' }));
app.use(cors());

// Example API endpoint
app.get('/api/hello', (req, res) => {
  res.send('Hello from the backend!');
});

// ========== Admin Routes ==========
// Get all admins
app.get('/api/admins', async (req, res) => {
  try {
    const snapshot = await db.collection('admins').get();
    
    if (snapshot.empty) {
      return res.json([]);
    }

    const admins = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      admins.push({
        email: data.email,
        name: doc.id
      });
    });

    res.json(admins);
  } catch (error) {
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

// Create a new dish
app.post('/api/dishes', async (req, res) => {
  try {
    const data = req.body;
    const { id, ...rest } = data;

    if (typeof id === 'string' && id.trim() !== '') {
      await db.collection('dishes').doc(id).set(rest);
      res.status(201).json({ id });
    } else {
      const docRef = await db.collection('dishes').add(rest);
      res.status(201).json({ id: docRef.id });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.stack,
      id: req.body.id,
      body: req.body
    });
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
    const { id, ...rest } = req.body;
    await docRef.update(rest);
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

// Create ingredient_tips
app.post('/api/ingredient_tips', async (req, res) => {
  try {
    const data = req.body;
    const { id, name, description } = data;
    // 只用前端传来的 id（uuid），不做任何处理
    if (typeof id === 'string' && id.trim() !== '') {
      await db.collection('ingredient_tips').doc(id).set({ name, description });
      res.status(201).json({ id });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.stack,
      id: req.body.id,
      body: req.body
    });
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
    const { id, ...rest } = req.body;
    await docRef.update(rest);
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
// Create sauce_recipes
app.post('/api/sauce_recipes', async (req, res) => {
  try {
    const data = req.body;
    const { id, ...rest } = data;

    if (typeof id === 'string' && id.trim() !== '') {
      await db.collection('sauce_recipes').doc(id).set(rest);
      res.status(201).json({ id });
    } else {
      const docRef = await db.collection('sauce_recipes').add(rest);
      res.status(201).json({ id: docRef.id });
    }
  } catch (error) {
    res.status(500).json({ 
      error: error.message,
      details: error.stack,
      id: req.body.id,
      body: req.body
    });
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
    const { id, ...rest } = req.body;
    await docRef.update(rest);
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