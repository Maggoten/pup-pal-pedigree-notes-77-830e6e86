
// This file serves as a compatibility layer for existing code
// It re-exports all authentication services from the new modular structure

import {
  loginUser,
  registerUser,
  deleteUserAccount,
  clearAuthStorage,
  getUserFromStorage,
  getLoggedInStateFromStorage,
  saveUserToStorage
} from './auth';

// Re-export everything
export {
  loginUser,
  registerUser,
  deleteUserAccount,
  clearAuthStorage as removeUserFromStorage, // Export with the old name for compatibility
  getUserFromStorage,
  getLoggedInStateFromStorage,
  saveUserToStorage
};
