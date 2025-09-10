import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { I18nextProvider } from 'react-i18next';
import aboutI18n from '@/i18n/aboutI18n';
import About from '@/pages/About';
import I18nLoadingGuard from '@/components/I18nLoadingGuard';

const AboutApp: React.FC = () => {
  return (
    <I18nextProvider i18n={aboutI18n}>
      <BrowserRouter>
        <I18nLoadingGuard namespace={['about', 'common']}>
          <Routes>
            <Route path="/about" element={<About />} />
            <Route path="*" element={<Navigate to="/about" replace />} />
          </Routes>
        </I18nLoadingGuard>
      </BrowserRouter>
    </I18nextProvider>
  );
};

export default AboutApp;