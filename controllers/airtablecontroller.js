import { getRecords, createRecord, updateRecord, deleteRecord } from '../services/airtableService.mjs';

export const getAllRecords = async (req, res) => {
  try {
    const { offset } = req.query;
    const data = await getRecords(offset);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const createNewRecord = async (req, res) => {
  try {
    const data = await createRecord(req.body);
    res.status(201).json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const updateExistingRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await updateRecord(id, req.body);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const deleteExistingRecord = async (req, res) => {
  try {
    const { id } = req.params;
    const data = await deleteRecord(id);
    res.json(data);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
