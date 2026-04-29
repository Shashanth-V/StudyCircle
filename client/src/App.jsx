import { useEffect } from 'react';
import { Toaster } from 'react-hot-toast';
import Routes from './routes';
import { useAuthStore } from './stores/authStore';

function App() {
  const init = useAuthStore(s => s.init);

  useEffect(() => {
    init();
  }, [init]);

  return (
    <>
      <Toaster position="top-right" />
      <Routes />
    </>
  );
}

export default App;
