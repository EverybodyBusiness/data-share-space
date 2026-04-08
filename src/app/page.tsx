"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
  const [categoryId, setCategoryId] = useState("");
  const [error, setError] = useState("");
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = categoryId.trim();

    const uuidRegex =
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

    if (!uuidRegex.test(trimmed)) {
      setError("올바른 UUID 형식을 입력해주세요");
      return;
    }

    router.push(`/categories/${trimmed}`);
  }

  return (
    <main className="flex min-h-screen items-center justify-center p-4">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Data Share Space
          </CardTitle>
          <p className="text-center text-muted-foreground">
            카테고리 UUID를 입력하여 접근하세요
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Input
                placeholder="카테고리 UUID 입력"
                value={categoryId}
                onChange={(e) => {
                  setCategoryId(e.target.value);
                  setError("");
                }}
              />
              {error && (
                <p className="mt-1 text-sm text-destructive">{error}</p>
              )}
            </div>
            <Button type="submit" className="w-full">
              접근하기
            </Button>
          </form>
        </CardContent>
      </Card>
    </main>
  );
}
