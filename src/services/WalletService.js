import { pb } from './pocketbase';

export async function ensureWalletExists(userId) {
  try {
    const user = await pb.collection('users').getOne(userId, { expand: 'wallet' });
    
    if (user.expand.wallet) {
      console.log('User already has a wallet');
      return user.expand.wallet;
    }

    // If no wallet exists, create one
    const wallet = await pb.collection('Wallet').create({
      owner: userId,
      token_balance: 0,
      fiat_balance: 0
    });

    // Update the user with the new wallet
    await pb.collection('users').update(userId, {
      wallet: wallet.id
    });

    console.log('New wallet created for user');
    return wallet;
  } catch (error) {
    console.error('Error ensuring wallet exists:', error);
    throw error;
  }
}