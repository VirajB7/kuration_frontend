import React, { useState, useEffect } from 'react';
import LoginButton from './LoginButton';
import LeadForm from './LeadForm';
import EnrichedData from './EnrichedData';
import ErrorDisplay from './ErrorDisplay';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut, onAuthStateChanged } from 'firebase/auth';
import { getFirestore, addDoc, collection, getDocs, query, where } from 'firebase/firestore';


const firebaseConfig = {
  apiKey: process.env.REACT_APP_FIREBASE_API_KEY,
  authDomain: process.env.REACT_APP_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.REACT_APP_FIREBASE_PROJECT_ID,
  storageBucket: process.env.REACT_APP_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.REACT_APP_FIREBASE_APP_ID
};




// Initialize Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const provider = new GoogleAuthProvider();

const LeadEnrichmentTool = () => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({ companyName: '', website: '' });
  const [enrichedData, setEnrichedData] = useState(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (!authUser) {
        setFormData({ companyName: '', website: '' });
        setEnrichedData(null);
        setError(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
      setFormData({ companyName: '', website: '' });
      setEnrichedData(null);
      setError(null);
    } catch (error) {
      setError('Failed to login. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setFormData({ companyName: '', website: '' });
      setEnrichedData(null);
      setError(null);
    } catch (error) {
      setError('Failed to logout. Please try again.');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.companyName || !formData.website) {
      setError('Please fill in all fields');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.REACT_APP_API_URL}/api/enrich`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${await user.getIdToken()}`,
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        throw new Error('Failed to fetch enriched data');
      }

      const data = await response.json();
      setEnrichedData(data);

      // Save data for the logged-in user only if it's not already stored
      const userEmail = user.email.replace(/[@.]/g, "_");
      const userCollectionRef = collection(db, `users/${userEmail}/requests`);
      const requestData = { enrichedData: data, requestTime: new Date() };

      // Check for duplicate
      const q = query(userCollectionRef, where("enrichedData", "==", data));
      const querySnapshot = await getDocs(q);

      if (querySnapshot.empty) {
        // No duplicate found; add a new document
        await addDoc(userCollectionRef, requestData);
        console.log("New document created for user:", user.email);
      } else {
        console.log("Duplicate data found. Document not saved.");
      }
    } catch (error) {
      setError('Failed to enrich lead data. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Lead Enrichment Preview Tool</h1>
          {user ? (
            <LoginButton onLogout={handleLogout} user={user} />
          ) : (
            <LoginButton onLogin={handleLogin} />
          )}
        </div>

        {user ? (
          <div className="space-y-8">
            <LeadForm
              formData={formData}
              setFormData={setFormData}
              onSubmit={handleSubmit}
              loading={loading}
            />

            {error && <ErrorDisplay error={error} />}

            {enrichedData && <EnrichedData enrichedData={enrichedData} />}
          </div>
        ) : (
          <div className="text-center py-12">
            <p className="text-gray-600">Please sign in to access the lead enrichment tool.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default LeadEnrichmentTool;
