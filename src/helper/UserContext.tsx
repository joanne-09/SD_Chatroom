import { useEffect, useState, createContext, useContext, ReactNode } from "react";
import { onAuthStateChanged, User } from "firebase/auth";
import { auth } from "../config";
import { getUserByEmail } from "./AccessUser";

type UserInfo = {
  authUser: User | null;
  profile: {
    name: string | null;
    email: string | null;
  } | null;
  loading: boolean;
};
const UserContext = createContext<UserInfo>({authUser: null, profile: null, loading: true});

const UserChange = ({children} : {children: ReactNode}) => {
  const [user, setUser] = useState<UserInfo>({authUser: null, profile: null, loading: true});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        console.log("Auth state changed:", currentUser.email || "No user");
        setUser(prev => ({...prev, authUser: currentUser, loading: true}));
        
        // Fetch additional user data from Realtime Database
        try {
          getUserByEmail(currentUser.email!)
            .then((userData) => {
              if (userData) {
                setUser({
                  authUser: currentUser,
                  profile: {
                    name: userData.name || null,
                    email: currentUser.email || null
                  },
                  loading: false
                });
              } else {
                // No matching user found
                setUser({
                  authUser: currentUser,
                  profile: null,
                  loading: false
                });
              }
            }).catch((error) => {
              console.error("Error fetching user data:", error);
              setUser({
                authUser: currentUser,
                profile: null,
                loading: false
              });
            })
        } catch (error) {
          console.error("Error fetching user data:", error);
          setUser({
            authUser: currentUser,
            profile: null,
            loading: false
          });
        }
      }else{
        console.log("No user is signed in.");
        setUser({authUser: null, profile: null, loading: false});
      }

      setLoading(false);
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