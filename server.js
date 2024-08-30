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
const opsBase = process.env.UG_OPS_BASE_ID; //for staff
const nurseryBase = process.env.UG_NU_BASE_ID; //for parishes
const staffView = process.env.STAFF_VIEW;

const jwtToken = process.env.JWT_SECRET || 'your_jwt_secret';

const staff = new AirtableService(apiKey, opsBase, 'staff');
const parishes = new AirtableService(apiKey, nurseryBase, 'parishes');
const groups = new AirtableService(apiKey, nurseryBase, 'groups');

// Mock function to authenticate a user


// Login route to authenticate users and issue JWT
app.post('/api/login', async (req, res) => {
  const { email } = req.body;

  console.log(req.body);
  console.log(email);

  try {
    const user = await staff.authenticateUser(email,staffView);

    const token = jwt.sign({ id: user.fields.id, email: user.fields.email }, jwtToken, {
      expiresIn: '1h',
    });

    res.json({ token, user: { id: user.id, userData: {email:user.fields['Email'],firstName:user.fields['First Name'],lastName:user.fields['Last Name'],role:user.fields['Role']}} });
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
