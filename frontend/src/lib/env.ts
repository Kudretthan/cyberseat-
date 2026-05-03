export const ENV = {
  STELLAR_NETWORK: import.meta.env.VITE_STELLAR_NETWORK || 'testnet',
  STELLAR_RPC_URL: import.meta.env.VITE_STELLAR_RPC_URL || 'https://soroban-testnet.stellar.org',
  CYBERSEAT_CONTRACT_ID: import.meta.env.VITE_CYBERSEAT_CONTRACT_ID,
  XLM_TOKEN_CONTRACT_ID: import.meta.env.VITE_XLM_TOKEN_CONTRACT_ID || 'CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC',
  CAFE_WALLET_ADDRESS: import.meta.env.VITE_CAFE_WALLET_ADDRESS,
};

export function isContractIdValid(): boolean {
  if (!ENV.CYBERSEAT_CONTRACT_ID) return false;
  const invalidPlaceholders = [
    'your_new_contract_id_after_deploy', 
    'your_deployed_contract_id', 
    'placeholder_after_deploy',
    ''
  ];
  return !invalidPlaceholders.includes(ENV.CYBERSEAT_CONTRACT_ID);
}

export function isCafeWalletValid(): boolean {
  if (!ENV.CAFE_WALLET_ADDRESS) return false;
  const invalidPlaceholders = ['your_cafe_wallet_public_key', ''];
  return !invalidPlaceholders.includes(ENV.CAFE_WALLET_ADDRESS);
}
