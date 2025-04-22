import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth, database } from "../config";
import { get, ref, query, onValue, orderByChild, equalTo } from "firebase/database";

type UserInfo = {
  authUser: User | null;
  profile: {
    name: string | null;
    email: string | null;
  } | null;
};
const UserContext = createContext<UserInfo>({authUser: null, profile: null});

const UserChange = ({children} : {children: ReactNode}) => {
  const [user, setUser] = useState<UserInfo>({authUser: null, profile: null});

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("Auth state changed:", currentUser.email || "No user");
        
        // Fetch additional user data from Realtime Database
        try {
          const userRef = ref(database, 'user-data');
          const snapshot = await get(userRef);
          
          if (snapshot.exists()) {
            const allUsers = snapshot.val();
            const matchingUserKey = Object.keys(allUsers).find(
              key => allUsers[key].email === currentUser.email
            );

            if (matchingUserKey) {
              const matchingUser = allUsers[matchingUserKey];
              setUser({
                authUser: currentUser,
                profile: {
                  name: matchingUser.name || null,
                  email: currentUser.email || null
                }
              });
            } else {
              // No matching user found
              setUser({
                authUser: currentUser,
                profile: null
              });
            }
          }
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
            authUser: currentUser,
            profile: null
          });
        }
      } else {
        // No user is signed in
        setUser({
          authUser: null,
          profile: null
        });
      }
    });
    
    // Clean up the listener on unmount
    return () => unsubscribe();
  }, []);

  return (
    <UserContext.Provider value={user}>
      {children}
    </UserContext.Provider>
  );
}

const UseUser = () => {
  return useContext(UserContext);
}

export { UserChange, UseUser };