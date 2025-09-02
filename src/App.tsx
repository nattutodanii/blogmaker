import React from 'react';
import { BlogGenerator } from './components/BlogGenerator';

function App() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="container mx-auto py-8">
        <BlogGenerator />
      </div>
    </div>
  );
}

export default App;