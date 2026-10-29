import { LanguageProvider } from './contexts/LanguageContext';
import { NetworkProvider } from './contexts/NetworkContext';
import { RoleProvider } from './contexts/RoleContext';
import { ToastProvider } from './contexts/ToastContext';
import { AppRouter } from './routes';

export default function App() {
  return (
    <LanguageProvider>
      <NetworkProvider>
        <RoleProvider>
          <ToastProvider>
            <AppRouter />
          </ToastProvider>
        </RoleProvider>
      </NetworkProvider>
    </LanguageProvider>
  );
}
