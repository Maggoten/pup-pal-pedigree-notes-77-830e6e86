
import React, { lazy, Suspense } from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';

// Use lazy loading for the main App component
const App = lazy(() => import('./App'));

// Initial loading component shown while the app is being loaded
const InitialLoading = () => (
  <div className="h-screen w-full flex flex-col items-center justify-center bg-primary-50">
    <div className="animate-pulse flex flex-col items-center">
      <div className="h-16 w-16 rounded-full bg-primary/20 flex items-center justify-center">
        <div className="h-10 w-10 rounded-full bg-primary animate-spin"></div>
      </div>
      <h1 className="mt-4 text-xl font-semibold text-primary">Loading...</h1>
      <p className="mt-2 text-sm text-primary-700">Setting up your breeding app</p>
    </div>
  </div>
);

// Add critical mobile meta tags
const metaTags = [
  { name: 'viewport', content: 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no, viewport-fit=cover' },
  { name: 'apple-mobile-web-app-capable', content: 'yes' },
  { name: 'apple-mobile-web-app-status-bar-style', content: 'default' },
  { name: 'theme-color', content: '#ffffff' },
  { name: 'format-detection', content: 'telephone=no' }
];

// Add meta tags to document head
metaTags.forEach(({name, content}) => {
  const meta = document.createElement('meta');
  meta.name = name;
  meta.content = content;
  document.head.appendChild(meta);
});

// Add app manifest for mobile PWA capability
const manifestLink = document.createElement('link');
manifestLink.rel = 'manifest';
manifestLink.href = '/manifest.json';
document.head.appendChild(manifestLink);

// Add apple touch icon
const appleIconLink = document.createElement('link');
appleIconLink.rel = 'apple-touch-icon';
appleIconLink.href = '/apple-touch-icon.png';
document.head.appendChild(appleIconLink);

// Root element for rendering
const root = ReactDOM.createRoot(
  document.getElementById('root') as HTMLElement
);

// Render with suspense fallback
root.render(
  <React.StrictMode>
    <Suspense fallback={<InitialLoading />}>
      <App />
    </Suspense>
  </React.StrictMode>
);
