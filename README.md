# ChainRent
Secure Rental Agreements. Trustless Deposits.

**[Watch the Stellar Demo Video]( )**

## Problem Statement

Rental agreements often suffer from security deposit disputes, delayed settlements, and a lack of transparency between landlords and tenants.

Traditional systems rely on trust, making it difficult to fairly manage deposits and lease obligations.

## Solution

ChainRent is a Stellar-powered rental management platform that uses Soroban Smart Contracts to automate lease agreements, secure security deposits in escrow, track rent payments, and maintain trust scores for landlords and tenants.

## Key Features

- Freighter Wallet Integration
- Soroban Smart Contracts
- Lease Management
- Security Deposit Escrow
- Automated Rent Payments
- Reputation & Trust Scores
- Real-Time Event Tracking
- Transaction History
- Responsive Dashboard
- CI/CD Pipeline

## Tech Stack

### Frontend

- React
- TypeScript
- TailwindCSS
- Vite
- Framer Motion

### Blockchain

- Stellar SDK
- Soroban Smart Contracts
- Horizon API
- Freighter Wallet

### Smart Contracts

- Rust
- Soroban SDK v22

### DevOps

- GitHub Actions
- Vercel

## Architecture

```mermaid
flowchart TD

User["Tenant / Landlord"]

Frontend["ChainRent Frontend
React + TypeScript"]

Wallet["Freighter Wallet"]

Lease["Lease Contract"]

Escrow["Escrow Contract"]

Reputation["Reputation Contract"]

Stellar["Stellar Network"]

User --> Frontend
Frontend --> Wallet
Wallet --> Lease
Lease --> Escrow
Escrow --> Reputation

Lease --> Stellar
Escrow --> Stellar
Reputation --> Stellar
```

## User Flow

Connect Wallet

→ Create Property

→ Create Lease

→ Lock Deposit

→ Pay Rent

→ Release Deposit

→ Update Reputation

## Smart Contracts

### Lease Contract

- Create Lease
- Approve Lease
- Terminate Lease

### Escrow Contract

- Lock Deposit
- Release Deposit
- Refund Deposit

### Reputation Contract

- Update Trust Score
- Track Lease Completion
- Maintain Reputation Records

## Screenshots

### Landing Page

<img width="1900" height="929" alt="image" src="https://github.com/user-attachments/assets/908b333f-8ec2-4953-9f4a-2b65f84c1c14" />

### Dashboard

<img width="1919" height="930" alt="image" src="https://github.com/user-attachments/assets/acadc539-492d-4e05-93ed-324bd7a350a0" />

### Lease Management

<img width="1918" height="939" alt="image" src="https://github.com/user-attachments/assets/37f2fb26-eb38-4e48-9a6c-02f95f765e4e" />

### Escrow System

<img width="1919" height="937" alt="image" src="https://github.com/user-attachments/assets/9e2695e0-544c-4d0f-a917-55dcdbca0719" />


### Mobile UI

<img width="380" height="823" alt="image" src="https://github.com/user-attachments/assets/74c10272-653d-43cb-b1de-f2123343d2bd" />


### CI/CD

<img width="1918" height="973" alt="image" src="https://github.com/user-attachments/assets/5a22530c-debe-4f52-873c-ef630169ae49" />


## Stellar Level 3 Requirements

- ✅ Advanced Smart Contracts
- ✅ Inter-Contract Communication
- ✅ Event Streaming
- ✅ Mobile Responsive UI
- ✅ Testing
- ✅ CI/CD Pipeline
- ✅ Production Architecture
- ✅ Documentation

## Setup

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```


Built on Stellar & Soroban.
