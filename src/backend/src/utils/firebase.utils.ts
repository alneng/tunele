import admin from "firebase-admin";
import { FIREBASE_SERVICE_ACCOUNT_KEY } from "../config";

class FirestoreSDK {
  private db: admin.firestore.Firestore;

  constructor() {
    // For running tests, if there are no credentials, skip creating the firestore instance, as it will be mocked by jest
    if (FIREBASE_SERVICE_ACCOUNT_KEY) {
      admin.initializeApp({
        credential: admin.credential.cert(
          JSON.parse(FIREBASE_SERVICE_ACCOUNT_KEY)
        ),
      });
      this.db = admin.firestore();
    }
  }

  /**
   * Creates a document in the Firestore database
   *
   * @param collection the collection to add the document to
   * @param id the id of the document to be created
   * @param document the document
   */
  async createDocument(
    collection: string,
    id: string,
    document: object
  ): Promise<void> {
    const docRef = this.db.collection(collection).doc(id);

    await docRef.set(document);
  }

  /**
   * Gets a document in the Firestore database
   *
   * @param collection the collection to get the document from
   * @param id the id of the document to get
   * @returns the returned document, or null if it doesn't exist
   */
  async getDocument<T = object>(
    collection: string,
    id: string
  ): Promise<T | null> {
    const docRef = this.db.collection(collection).doc(id);
    const doc = await docRef.get();

    if (doc.exists) {
      return doc.data() as T;
    } else {
      return null;
    }
  }

  /**
   * Updates a document in the Firestore database
   *
   * @param collection the collection of the document to update
   * @param id the id of the document to update
   * @param newDocument the new document
   */
  async updateDocument(
    collection: string,
    id: string,
    newDocument: object
  ): Promise<void> {
    const docRef = this.db.collection(collection).doc(id);

    await docRef.update(newDocument);
  }

  /**
   * Deletes a document in the Firestore database
   *
   * @param collection the collection of the document to delete
   * @param id the id of the document to delete
   */
  async deleteDocument(collection: string, id: string): Promise<void> {
    const docRef = this.db.collection(collection).doc(id);

    await docRef.delete();
  }

  /**
   * Gets all the documents in a collection in the Firestore database
   *
   * @param collection the collection to get all the documents from
   * @param filter a search filter
   * @returns the documents that meet the criteria of the filter
   */
  async getAllDocuments<T = object>(
    collection: string,
    filter?: Record<string, object>
  ): Promise<T | null> {
    const querySnapshot = await this.db.collection(collection).get();
    const documents: object[] = [];

    querySnapshot.forEach((doc) => {
      const data = doc.data();
      let includeDocument = true;
      if (filter) {
        Object.entries(filter).forEach(([key, value]) => {
          if (data[key] !== value) {
            includeDocument = false;
          }
        });
      }
      if (includeDocument) {
        documents.push({ id: doc.id, data: data });
      }
    });

    return documents as T;
  }

  /**
   * Gets the last document of a collection in the Firestore database
   *
   * @param collection the collection to get the last document of
   * @returns the last document of the collection, or null if it doesn't exist
   */
  async getLastDocument<T = object>(collection: string): Promise<T | null> {
    const querySnapshot = await this.db
      .collection(collection)
      .orderBy("createdAt", "desc")
      .limit(1)
      .get();

    if (querySnapshot.empty) {
      return null;
    } else {
      const lastDocument = querySnapshot.docs[0];
      return { id: lastDocument.id, data: lastDocument.data() } as T;
    }
  }
}

const db = new FirestoreSDK();
export default db;
