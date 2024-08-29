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
