# xStream - Decentralized Video Streaming Platform

<div align="center">

![xStream Logo](https://img.shields.io/badge/xStream-Stream.Build.Earn-blueviolet?style=for-the-badge)

**Pay-per-second video streaming on Base • Up to 100% creator revenue • Instant blockchain settlements**

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Base](https://img.shields.io/badge/Base-Sepolia-0052FF?style=flat-square&logo=coinbase)](https://base.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Prisma](https://img.shields.io/badge/Prisma-5.0-2D3748?style=flat-square&logo=prisma)](https://www.prisma.io/)

[Demo Video](https://www.youtube.com/watch?v=VDGrd6wK83o) • [Live Demo](https://xstream.fildos.cloud/) • [GitHub](https://github.com/imApoorva36/xstream)

</div>

---

## 🎯 Overview

xStream is a **decentralized video streaming platform** that revolutionizes content monetization through **precise per-second payments**. Built on Base blockchain, it enables creators to earn **up to 100% of revenue** with **instant on-chain settlements** powered by Coinbase CDP AgentKit.

### 🌟 Key Features

- **⚡ Pay-Per-Second Streaming** - Viewers pay only for seconds watched, nothing wasted
- **💯 Up to 100% Creator Revenue** - Zero platform fees, earnings go directly to creators
- **🚀 Instant Settlements** - Automated blockchain payouts via CDP AgentKit MPC wallet
- **🔄 Automatic Refunds** - Unused video time automatically credited back to viewers
- **💳 Gasless Payments** - x402 protocol for frictionless USDC deposits
- **🎨 Adaptive Streaming** - HLS with multiple quality levels (1080p/720p/480p)
- **🔗 Base Blockchain** - Fast, cheap transactions on Ethereum L2

---

## 🏗️ Architecture

### Tech Stack

| Layer          | Technology                                    |
| -------------- | --------------------------------------------- |
| **Frontend**   | Next.js 15, React 19, TypeScript, TailwindCSS |
| **Backend**    | Next.js API Routes, Prisma ORM                |
| **Database**   | PostgreSQL (Prisma Accelerate)                |
| **Blockchain** | Base Sepolia, OnchainKit, RainbowKit          |
| **Payments**   | x402 Protocol (USDC), CDP AgentKit            |
| **Video**      | FFmpeg, HLS/DASH, AWS S3                      |
| **Auth**       | Wallet-based (MetaMask, Coinbase Wallet)      |

### System Architecture Diagram

<!-- Add your architecture diagram image here -->

<img width="948" height="526" alt="xstream drawio" src="https://github.com/user-attachments/assets/3bf70506-16f9-4466-a004-591f76c24897" />




---

## 🚀 Getting Started

### Prerequisites

- Node.js 18+ and npm/yarn
- PostgreSQL database
- Coinbase Developer Platform account
- Base Sepolia testnet wallet

### Installation

```bash
# Clone the repository
git clone https://github.com/imApoorva36/xstream.git
cd xstream/web-app

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
```

### Environment Variables

Create `.env.local` with the following:

```bash
# Database (Prisma Accelerate URL)
DATABASE_URL="prisma+postgres://accelerate.prisma-data.net/?api_key=YOUR_KEY"

# Coinbase Developer Platform
CDP_API_KEY_NAME="organizations/{org_id}/apiKeys/{key_id}"
CDP_API_KEY_PRIVATE_KEY="-----BEGIN EC PRIVATE KEY-----\n...\n-----END EC PRIVATE KEY-----\n"
CDP_WALLET_SECRET="your-wallet-secret"
NETWORK_ID="base-sepolia"

# OnchainKit
NEXT_PUBLIC_ONCHAINKIT_API_KEY="your-onchainkit-api-key"

# AWS S3 (for video storage)
AWS_ACCESS_KEY_ID="your-aws-key"
AWS_SECRET_ACCESS_KEY="your-aws-secret"
AWS_REGION="us-east-1"
AWS_S3_BUCKET="xstream-videos"
```

### Database Setup

```bash
# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed demo data
npx tsx scripts/seed-platform.ts
```

### Run Development Server

```bash
npm run dev
```

Visit `http://localhost:3000` or the live demo at [https://xstream.fildos.cloud/](https://xstream.fildos.cloud/) 🎉

---

## 📖 Core Features

### 1. **Per-Second Video Charging**

```typescript
// Real-time charging every second
setInterval(() => {
  const secondsWatched = videoElement.currentTime - startTime;
  const cost = pricePerSecond * secondsWatched;

  // Update viewer balance
  await updateBalance(viewerId, -cost);

  // Credit creator earnings
  await updateEarnings(creatorId, cost);
}, 1000);
```

**Features:**

- Automatic staking of full video cost upfront
- Real-time balance deduction every second
- Instant refund of unwatched portions on pause/exit
- Sub-cent precision with 6 decimal USDC

### 2. **Instant Creator Settlements**

```typescript
// Automated settlement via CDP AgentKit
const txHash = await settlementAgent.sendSettlement(
  creatorWallet,
  availableEarnings
);

// On-chain USDC transfer in 5-30 seconds
// Verifiable on BaseScan
```

**Settlement Flow:**

1. Creator requests withdrawal (any amount, no minimum temporarily)
2. System validates available earnings
3. CDP MPC wallet executes USDC transfer
4. Transaction hash returned immediately
5. Settlement marked complete in database

### 3. **x402 Gasless Deposits**

Viewers deposit USDC without paying gas fees using x402 protocol:

- Sign EIP-712 message (no gas)
- Platform verifies signature
- USDC transferred via permit
- Internal balance updated

### 4. **Adaptive Video Streaming**

FFmpeg transcodes uploaded videos into:

- **1080p** (5000 kbps) - Premium quality
- **720p** (2500 kbps) - Standard quality
- **480p** (1000 kbps) - Mobile quality

HLS manifest allows seamless quality switching based on bandwidth.

---

## 💰 Revenue Model

| Stakeholder  | Share          | Notes                                              |
| ------------ | -------------- | -------------------------------------------------- |
| **Creator**  | Up to 100%     | Earnings go directly to content creator            |
| **Platform** | 0%             | No fees (future: optional 5% for premium features) |
| **Viewer**   | Pay-per-second | $0.01 - $0.15/second based on content              |

**Example Earnings:**

- 10-minute tutorial @ $0.08/second
- 10,000 views with 70% avg watch rate
- Earnings: `600 seconds × $0.08 × 10,000 × 0.7 = $336,000`

---

## 🗄️ Database Schema

```prisma
model User {
  id            String   @id @default(cuid())
  walletAddress String   @unique
  walletBalance Decimal  @default(0)
  username      String?
  displayName   String?
  profileImage  String?
  videos        Video[]
  viewSessions  ViewSession[]
  settlements   Settlement[]
}

model Video {
  id              String   @id @default(cuid())
  creatorWallet   String
  title           String
  description     String?
  duration        Int      // seconds
  pricePerSecond  Decimal
  totalViews      Int      @default(0)
  totalWatchTime  Int      @default(0)
  totalEarnings   Decimal  @default(0)
  videoUrl        String
  thumbnailUrl    String?
  category        String?
  creator         User     @relation(fields: [creatorWallet], references: [walletAddress])
}

model Settlement {
  id           String   @id @default(cuid())
  creatorId    String
  amount       Decimal
  status       String   // PENDING | PROCESSING | COMPLETED | FAILED
  txHash       String?  // Blockchain transaction hash
  requestedAt  DateTime @default(now())
  completedAt  DateTime?
  creator      User     @relation(fields: [creatorId], references: [id])
}
```

---

## 🎬 Demo Data

Seeded platform includes:

- **6 creators** with realistic profiles
- **20 videos** across 5 categories (Technology, Education, Creator Economy, Tutorials, Community)
- **545K+ views** with realistic engagement metrics
- **$15M+ in earnings** demonstrating pricing diversity ($0.01 - $0.15/sec)
- **Professional thumbnails** from Unsplash
- **Sample videos** from Google's test bucket

---

## 🔧 Scripts

```bash
# Seed demo data
npx tsx scripts/seed-platform.ts

# Test settlement agent
npx tsx scripts/test-settlement-agent.ts

# Test real blockchain payout
npx tsx scripts/test-real-payout.ts

# Database migration
npx tsx scripts/migrate-settlements.ts
```

---

## 🧪 Testing

### Manual Test Flow

1. **Connect Wallet** → RainbowKit modal with MetaMask/Coinbase Wallet
2. **Deposit USDC** → x402 gasless deposit via `/api/wallet/deposit`
3. **Browse Videos** → Filter by category, search, sort
4. **Watch Video** → Authorize payment, real-time charging
5. **Check Balance** → Profile page shows deposits, spent, earnings
6. **Request Withdrawal** → Instant settlement via CDP AgentKit
7. **Verify on BaseScan** → Check transaction hash on Base Sepolia

---

## 🚧 Roadmap

### Phase 1 - MVP (Current)

- [x] Per-second video charging
- [x] CDP AgentKit settlements
- [x] x402 gasless deposits
- [x] Adaptive HLS streaming
- [x] Creator analytics

### Phase 2 - Growth

- [ ] Mainnet deployment (Base)
- [ ] NFT rewards for watch milestones
- [ ] Multi-creator revenue splits
- [ ] Live streaming support
- [ ] Mobile app (React Native)

### Phase 3 - Scale

- [ ] Decentralized storage (IPFS/Arweave)
- [ ] Cross-chain support
- [ ] Creator DAOs
- [ ] Subscription bundles
- [ ] Ad-free premium tier

---

## 🔮 Future Enhancements

### Quality-Based Pricing Algorithm

**Adaptive Bitrate Charging Model:**

Creators set a base price per second for the highest quality (e.g., 1080p @ $0.01/sec). Lower qualities are automatically priced proportionally:

**Example:** 10-minute video at $0.01/sec for 1080p

- **1080p**: 600 sec × $0.01 = **$6.00**
- **720p**: 600 sec × (720/1080) × $0.01 = **$4.00**
- **480p**: 600 sec × (480/1080) × $0.01 = **$2.67**
- **240p**: 600 sec × (240/1080) × $0.01 = **$1.33**
- **144p**: 600 sec × (144/1080) × $0.01 = **$0.80**

**Adaptive Streaming Cost Example (1 minute watch):**

| Time Range | Quality | Cost Calculation | Segment Cost |
| ---------- | ------- | ---------------- | ------------ |
| 0-15 sec   | 1080p   | 15 × $0.01       | $0.15        |
| 15-45 sec  | 480p    | 30 × $0.00444    | $0.13        |
| 45-60 sec  | 720p    | 15 × $0.00667    | $0.10        |
| **Total**  |         |                  | **$0.38**    |

User is staked $6.00 (max cost), watches for $0.38, receives $5.62 refund automatically.

---

### NFT Milestone Rewards

**Viewer NFTs:**

- 🎥 **Watch Time Milestones**: 10 mins, 50 mins, 100 mins, 500 mins, 1000 mins...
- 💰 **Spending Milestones**: $1, $3, $5, $10, $30, $50, $100...
- 📺 **Videos Watched**: 1, 3, 5, 10, 30, 50, 100 videos...

**Creator NFTs:**

- 🎬 **Upload Time Milestones**: 10 mins, 50 mins, 100 mins, 500 mins uploaded...
- 💵 **Earnings Milestones**: $1, $3, $5, $10, $30, $50, $100 earned...
- 📤 **Videos Uploaded**: 1, 3, 5, 10, 30, 50, 100 videos uploaded...

Each NFT minted on Base as a soulbound token, representing user achievements and platform loyalty.

---

### Ad Integration (Future)

**Fair Ad Distribution:**

- Platform evenly picks ads from available ad pool
- Ads shown before/during video playback
- Track ad engagement metrics:
  - Number of ads skipped
  - Number of ads fully watched
  - Click-through rates
- Revenue split between creator, platform, and viewer (watch-to-earn)

---

## 👥 Team

Built with passion by:

- **Apoorva Agrawal**
- **Fahim Ahmed**
- **Vedant Tarale**
- **Abhishek Satpathy**
- **Chinmaya Sahu**

---

## 🙏 Acknowledgments

- **Base** - Fast, cheap Ethereum L2
- **Coinbase Developer Platform** - CDP AgentKit for settlements
- **OnchainKit** - Wallet integration and Base utilities
- **Prisma** - Type-safe database ORM
- **RainbowKit** - Beautiful wallet connection UI
- **x402 Protocol** - Gasless USDC payments

---

<div align="center">

**Built with ❤️ for Base Batches Builder Track 2025**

**Live Demo:** [xstream.fildos.cloud](https://xstream.fildos.cloud/)

**Demo Video:** [Watch on YouTube](https://www.youtube.com/watch?v=VDGrd6wK83o)

**GitHub:** [github.com/imApoorva36/xstream](https://github.com/imApoorva36/xstream)

[⬆ Back to Top](#xstream---decentralized-video-streaming-platform)

</div>
