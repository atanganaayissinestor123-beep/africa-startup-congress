import React from 'react';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const NotFound: React.FC = () => {
  return (
    <>
      <SEO
        title="Page Not Found | Africa Startup Congress"
        description="The page you are looking for does not exist."
      >
        <meta name="robots" content="noindex, nofollow" />
      </SEO>
      <div className="min-h-[70vh] flex items-center justify-center bg-gray-50 px-4 sm:px-6 lg:px-8">
        <div className="max-w-max mx-auto text-center">
          <main className="sm:flex">
            <p className="text-4xl font-extrabold text-[#E50914] sm:text-5xl">404</p>
            <div className="sm:ml-6">
              <div className="sm:border-l sm:border-gray-200 sm:pl-6">
                <h1 className="text-4xl font-extrabold text-gray-900 tracking-tight sm:text-5xl">
                  Page not found
                </h1>
                <p className="mt-1 text-base text-gray-500">
                  Please check the URL in the address bar and try again.
                </p>
              </div>
              <div className="mt-10 flex space-x-3 sm:border-l sm:border-transparent sm:pl-6">
                <Link
                  to="/"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-[#E50914] hover:bg-[#b90710] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E50914]"
                >
                  Go back home
                </Link>
                <Link
                  to="/register"
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-[#E50914] bg-red-100 hover:bg-red-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#E50914]"
                >
                  Register Here
                </Link>
              </div>
            </div>
          </main>
        </div>
      </div>
    </>
  );
};

export default NotFound;
