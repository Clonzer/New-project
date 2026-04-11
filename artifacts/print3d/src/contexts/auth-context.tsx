// Re-export everything from the new Supabase auth context
// This maintains compatibility with old imports while using Supabase
export {
  AuthProvider,
  useAuth,
  type AuthContextValue,
} from "./supabase-auth-context";
