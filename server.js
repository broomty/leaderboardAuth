// Rename to server.mjs or add "type": "module" in package.json
import express, { urlencoded } from 'express';
import jwt from 'jsonwebtoken';
import axios from 'axios';
import cors from 'cors';
import dotenv from 'dotenv';
import { AirtableService } from './services/airtable_services.js';

dotenv.config();

const app = express();
app.use(express.json());
app.use(urlencoded({extended: false}))
app.use(cors());

const apiKey = process.env.AIRTABLE_API_KEY;
const baseId = process.env.AIRTABLE_BASE_ID;
const jwtToken = process.env.JWT_SECRET || 'your_jwt_secret';
const parishes = new AirtableService(apiKey, baseId, 'parishes');
const groups = new AirtableService(apiKey, baseId, 'groups');

// Mock function to authenticate a user
const authenticateUser = async (email) => {
  const response = await axios.get(
    `https://api.airtable.com/v0/${baseId}/staff?filterByFormula={Email}='${email}'`,
    {
      headers: {
        Authorization: `Bearer ${apiKey}`,
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
app.post('/api/login', async (req, res) => {
  const { email } = req.body;

  console.log(req.body);
  console.log(email);

  try {
    const user = await authenticateUser(email);

    const token = jwt.sign({ id: user.fields.id, email: user.fields.email }, jwtToken, {
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
  if (!token) return res.status(401).json({ message: 'Token is not provided' });

  jwt.verify(token, jwtToken, (err, decoded) => {
    if (err) return res.status(403).json({ message: 'Token is not valid' });
    req.user = decoded;
    next();
  });
};

app.get('/api/parishes', verifyToken, (req, res) => {
  let parishesData;

  parishes.fetchAllRecords()
    .then(records => {
      parishesData = records;
      res.json(parishesData);
    })
    .catch(error => {
      console.error('Error:', error);
      res.status(500).json({ message: 'Unable to fetch parishes data from Airtable' }); 
    });
});

app.get('/api/groups',verifyToken,(req,res)=>{
  let groupsData;
  groups.fetchAllRecords().then(records=>{
    groupsData = records;
    res.json(groupsData);
  }).catch(error=>{
    console.error('Error:',error);
    res.status(500).json({message:'Unable to fetch groups data from Airtable'});
  })
})

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
