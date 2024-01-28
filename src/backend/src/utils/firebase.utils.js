const admin = require("firebase-admin");
const { loadDotenv } = require("./utils");
loadDotenv();

class FirestoreSDK {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      ),
    });

    this.db = admin.firestore();
  }

  /**
   * Creates a document in the Firestore database
   *
   * @param collection the collection to add the document to
   * @param id the id of the document to be created
   * @param document the document
   */
  async createDocument(collection, id, document) {
    const docRef = this.db.collection(collection).doc(id);

    return new Promise((resolve, reject) => {
      docRef
        .set(document)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Gets a document in the Firestore database
   *
   * @param collection the collection to get the document from
   * @param id the id of the document to get
   * @returns the returned document, or null if it doesn't exist
   */
  async getDocument(collection, id) {
    const docRef = this.db.collection(collection).doc(id);

    return new Promise((resolve, reject) => {
      docRef
        .get()
        .then((doc) => {
          if (doc.exists) {
            resolve(doc.data());
          } else {
            resolve(null);
          }
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Updates a document in the Firestore database
   *
   * @param collection the collection of the document to update
   * @param id the id of the document to update
   * @param newDocument the new document
   */
  async updateDocument(collection, id, newDocument) {
    const docRef = this.db.collection(collection).doc(id);

    return new Promise((resolve, reject) => {
      docRef
        .update(newDocument)
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Deletes a document in the Firestore database
   *
   * @param collection the collection of the document to delete
   * @param id the id of the document to delete
   */
  async deleteDocument(collection, id) {
    const docRef = this.db.collection(collection).doc(id);

    return new Promise((resolve, reject) => {
      docRef
        .delete()
        .then(() => {
          resolve();
        })
        .catch((error) => {
          reject(error);
        });
    });
  }

  /**
   * Gets all the documents in a collection in the Firestore database
   *
   * @param collection the collection to get all the documents from
   * @param filter a search filter
   * @returns the documents that meet the criteria of the filter
   */
  async getAllDocuments(collection, filter) {
    return new Promise(async (resolve, reject) => {
      const querySnapshot = await this.db.collection(collection).get();
      const documents = [];

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
      resolve(documents);
    });
  }

  /**
   * Gets the last document of a collection in the Firestore database
   *
   * @param collection the collection to get the last document of
   * @returns the last document of the collection, or null if it doesn't exist
   */
  async getLastDocument(collection) {
    return new Promise(async (resolve, reject) => {
      const querySnapshot = await this.db
        .collection(collection)
        .orderBy("createdAt", "desc")
        .limit(1)
        .get();

      if (querySnapshot.empty) {
        resolve(null);
      } else {
        const lastDocument = querySnapshot.docs[0];
        resolve({ id: lastDocument.id, data: lastDocument.data() });
      }
    });
  }
}

const db = new FirestoreSDK();
module.exports = db;
