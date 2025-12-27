import { AuthProvider } from "@/lib/auth-context";
import { AppContent } from "@/components/app-content";

export default function Home() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
