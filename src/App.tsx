import { BrowserRouter } from 'react-router-dom';
import { AuthProvider } from './hooks/useAuth';
import AppRoutes from './routes';

// Honour Vite's configured base path (e.g. "/repo/" on a GitHub project page)
// so client-side routes resolve correctly under a subpath. Strip the trailing
// slash because React Router expects a basename without one.
const basename = import.meta.env.BASE_URL.replace(/\/$/, '') || '/';

export default function App() {
  return (
    <BrowserRouter basename={basename}>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  );
}
