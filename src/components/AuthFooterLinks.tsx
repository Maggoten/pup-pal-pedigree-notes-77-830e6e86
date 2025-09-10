import React from 'react';
import { Link } from 'react-router-dom';

const AuthFooterLinks: React.FC = () => {
  const links = [
    { to: '/about', label: 'About' },
    { to: '/faq', label: 'FAQ' },
    { to: '/privacy', label: 'Privacy Policy' },
    { to: '/terms', label: 'Terms' },
    { to: '/contact', label: 'Contact' }
  ];

  return (
    <nav className="mt-6 text-center">
      <div className="flex flex-wrap justify-center items-center gap-x-4 gap-y-2 text-sm text-warmgreen-600">
        {links.map((link, index) => (
          <React.Fragment key={link.to}>
            <Link 
              to={link.to}
              className="hover:underline hover:text-warmgreen-700 transition-colors"
            >
              {link.label}
            </Link>
            {index < links.length - 1 && (
              <span className="text-warmbeige-400 select-none">•</span>
            )}
          </React.Fragment>
        ))}
      </div>
    </nav>
  );
};

export default AuthFooterLinks;