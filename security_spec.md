# Security Specification

## 1. Data Invariants
1. **Identity Isolation**: A user can ONLY read, create, update, or delete their own transactions where `userId == request.auth.uid`. No user may access another user's financial records.
2. **User Profile Ownership**: A user document at `/users/{userId}` can only be accessed or modified by `request.auth.uid == userId`.
3. **Immutability of Key Identifiers**: In `/transactions/{transactionId}`, the `id`, `userId`, and `createdAt` cannot be modified after creation.
4. **Validation Blueprints**:
   - `amount` must be a positive number (`> 0`).
   - `type` must strictly be either `'income'` or `'expense'`.
   - `category`, `title`, and `date` must be valid bounded strings (`date` matches YYYY-MM-DD format).
   - Document IDs must satisfy `isValidId()`.
5. **Secure Queries**: `allow list` explicitly validates `resource.data.userId == request.auth.uid` to prevent unauthorized query scraping.

## 2. The Dirty Dozen Payloads (Designed to be REJECTED with PERMISSION_DENIED)
1. **Unauthenticated Read**: Attempting to read `/transactions/tx123` without authentication.
2. **Unauthenticated Write**: Attempting to create a transaction without signing in.
3. **Cross-User Snooping**: User A attempting to read User B's transaction in `/transactions/tx_user_b`.
4. **Cross-User Spoofing Write**: User A attempting to insert a transaction with `userId: 'userB'`.
5. **Cross-User List Query**: User A trying to query all transactions without filtering by `userId == 'userA'`.
6. **Cross-User Delete**: User A attempting to delete User B's transaction.
7. **Negative or Zero Amount**: User attempting to create a transaction with `amount: -500` or `amount: 0`.
8. **Invalid Transaction Type**: User attempting to create a transaction with `type: 'investment_arbitrary'`.
9. **Shadow Field Injection**: User injecting unknown field `{ secretRole: 'admin' }` into a transaction payload.
10. **ID Poisoning Attack**: User creating a transaction with an invalid document ID containing path traversal characters (`../../etc/passwd`).
11. **Immutability Tampering**: User updating a transaction trying to change `userId` or `createdAt`.
12. **Cross-User Profile Hijack**: User A attempting to write to `/users/{userB}`.
