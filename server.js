// Rename to server.mjs or add "type": "module" in package.json
import express, { urlencoded } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
app.use(express.json());
app.use(urlencoded({extended: false}))
app.use(cors());

const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const JWT_SECRET = process.env.JWT_SECRET || 'your_jwt_secret';

// Mock function to authenticate a user
const authenticateUser = async (email) => {
  const response = await axios.get(
    `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/staff?filterByFormula={Email}='${email}'`,
    {
      headers: {
        Authorization: `Bearer ${AIRTABLE_API_KEY}`,
      },
    }
  );

  if (!response.data || !response.data.records || response.data.records.length === 0) {
    throw new Error('User not found');
  }

  const user = response.data.records[0];

  // Replace this with proper password hashing and comparison logic
  // ... (should not directly compare passwords)

  return user;
};

// Login route to authenticate users and issue JWT
app.post('/api/auth/login', async (req, res) => {
  const { email } = req.body;

  console.log(req.body);
  console.log(email);

  try {
    const user = await authenticateUser(email);

    const token = jwt.sign({ id: user.fields.id, email: user.fields.email }, JWT_SECRET, {
      expiresIn: '1h',
    });

    res.json({ token, user: { id: user.id, email: user.fields['PC-Email'] } });
  } catch (error) {
    res.status(401).json({ message: error.message });
  }
});

// Middleware to verify JWT
const verifyToken = (req, res, next) => {
  const token = req.headers['authorization']?.split(' ')[1];
  if (!token) return res.sendStatus(401);

  jwt.verify(token, JWT_SECRET, (err, decoded) => {
    if (err) return res.sendStatus(403);
    req.user = decoded;
    next();
  });
};

// Protected route example
app.get('/api/secure-data', verifyToken, async (req, res) => {
  res.json({ message: 'This is protected data.', user: req.user });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
