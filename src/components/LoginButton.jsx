import React from 'react';
import { LogOut } from 'lucide-react';

const LoginButton = ({ onLogin, onLogout, user }) => {
  return user ? (
    <div className="flex items-center gap-4">
      <img src={user.photoURL} alt={user.displayName} className="w-8 h-8 rounded-full" />
      <button
        onClick={onLogout}
        className="flex items-center gap-2 px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300"
      >
        <LogOut className="w-4 h-4" />
        Logout
      </button>
    </div>
  ) : (
    <button
      onClick={onLogin}
      className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
    >
      Sign in with Google
    </button>
  );
};

export default LoginButton;