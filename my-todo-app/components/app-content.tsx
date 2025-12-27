"use client";

import { useAuth } from "@/lib/auth-context";
import { Todo } from "@/components/todo";
import { LoginScreen } from "@/components/login-screen";
import { ThemeSwitcher } from "@/components/theme-switcher";
import { Button } from "@/components/ui/button";
import { LogOut } from "lucide-react";

export function AppContent() {
  const { user, logout, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20">
        <div className="text-muted-foreground">読み込み中...</div>
      </div>
    );
  }

  if (!user) {
    return <LoginScreen />;
  }

  return (
    <main className="min-h-screen flex flex-col bg-gradient-to-br from-background to-muted/20">
      <nav className="w-full flex justify-between items-center border-b border-b-foreground/10 h-16 px-5 bg-background/80 backdrop-blur-sm sticky top-0 z-10">
        <h1 className="font-semibold text-lg">Kanban Todo</h1>
        <div className="flex items-center gap-4">
          <span className="text-sm text-muted-foreground hidden sm:inline">
            ようこそ、<span className="font-medium text-foreground">{user.name}</span>さん
          </span>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <Button variant="outline" size="sm" onClick={logout}>
              <LogOut className="h-4 w-4 mr-2" />
              ログアウト
            </Button>
          </div>
        </div>
      </nav>

      <div className="flex-1 py-8">
        <Todo />
      </div>
    </main>
  );
}
