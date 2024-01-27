const admin = require("firebase-admin");
require("dotenv").config();

class FirestoreDB {
  constructor() {
    admin.initializeApp({
      credential: admin.credential.cert(
        JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_KEY)
      ),
    });

    this.db = admin.firestore();
  }

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

const FirestoreSDK = new FirestoreDB();
module.exports = FirestoreSDK;
