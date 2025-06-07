const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

exports.updateUserEmail = functions.https.onCall(async (data, context) => {
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'You must be logged in');
  }

  const callerUid = context.auth.uid;
  const { uid, newEmail } = data;
  console.log('👤 Caller UID:', callerUid);

  try {
    // Fetch caller's user document from Firestore
    const callerDoc = await admin.firestore().collection('users').doc(callerUid).get();
    

    if (!callerDoc.exists) {
      throw new functions.https.HttpsError('not-found', 'Caller user document not found');
    }

    const callerData = callerDoc.data();
    const roles = callerData.roles || [];

    // Only allow if the first role is 'admin'
    if (roles[0] !== 'admin') {
      throw new functions.https.HttpsError('permission-denied', 'Only admins can update emails');
    }

    // Update the user's email in Firebase Authentication
    await admin.auth().updateUser(uid, { email: newEmail });

    return { success: true };
  } catch (error) {
    console.error('Error updating email:',error);
    
    throw new functions.https.HttpsError('internal', error.message);
  }
});
