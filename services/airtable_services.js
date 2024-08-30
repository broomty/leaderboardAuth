// airtableService.js

import axios from 'axios';

export class AirtableService {
  constructor(apiKey, baseId, tableName) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.tableName = tableName;
    this.baseUrl = `https://api.airtable.com/v0/${this.baseId}/${this.tableName}`;
  }

  async fetchAllRecords() {
    try {
      let records = [];
      let offset = null;

      do {
        const response = await this.fetchRecords(offset);
        records = records.concat(response.data.records);
        offset = response.data.offset;
      } while (offset);

      return records;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }

  async authenticateUser  (email) {
    const response = await axios.get(
      `https://api.airtable.com/v0/${this.baseId}/staff?filterByFormula={Email}='${email}'`,
      {
        headers: {
          Authorization: `Bearer ${this.apiKey}`,
        },
      }
    );
  
    if (!response.data || !response.data.records || response.data.records.length === 0) {
      throw new Error('User not found');
    }
  
    const user = response.data.records[0];
  
    return user;
  };

  async fetchRecords(offset) {
    const config = {
      headers: {
        Authorization: `Bearer ${this.apiKey}`,
      },
      params: {
        offset: offset,
      },
    };

    return axios.get(this.baseUrl, config);
  }
}
