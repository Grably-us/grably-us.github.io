// src/services/meilisearch.js

import { MeiliSearch } from 'meilisearch';

const MEILISEARCH_HOST = process.env.MEILISEARCH_HOST;
const MEILISEARCH_API_KEY = process.env.MEILISEARCH_API_KEY;

const searchClient = new MeiliSearch({
  host: MEILISEARCH_HOST,
  apiKey: MEILISEARCH_API_KEY,
});

export async function getAvailableIndexes() {
  try {
    const indexes = await searchClient.getIndexes();
    return indexes.results.map(index => index.uid);
  } catch (error) {
    console.error('Error fetching MeiliSearch indexes:', error);
    throw new Error(`Failed to fetch indexes: ${error.message}`);
  }
}

export async function search(query, index = 'videos') {
  try {
    console.log(`Searching for "${query}" in index "${index}"`);
    const results = await searchClient.index(index).search(query, {
      limit: 10,
      attributesToRetrieve: ['id', 'title', 'poster', 'overview'],
      attributesToHighlight: ['title'],
    });
    console.log('Search results:', results);
    return results.hits;
  } catch (error) {
    console.error('MeiliSearch error:', error);
    if (error.response) {
      console.error('Error response:', await error.response.json());
    }
    throw new Error(`Search failed: ${error.message}`);
  }
}

// We won't need these functions for the demo dataset, but keeping them for future use
export async function addDocument(document, index = 'movies') {
  try {
    await searchClient.index(index).addDocuments([document]);
  } catch (error) {
    console.error('Error adding document to MeiliSearch:', error);
    throw error;
  }
}

export async function updateDocument(document, index = 'movies') {
  try {
    await searchClient.index(index).updateDocuments([document]);
  } catch (error) {
    console.error('Error updating document in MeiliSearch:', error);
    throw error;
  }
}

export async function deleteDocument(documentId, index = 'movies') {
  try {
    await searchClient.index(index).deleteDocument(documentId);
  } catch (error) {
    console.error('Error deleting document from MeiliSearch:', error);
    throw error;
  }
}