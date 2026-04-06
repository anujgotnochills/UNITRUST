# UniTrust Backend & Blockchain Verification Plan

Since another team member is handling the frontend, we will focus entirely on **Packages/Contracts**, **Apps/Backend**, and **Packages/Shared**. This plan is broken down into distinct, testable phases. By validating one phase at a time, we ensure the foundation is completely solid before moving to the next.

## User Review Required

> [!NOTE]
> Please review this phased approach. If the sequence alignments match your testing strategy, you can approve it! Once approved, we will begin executing Phase 1 together. We can use the terminal to run tests, Postman/curl for APIs, and scripts for blockchain interactions.

## Phase 1: Smart Contracts Local Validation
**Goal:** Prove the Solidity contracts execute correctly in an isolated local environment before deploying to Testnet.
* **1.1 Compile Contracts:** Run Hardhat compilation to ensure there are no syntax or compiler errors for `ProductNFT.sol` and `CertificateNFT.sol`.
* **1.2 Test ProductNFT:** Execute local tests verifying ERC-721 functionality, MINTER_ROLE constraints, the on-chain `transferHistory` array, and standard metadata URI storage.
* **1.3 Test CertificateNFT:** Execute local tests verifying Soulbound constraints (reverting on `transferFrom`), ISSUER_ROLE assignments, and the `requestId` linkage mapping.

## Phase 2: Blockchain Deployment & Testnet Integration
**Goal:** Deploy to Polygon Amoy Testnet, configure roles, and export addresses for the backend.
* **2.1 Deployment:** Run `scripts/deploy.ts` against the Amoy testnet.
* **2.2 Configuration Map:** Update `packages/config/addresses.ts` and the Backend `.env` with the newly deployed contract addresses.
* **2.3 Role Assignment:** Execute `scripts/grantRoles.ts` to explicitly grant `MINTER_ROLE` and `ISSUER_ROLE` to the backend execution wallet.
* **2.4 Etherscan/Polygonscan Verification:** Run `scripts/verify.ts` to make the contract source public and readable on the blockchain explorer.

## Phase 3: Backend Database & Profile Setup
**Goal:** Ensure the backend successfully connects to MongoDB and handles foundational REST API routes.
* **3.1 DB Connection:** Boot up the Node.js server and verify the Mongoose connection to your MongoDB instance.
* **3.2 User Profiles:** Test `POST` and `GET` for `/api/profiles/user` via curl/Postman to ensure wallet addresses correctly map to names/avatars.
* **3.3 Institute Profiles:** Test `/api/profiles/institute` mimicking the first-time login of an institute capturing their logo and details.

## Phase 4: IPFS (Pinata) & Metadata Engine
**Goal:** Verify off-chain asset storage and proper ERC-721 metadata composition.
* **4.1 File Uploads:** Mock a PDF/Image upload to `/api/ipfs/upload-file` and verify the `ipfs://` CID returns correctly.
* **4.2 Metadata Construction:** Test `/api/ipfs/upload-metadata`. This ensures the backend `metadataBuilder` correctly processes standard strings, appends the dynamically calculated **Carbon Store / Sustainability Tag**, and formats as standard ERC-721 JSON.

## Phase 5: Off-Chain Request State Machine
**Goal:** Test the "Institute Request -> User Accept -> Institute Mint" workflow natively in the backend database.
* **5.1 Create Request:** Attempt a `POST /api/requests/create` simulating an Institute attempting to issue a cert. Assert status is `pending`.
* **5.2 Accept/Reject Mutation:** Hit the `/api/requests/:requestId/accept` endpoint and verify the status shifts correctly.
* **5.3 Asset Data Modeling:** Verify the `/api/assets/record` endpoints register off-chain records successfully.

## Phase 6: Sync Layer & Event Listeners
**Goal:** Verify the backend tracks the blockchain in real-time.
* **6.1 Event Listeners Boot-Up:** Ensure `events/assetEventListener.ts` and `events/certificateEventListener.ts` boot up and connect via the Alchemy RPC provider securely.
* **6.2 Sync Trigger Test:** Mint an asset (via a hardhat script directly on Testnet) and watch the backend console. The listener should catch `AssetMinted` and automatically insert the `AssetRecord` into MongoDB, removing the need for trusting the frontend.

## Phase 7: End-to-End API Integration Wrap
**Goal:** Verify the combined flows using Biconomy / Wallet simulated transactions entirely from backend inputs.
* We will establish mock payloads or use internal backend scripts to simulate the end-user wallet signing data so we are 100% ready for the Frontend team to simply plug in their Hooks.
