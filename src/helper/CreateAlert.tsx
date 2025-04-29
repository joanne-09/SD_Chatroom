import React, { createContext, useContext, useState } from 'react';
import { Alert, Snackbar } from '@mui/material';

// Define the alert type
type AlertType = 'success' | 'error' | 'info' | 'warning';

// Define the context interface
interface AlertContextType {
  showAlert: (message: string, type: AlertType) => void;
  hideAlert: () => void;
}

// Create the context
const AlertContext = createContext<AlertContextType | undefined>(undefined);

// Create the provider component
export const AlertProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [alert, setAlert] = useState<{
    open: boolean;
    message: string;
    type: AlertType;
  }>({
    open: false,
    message: '',
    type: 'success',
  });

  // Show alert function
  const showAlert = (message: string, type: AlertType) => {
    setAlert({
      open: true,
      message,
      type,
    });
  };

  // Hide alert function
  const hideAlert = () => {
    setAlert(prev => ({
      ...prev,
      open: false,
    }));
  };

  return (
    <AlertContext.Provider value={{ showAlert, hideAlert }}>
      {children}
      <Snackbar
        open={alert.open}
        autoHideDuration={2000}
        onClose={hideAlert}
        sx={{width: '100vw'}}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      >
        <Alert 
          onClose={hideAlert} 
          severity={alert.type}
          sx={{ width: 'fit-content', boxShadow: '0 3px 10px rgba(0,0,0,0.2)' }}
        >
          {alert.message}
        </Alert>
      </Snackbar>
    </AlertContext.Provider>
  );
};

// Create a custom hook for using the alert
export const UseAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error('useAlert must be used within an AlertProvider');
  }
  return context;
};