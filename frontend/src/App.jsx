import { useEffect } from 'react';
import { BrowserRouter } from 'react-router-dom';
import { Provider, useSelector } from 'react-redux';
import { Toaster } from 'react-hot-toast';
import store from './store/store';
import AppRouter from './AppRouter';
import { setAuthToken } from './services/api';

function AuthTokenSync() {
  const { token } = useSelector(s => s.auth);
  useEffect(() => {
    setAuthToken(token);
  }, [token]);
  return null;
}

function App() {
  return (
    <Provider store={store}>
      <BrowserRouter>
        <AuthTokenSync />
        <AppRouter />
        <Toaster
          position="top-right"
          toastOptions={{
            duration: 4000,
            style: {
              background: '#ffffff',
              color: '#0f172a',
              borderRadius: '12px',
              border: '1px solid #e2e8f0',
              boxShadow: '0 4px 6px -1px rgba(0,0,0,0.1), 0 2px 4px -2px rgba(0,0,0,0.1)',
            },
          }}
        />
      </BrowserRouter>
    </Provider>
  );
}

export default App;
