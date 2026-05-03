import { Contract, nativeToScVal, scValToNative, rpc, Networks, TransactionBuilder, Address } from '@stellar/stellar-sdk';
import { signTx } from './freighter';
import { ENV, isContractIdValid, isCafeWalletValid } from './env';

const server = new rpc.Server(ENV.STELLAR_RPC_URL);
const NETWORK_PASSPHRASE = Networks.TESTNET;

const parseContractError = (err: any, context?: 'complete' | 'refund'): string => {
  const msg = err.message || "";
  console.error("Soroban Error Detail:", err);

  if (msg.includes('Error(Contract, 1)')) return "Contract already initialized. You can continue.";
  if (msg.includes('Error(Contract, 2)')) return "Contract is not initialized. Run init first.";
  if (msg.includes('Error(Contract, 3)')) return "Invalid amount.";
  if (msg.includes('Error(Contract, 4)')) return "Invalid duration.";
  if (msg.includes('Error(Contract, 5)')) return "Booking not found.";
  if (msg.includes('Error(Contract, 6)')) return "Booking is already completed or cancelled.";
  if (msg.includes('Error(Contract, 7)')) return "Access Denied. Wrong wallet for this action.";
  
  if (msg.includes('txBadAuth')) {
    if (context === 'complete') return "Only the cafe wallet can complete this booking.";
    if (context === 'refund') return "Only the customer wallet can refund this booking.";
    return "Authorization failed. Check your connected wallet.";
  }
  
  if (msg.includes('UnreachableCodeReached') || msg.includes('InvalidAction')) {
    return "Contract execution failed. Ensure it's initialized correctly.";
  }

  return "Transaction failed. Please check your wallet and balance.";
};

export async function createBookingEscrow(
  customerPublicKey: string,
  cafePublicKey: string,
  amountXlm: number,
  seatId: string,
  hours: number
) {
  if (!customerPublicKey) throw new Error("Please connect Freighter first");
  if (!isContractIdValid()) throw new Error("CyberSeat contract ID is missing. Deploy the Soroban contract and set VITE_CYBERSEAT_CONTRACT_ID in .env.");
  if (!isCafeWalletValid()) throw new Error("Cafe wallet address is missing");

  try {
    const account = await server.getAccount(customerPublicKey);
    const contract = new Contract(ENV.CYBERSEAT_CONTRACT_ID!);

    // convert XLM to stroops (1 XLM = 10,000,000 stroops)
    const stroops = BigInt(Math.floor(amountXlm * 10_000_000));
    const seatCode = parseInt(seatId.split('-')[1]) || 1;

    const args = [
      new Address(customerPublicKey).toScVal(),
      new Address(cafePublicKey).toScVal(),
      nativeToScVal(stroops, { type: 'i128' }),
      nativeToScVal(seatCode, { type: 'u32' }),
      nativeToScVal(hours, { type: 'u32' }),
    ];

    const callTx = contract.call('create_booking', ...args);

    let tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(callTx)
      .setTimeout(30)
      .build();

    const preparedTx = await server.prepareTransaction(tx);
    const signedXdr = await signTx(preparedTx.toXDR(), NETWORK_PASSPHRASE);
    
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx as any);
    
    if (result.status !== 'PENDING') {
      throw new Error(`Failed to send tx: ${result.status}`);
    }

    let txResponse = await server.getTransaction(result.hash);
    let retries = 0;
    while (txResponse.status === 'NOT_FOUND' && retries < 15) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      txResponse = await server.getTransaction(result.hash);
      retries++;
    }

    if (txResponse.status === 'SUCCESS') {
      let contractBookingId = "0";
      if (txResponse.returnValue) {
        contractBookingId = scValToNative(txResponse.returnValue).toString();
      }
      return { success: true, hash: result.hash, contractBookingId };
    } else {
      throw new Error(`Tx failed: ${txResponse.status}`);
    }

  } catch (err: any) {
    throw new Error(parseContractError(err));
  }
}

export async function completeBooking(signerPublicKey: string, bookingId: string) {
  if (!isContractIdValid()) throw new Error("CyberSeat contract ID is missing");

  try {
    const account = await server.getAccount(signerPublicKey);
    const contract = new Contract(ENV.CYBERSEAT_CONTRACT_ID!);

    const args = [
      nativeToScVal(BigInt(bookingId), { type: 'u64' }),
    ];

    const callTx = contract.call('complete_booking', ...args);

    let tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(callTx)
      .setTimeout(30)
      .build();

    const preparedTx = await server.prepareTransaction(tx);
    const signedXdr = await signTx(preparedTx.toXDR(), NETWORK_PASSPHRASE);
    
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx as any);
    
    if (result.status !== 'PENDING') {
      throw new Error(`Failed to send tx: ${result.status}`);
    }

    let txResponse = await server.getTransaction(result.hash);
    let retries = 0;
    while (txResponse.status === 'NOT_FOUND' && retries < 15) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      txResponse = await server.getTransaction(result.hash);
      retries++;
    }

    if (txResponse.status === 'SUCCESS') {
      return { success: true, hash: result.hash };
    } else {
      throw new Error(`Tx failed: ${txResponse.status}`);
    }
  } catch (err: any) {
    throw new Error(parseContractError(err, 'complete'));
  }
}

export async function cancelBooking(signerPublicKey: string, bookingId: string) {
  if (!isContractIdValid()) throw new Error("CyberSeat contract ID is missing");

  try {
    const account = await server.getAccount(signerPublicKey);
    const contract = new Contract(ENV.CYBERSEAT_CONTRACT_ID!);

    const args = [
      nativeToScVal(BigInt(bookingId), { type: 'u64' }),
    ];

    const callTx = contract.call('cancel_booking', ...args);

    let tx = new TransactionBuilder(account, {
      fee: '100000',
      networkPassphrase: NETWORK_PASSPHRASE,
    })
      .addOperation(callTx)
      .setTimeout(30)
      .build();

    const preparedTx = await server.prepareTransaction(tx);
    const signedXdr = await signTx(preparedTx.toXDR(), NETWORK_PASSPHRASE);
    
    const signedTx = TransactionBuilder.fromXDR(signedXdr, NETWORK_PASSPHRASE);
    const result = await server.sendTransaction(signedTx as any);
    
    if (result.status !== 'PENDING') {
      throw new Error(`Failed to send tx: ${result.status}`);
    }

    let txResponse = await server.getTransaction(result.hash);
    let retries = 0;
    while (txResponse.status === 'NOT_FOUND' && retries < 15) {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      txResponse = await server.getTransaction(result.hash);
      retries++;
    }

    if (txResponse.status === 'SUCCESS') {
      return { success: true, hash: result.hash };
    } else {
      throw new Error(`Tx failed: ${txResponse.status}`);
    }
  } catch (err: any) {
    throw new Error(parseContractError(err, 'refund'));
  }
}
