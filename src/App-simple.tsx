import React from 'react';

function SimpleApp() {
  return (
    <div className="min-h-screen bg-gray-100 p-4">
      <div className="max-w-md mx-auto">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">NextStep</h1>
        <div className="bg-white rounded-lg p-4 shadow">
          <p className="text-gray-600">App is loading successfully!</p>
          <div className="mt-4">
            <button className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600">
              Test Button
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default SimpleApp;