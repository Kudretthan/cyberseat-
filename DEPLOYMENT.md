# Deployment Guide for CyberSeat

Follow these steps to deploy the CyberSeat escrow contract and start the frontend.

### 1. Build Contract
```bash
cd cyberseat/contracts/cyberseat_escrow
stellar contract build
```

### 2. Deploy Contract
```bash
stellar contract deploy \
  --wasm target/wasm32v1-none/release/cyberseat_escrow.wasm \
  --source proofwitness \
  --network testnet
```
*Note: Copy the contract ID returned by this command.*

### 3. Initialize Contract
Run the `init` function once to set the admin (cafe) and XLM token contract:
```bash
stellar contract invoke \
  --id <NEW_CONTRACT_ID> \
  --source proofwitness \
  --network testnet \
  -- init \
  --admin GAKCKLXUOMY4CA7444ALGWFHTCH4LOGIMNLBLERCO4YA2ARJE7STQPW4 \
  --xlm_token CDLZFC3SYJYDZT7K67VZ75HPJVIEUVNIXF47ZG2FB2RMQQVU2HHGCYSC
```

### 4. Set Frontend Environment
Update `cyberseat/frontend/.env`:
```env
VITE_CYBERSEAT_CONTRACT_ID=<NEW_CONTRACT_ID>
VITE_CAFE_WALLET_ADDRESS=GAKCKLXUOMY4CA7444ALGWFHTCH4LOGIMNLBLERCO4YA2ARJE7STQPW4
```

### 5. Run Frontend
```bash
cd cyberseat/frontend
npm install
npm run dev
```

### 6. Build Frontend
```bash
npm run build
```

---

### Troubleshooting

- **Contract ID missing**:
  `VITE_CYBERSEAT_CONTRACT_ID` is empty or a placeholder.
  *Fix*: Deploy contract, copy contract ID, update `.env`, restart frontend.

- **Contract not initialized**:
  `init` was not called for the new contract.
  *Fix*: Run `stellar contract invoke init`.

- **txBadAuth**:
  Wrong wallet is signing the action.
  *Fix*: 
  - Customer wallet creates/refunds.
  - Cafe wallet completes.

- **UnreachableCodeReached / InvalidAction**:
  Usually old contract, missing `init`, or contract panic.
  *Fix*: Rebuild/redeploy contract and update frontend contract ID.

- **Payment does not arrive at cafe wallet**:
  - Check if the connected wallet is the cafe wallet for Complete.
  - Ensure `VITE_CAFE_WALLET_ADDRESS` is correct.
  - Verify if the complete transaction succeeded via its transaction hash.

---

### Authority Summary
- **Create**: Customer signs. XLM moves from Customer -> Contract.
- **Complete**: Cafe signs. XLM moves from Contract -> Cafe.
- **Refund**: Customer signs. XLM moves from Contract -> Customer.

> [!IMPORTANT]
> If you mention transactions in any documentation, use only the transaction hashes. Do not include clickable links or Stellar Expert URLs.
