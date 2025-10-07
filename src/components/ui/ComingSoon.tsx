import React from "react";

interface ComingSoonProps {
  title: string;
  description?: string;
}

export const ComingSoon: React.FC<ComingSoonProps> = ({ title, description }) => {
  return (
    <div className="container mx-auto py-8">
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <div className="mb-8">
          <svg
            className="w-24 h-24 mx-auto text-gray-300 dark:text-gray-600"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"
            />
          </svg>
        </div>

        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-4">
          {title}
        </h1>

        <p className="text-lg text-gray-600 dark:text-gray-400 mb-8 max-w-md">
          {description || "This feature is currently under development and will be available soon."}
        </p>

        <div className="inline-flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 rounded-lg">
          <div className="flex gap-1">
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-75"></span>
            <span className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-150"></span>
          </div>
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Coming Soon
          </span>
        </div>
      </div>
    </div>
  );
};
