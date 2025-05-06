
// Re-export all authentication services for easier imports
export { loginUser } from './loginService';
export { registerUser } from './registrationService';
export { deleteUserAccount } from './accountService';
export {
  clearAuthStorage,
  getUserFromStorage,
  getLoggedInStateFromStorage,
  saveUserToStorage
} from './storageService';
