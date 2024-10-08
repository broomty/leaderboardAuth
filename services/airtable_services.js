// airtableService.js

import axios from 'axios';

export class AirtableService {
  constructor(apiKey, baseId, tableName) {
    this.apiKey = apiKey;
    this.baseId = baseId;
    this.tableName = tableName;
  }

  async fetchAllRecords(view) {
    const encodedTableName = encodeURIComponent(this.tableName);
    const encodedView = encodeURIComponent(view);
    try {
      let records = [];
      let offset = null;

      do {
        const response = await axios.get(`https://api.airtable.com/v0/${this.baseId}/${encodedTableName}?view=${encodedView}`, {
          headers: {
            Authorization: `Bearer ${this.apiKey}`,
          },
          params: {
            offset: offset,
          },
        });
        records = records.concat(response.data.records);
        offset = response.data.offset;
      } while (offset);

      return records;
    } catch (error) {
      console.error('Error fetching records:', error);
      throw error;
    }
  }

  async authenticateUser  (email,view) {
    const encodedtableName = encodeURIComponent(this.tableName);
    const encodedView = encodeURIComponent(view);
    const response = await axios.get(
      `https://api.airtable.com/v0/${this.baseId}/${encodedtableName}?filterByFormula={Email}='${email}'&view=${encodedView}`,
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

}
