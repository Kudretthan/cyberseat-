import {
  isConnected,
  requestAccess,
  getAddress,
  getNetworkDetails,
  signTransaction,
} from '@stellar/freighter-api';

export async function checkFreighter(): Promise<boolean> {
  const res = await isConnected();
  return res.isConnected;
}

export async function connectWallet(): Promise<string> {
  try {
    const res = await requestAccess();
    if (res.error) throw new Error(res.error);
    return res.address;
  } catch (e) {
    console.error(e);
    return '';
  }
}

export async function getWalletAddress(): Promise<string> {
  try {
    const res = await getAddress();
    if (res.error) throw new Error(res.error);
    return res.address;
  } catch (e) {
    console.error(e);
    return '';
  }
}

export async function getNetwork(): Promise<string> {
  try {
    const res = await getNetworkDetails();
    return res.network;
  } catch (e) {
    console.error(e);
    return '';
  }
}

export async function signTx(xdr: string, networkPassphrase: string): Promise<string> {
  try {
    const res = await signTransaction(xdr, { networkPassphrase });
    if (res.error) throw new Error(res.error);
    return res.signedTxXdr;
  } catch (e) {
    console.error(e);
    throw e;
  }
}
