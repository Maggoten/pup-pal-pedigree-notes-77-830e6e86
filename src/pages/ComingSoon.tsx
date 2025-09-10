import React from 'react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Clock } from 'lucide-react';
import LanguageSwitcher from '@/components/LanguageSwitcher';

interface ComingSoonProps {
  title: string;
  description?: string;
}

const ComingSoon: React.FC<ComingSoonProps> = ({ title, description = "This page is coming soon. We're working hard to bring you this feature." }) => {
  return (
    <div className="min-h-screen bg-warmbeige-50/70 flex items-center justify-center p-4 relative">
      {/* Language Switcher */}
      <div className="absolute top-4 right-4 z-10">
        <LanguageSwitcher />
      </div>

      {/* Back to Login Link */}
      <div className="absolute top-4 left-4 z-10">
        <Link 
          to="/login" 
          className="text-sm text-warmgreen-600 hover:text-warmgreen-700 underline flex items-center gap-1"
        >
          ← Back to Login
        </Link>
      </div>

      <Card className="w-full max-w-md shadow-lg bg-white border-warmbeige-200">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-warmgreen-100">
            <Clock className="h-6 w-6 text-warmgreen-600" />
          </div>
          <CardTitle className="text-2xl font-bold text-warmgreen-800 font-playfair">
            {title}
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-center text-warmgreen-700 mb-6">
            {description}
          </p>
          <Link 
            to="/login"
            className="w-full block text-center py-2 px-4 bg-warmgreen-600 hover:bg-warmgreen-700 text-white rounded-md transition-colors"
          >
            Back to Login
          </Link>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;