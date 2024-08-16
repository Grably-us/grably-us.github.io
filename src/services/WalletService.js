import { pb } from './pocketbase';

export async function ensureWalletExists(userId) {
  const maxRetries = 5;
  const retryDelay = 1000; // 1 second

  for (let i = 0; i < maxRetries; i++) {
    try {
      // Try to fetch the wallet directly
      const wallet = await pb.collection('Wallet').getFirstListItem(`owner="${userId}"`);
      
      if (wallet) {
        return wallet;
      }

      // If we reach here, wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    } catch (error) {
      if (error.status === 404) {
        // Wallet not found, it might not have been created yet
        console.log(`Attempt ${i + 1}: Wallet not found for user ${userId}`);
      } else {
        console.error(`Attempt ${i + 1} failed: ${error.message}`);
      }

      if (i === maxRetries - 1) {
        throw new Error('Failed to retrieve wallet after multiple attempts');
      }
      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, retryDelay));
    }
  }

  throw new Error('Failed to retrieve wallet after multiple attempts');
}