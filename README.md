# KraftPay


## 🚀 Goal

Create a user-centric crypto wallet app (like GPay) where:

* Users can send money to a username or phone number.
* Wallet balance is hidden by default and revealed with passcode.
* Phonebook-like contact system.
* All powered by the blockchain (e.g., Solana, Ethereum, or layer 2).

---

## 🔑 Core Features (GPay-Like Enhancements)

### 1. 🔗 **Identity Layer**

* **@usernames**: Map public wallet addresses to human-friendly usernames (`@rahul123`).
* **Phonebook Sync**: Import contacts, find friends already using the wallet.
* **Phone/email as ID (optional)**: Use a centralized directory or ENS-like system for name resolution.

### 2. 💸 **Send & Receive UX**

* **Send to username/phone/email** instead of address.
* Show recent people/contact history.
* Option to scan QR codes as a fallback.

### 3. 🕵️‍♂️ **Privacy Controls**

* **Hide Balance** by default.
* Add **Passcode/Digits/Fingerprint** to view balance (like GPay's 4-digit PIN).
* Hide transaction history until authenticated.

### 4. 🛡️ **Security**

* 4/6-digit App PIN to view balance or send funds.
* Biometric unlock (optional).
* Encrypted local storage for private keys (or use MPC/social recovery).

---

## 🖌️ UI/UX Plan

| Page                | Description                                               |
| ------------------- | --------------------------------------------------------- |
| **Home**            | Recent transactions + contacts, balance section (blurred) |
| **Balance Section** | Taps ask for PIN to reveal, with "Hide again" option      |
| **Send Money**      | Input field for `@username`, phone, or address + amount   |
| **Contacts Tab**    | Imported phonebook with tags: "On Wallet", "Invite"       |
| **Activity Tab**    | Sent/received list, locked until PIN entry                |
| **Profile**         | Set username, phone/email, backup keys, security settings |

---

## 🔧 Backend & Infrastructure

### 1. **Directory Service** (Mapping IDs)

* PostgreSQL/Redis to map:

  * `@username` ➝ wallet address
  * phone/email ➝ wallet address (encrypted)
* Ensure username uniqueness via on-chain (ENS/Bonfida-style naming service) or backend checks.

### 2. **Contact Sync**

* Optional upload phonebook hashes to backend.
* Match against database (hashed phone numbers).
* Return matches with user profiles.

### 3. **Balance Hiding Logic**

* Wallet balance is fetched only **after user unlocks** with app PIN.
* Store balance off-chain temporarily or use wallet adapters for live fetch.

---

## 🔐 Security Plan

| Feature                    | Description                                       |
| -------------------------- | ------------------------------------------------- |
| **App PIN**                | 4-6 digits required to view balance/send money    |
| **Biometric Auth**         | Optional fingerprint/FaceID                       |
| **Encrypted Storage**      | Use Secure Enclave/Keystore for private keys      |
| **Social Recovery**        | Guardians or email-based recovery option          |
| **MPC Support (Optional)** | Use Web3Auth or Lit Protocol for login + recovery |

---

## ⚙️ Tech Stack (Suggested)

### Frontend

* React Native or Flutter
* ShadCN for styling (if web-based)
* Expo + SecureStore/Keychain for storage

### Backend

* Node.js + PostgreSQL/Redis
* Phonebook matching service
* Directory service API
* Firebase/OTP service for phone verification

### Blockchain

* Solana/Ethereum/Polygon (via wallet adapters)
* Optional: Use AA (Account Abstraction) wallets for better UX
* ENS/Bonfida for usernames

---

## 📈 Future Ideas

* 🧾 **Request Money** from contacts
* 🎁 **Gift Cards** or tokens
* 🪙 **Stablecoin Support** for everyday use
* 🧠 **AI Chatbot** to help send/receive money
* 📥 **Mini statement** like SMS alerts for transactions

---

## ✅ MVP Checklist

| Feature                            | Status |
| ---------------------------------- | ------ |
| User registration with phone/email | ☐      |
| Username/handle system             | ☐      |
| PIN lock to view balance           | ☐      |
| Send money to contact/username     | ☐      |
| Phonebook sync and match           | ☐      |
| Transaction history (locked)       | ☐      |
| Secure key storage                 | ☐      |

