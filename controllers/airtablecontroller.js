// airtableController.js

const axios = require('axios');
require('dotenv').config();

// Airtable configuration
const AIRTABLE_API_KEY = process.env.AIRTABLE_API_KEY;
const AIRTABLE_BASE_ID = process.env.AIRTABLE_BASE_ID;
const AIRTABLE_TABLE_NAME = process.env.AIRTABLE_TABLE_NAME;

// Airtable API URL
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}/${AIRTABLE_TABLE_NAME}`;

// Axios instance with Airtable API Key
const axiosInstance = axios.create({
  baseURL: AIRTABLE_API_URL,
  headers: {
    Authorization: `Bearer ${AIRTABLE_API_KEY}`,
    'Content-Type': 'application/json',
  },
});

// Get all records
const getAllRecords = async (req, res) => {
  try {
    const response = await axiosInstance.get();
    res.status(200).json(response.data.records);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Get a single record by ID
const getRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    const response = await axiosInstance.get(`/${id}`);
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Create a new record
const createRecord = async (req, res) => {
  const { fields } = req.body;
  try {
    const response = await axiosInstance.post('', { fields });
    res.status(201).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Update a record by ID
const updateRecordById = async (req, res) => {
  const { id } = req.params;
  const { fields } = req.body;
  try {
    const response = await axiosInstance.patch(`/${id}`, { fields });
    res.status(200).json(response.data);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Delete a record by ID
const deleteRecordById = async (req, res) => {
  const { id } = req.params;
  try {
    await axiosInstance.delete(`/${id}`);
    res.status(200).json({ message: 'Record deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllRecords,
  getRecordById,
  createRecord,
  updateRecordById,
  deleteRecordById,
};
