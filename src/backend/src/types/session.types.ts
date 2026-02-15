/**
 * Session data stored in both Redis and Firestore
 */
export interface SessionData {
  sessionId: string;
  userId: string; // Google sub claim
  email: string;
  name: string;
  googleRefreshToken: string; // Encrypted
  createdAt: Date;
  expiresAt: Date;
  lastAccessed: Date;
}

/**
 * Session data as stored in Firestore (with serialized dates)
 */
export interface FirestoreSessionData {
  sessionId: string;
  userId: string;
  email: string;
  name: string;
  googleRefreshToken: string; // Encrypted
  createdAt: string; // ISO timestamp
  expiresAt: string; // ISO timestamp
  lastAccessed: string; // ISO timestamp
}

/**
 * User identity extracted from ID token
 */
export interface UserIdentity {
  sub: string; // Google user ID
  email: string;
  name: string;
  email_verified?: boolean;
}

/**
 * OIDC flow state stored temporarily in Redis
 */
export interface OIDCFlowState {
  state: string;
  nonce: string;
  createdAt: string;
}
