import { useEffect, useState } from 'react';
import { onAuthStateChanged } from 'firebase/auth';
import { auth, db } from './firebaseConfig';
import { doc, getDoc } from 'firebase/firestore';

export default function useFirebaseUser() {
  const [user, setUser] = useState(null);
  const [role, setRole] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        setUser(firebaseUser);

        const maxRetries = 5;
        let retryCount = 0;
        let delay = 500; // ms

        while (retryCount < maxRetries) {
          const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            setRole(userData.roles?.[0]);
            setLoading(false);
            return;
          }

          await new Promise((resolve) => setTimeout(resolve, delay));
          retryCount++;
          delay *= 2;
        }

        // Failed after retries
        setRole(null);
        setLoading(false);
      } else {
        setUser(null);
        setRole(null);
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, []);


  return { user, role, loading };
}