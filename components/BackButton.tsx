import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

const BackButton: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleBackClick = () => {
    // If the location's key is not 'default', it means we are not on the first page
    // of the session history, so we can safely go back.
    if (location.key !== 'default') {
      navigate(-1);
    } else {
      // If we are on the first page, there's nowhere to go back to,
      // so we navigate to the homepage as a fallback.
      navigate('/');
    }
  };

  return (
    <button
      onClick={handleBackClick}
      aria-label="Go back"
      className="mb-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-primary hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-dark-bg transition-colors"
    >
      <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mr-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
      </svg>
      Back
    </button>
  );
};

export default BackButton;
