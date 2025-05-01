import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, firestore } from "../config";
import { doc, onSnapshot } from "firebase/firestore";

type UserInfo = {
  authUser: User | null;
  profile: {
    name: string | null;
    email: string | null;
    phone: string | null;
    address: string | null;
  } | null;
  loading: boolean;
  clearUserContext?: () => void;
};
const UserContext = createContext<UserInfo>({ authUser: null, profile: null, loading: true });

const UserChange = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<UserInfo>({ authUser: null, profile: null, loading: true });

  const clearUserContext = () => {
    setUser({ authUser: null, profile: null, loading: true });
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        console.log("Auth state changed:", currentUser.email || "No user");
        setUser(prev => ({ ...prev, authUser: currentUser, loading: true }));

        const userDocRef = doc(firestore, 'users', currentUser.uid);
        const unsubscribeUserDoc = onSnapshot(userDocRef, (docSnap) => {
          if (docSnap.exists()) {
            const userData = docSnap.data();
            setUser({
              authUser: currentUser,
              profile: {
                name: userData.name || null,
                email: currentUser.email || null,
                phone: userData.phone || null,
                address: userData.address || null
              },
              loading: false
            });
          } else {
            setUser({
              authUser: currentUser,
              profile: null,
              loading: false
            });
          }
        }, (error) => {
          console.error("Error listening to user document:", error);
          setUser({
            authUser: currentUser,
            profile: null,
            loading: false
          });
        });

        // Return a cleanup function that unsubscribes from both listeners
        return () => {
          unsubscribeUserDoc();
        };
      } else {
        console.log("No user is signed in.");
        setUser({ authUser: null, profile: null, loading: false });
      }
    });

    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={{...user, clearUserContext}}>
      {children}
    </UserContext.Provider>
  );
}

const UseUser = () => {
  return useContext(UserContext);
}

export { UserChange, UseUser };