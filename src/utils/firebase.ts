import admin from "firebase-admin";
import {env} from "~/env.mjs";
import {Auth, google} from "googleapis";

let firebase: admin.app.App;

if (admin.apps.length === 0) {
  firebase = admin.initializeApp({
    credential: admin.credential.cert({
      projectId: 'tldr-newsletter-bundler',
      clientEmail: env.FIREBASE_CLIENT_EMAIL,
      privateKey: env.FIREBASE_PRIVATE_KEY,
    }),
    databaseURL: 'https://tldr-newsletter-bundler.firebaseio.com'
  });
} else {
  firebase = admin.app();
}

const db = firebase.firestore();

const authJSON = {
  type: "authorized_user",
  client_id: env.GOOGLE_CLIENT_ID,
  client_secret: env.GOOGLE_CLIENT_SECRET,
  refresh_token: env.GOOGLE_REFRESH_TOKEN,
}
const auth = google.auth.fromJSON(authJSON);
const gmail = google.gmail({version: 'v1', auth: auth as Auth.OAuth2Client});

export {
  firebase,
  db,
  gmail,
};
