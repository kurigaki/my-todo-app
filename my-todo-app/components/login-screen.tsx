"use client";

import { useState } from "react";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { LogIn, UserPlus, Loader2 } from "lucide-react";

export function LoginScreen() {
  const { users, login, register } = useAuth();
  const [selectedUserId, setSelectedUserId] = useState<string>("");
  const [showRegister, setShowRegister] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleLogin = () => {
    if (!selectedUserId) {
      setError("ユーザーを選択してください");
      return;
    }
    login(selectedUserId);
  };

  const handleRegister = async () => {
    const trimmedName = name.trim();
    const trimmedEmail = email.trim();

    if (!trimmedName) {
      setError("名前を入力してください");
      return;
    }
    if (!trimmedEmail) {
      setError("メールアドレスを入力してください");
      return;
    }
    if (!trimmedEmail.includes("@")) {
      setError("有効なメールアドレスを入力してください");
      return;
    }

    setIsSubmitting(true);
    setError("");

    const result = await register(trimmedName, trimmedEmail);

    if (!result) {
      setError("登録に失敗しました。メールアドレスが既に使用されている可能性があります。");
    }

    setIsSubmitting(false);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-background to-muted/20 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Kanban Todo</CardTitle>
          <CardDescription>
            {showRegister ? "新しいアカウントを作成" : "ログインしてタスクを管理"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {!showRegister ? (
            // Login Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="user-select">ユーザーを選択</Label>
                <select
                  id="user-select"
                  value={selectedUserId}
                  onChange={(e) => {
                    setSelectedUserId(e.target.value);
                    setError("");
                  }}
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
                >
                  <option value="">-- ユーザーを選択 --</option>
                  {users.map((user) => (
                    <option key={user.id} value={user.id}>
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button onClick={handleLogin} className="w-full" size="lg">
                <LogIn className="h-4 w-4 mr-2" />
                ログイン
              </Button>

              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <span className="w-full border-t" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-card px-2 text-muted-foreground">または</span>
                </div>
              </div>

              <Button
                variant="outline"
                onClick={() => {
                  setShowRegister(true);
                  setError("");
                }}
                className="w-full"
              >
                <UserPlus className="h-4 w-4 mr-2" />
                新規登録
              </Button>
            </div>
          ) : (
            // Registration Form
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">名前</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="山田太郎"
                  value={name}
                  onChange={(e) => {
                    setName(e.target.value);
                    setError("");
                  }}
                  disabled={isSubmitting}
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">メールアドレス</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="example@email.com"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    setError("");
                  }}
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}

              <Button
                onClick={handleRegister}
                className="w-full"
                size="lg"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <UserPlus className="h-4 w-4 mr-2" />
                )}
                {isSubmitting ? "登録中..." : "新規登録"}
              </Button>

              <Button
                variant="ghost"
                onClick={() => {
                  setShowRegister(false);
                  setError("");
                  setName("");
                  setEmail("");
                }}
                className="w-full"
                disabled={isSubmitting}
              >
                ログイン画面に戻る
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
