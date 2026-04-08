"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";

interface CategoryItem {
  id: string;
  title: string;
  transactionCount: number;
  createdAt: Date;
}

interface CategoryListProps {
  categories: CategoryItem[];
  currentCategoryId: string;
}

export function CategoryList({
  categories,
  currentCategoryId,
}: CategoryListProps) {
  const router = useRouter();
  const [newTitle, setNewTitle] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editId, setEditId] = useState<string | null>(null);
  const [createOpen, setCreateOpen] = useState(false);

  async function handleCreate() {
    if (!newTitle.trim()) return;

    const res = await fetch("/api/categories", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: newTitle.trim() }),
    });

    if (res.ok) {
      toast.success("카테고리가 생성되었습니다");
      setNewTitle("");
      setCreateOpen(false);
      router.refresh();
    } else {
      toast.error("생성에 실패했습니다");
    }
  }

  async function handleEdit(id: string) {
    if (!editTitle.trim()) return;

    const res = await fetch(`/api/categories/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ title: editTitle.trim() }),
    });

    if (res.ok) {
      toast.success("카테고리가 수정되었습니다");
      setEditId(null);
      router.refresh();
    } else {
      toast.error("수정에 실패했습니다");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/categories/${id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("카테고리가 삭제되었습니다");
      if (id === currentCategoryId) {
        router.push("/");
      } else {
        router.refresh();
      }
    } else {
      toast.error("삭제에 실패했습니다");
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={createOpen} onOpenChange={setCreateOpen}>
          <DialogTrigger
            render={<Button />}
          >
            새 카테고리
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>카테고리 생성</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                placeholder="카테고리 이름"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
              <Button onClick={handleCreate} className="w-full">
                생성
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {categories.map((category) => (
          <Card
            key={category.id}
            className={`cursor-pointer transition-shadow hover:shadow-md ${
              category.id === currentCategoryId ? "border-primary" : ""
            }`}
            onClick={() =>
              router.push(`/categories/${category.id}/transactions`)
            }
          >
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between">
                <CardTitle className="text-lg">{category.title}</CardTitle>
                <Badge variant="secondary">
                  {category.transactionCount}건
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <p className="mb-3 text-xs text-muted-foreground break-all">
                {category.id}
              </p>
              <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
                <Dialog
                  open={editId === category.id}
                  onOpenChange={(open) => {
                    if (open) {
                      setEditId(category.id);
                      setEditTitle(category.title);
                    } else {
                      setEditId(null);
                    }
                  }}
                >
                  <DialogTrigger
                    render={<Button variant="outline" size="sm" />}
                  >
                    수정
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>카테고리 수정</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        onKeyDown={(e) =>
                          e.key === "Enter" && handleEdit(category.id)
                        }
                      />
                      <Button
                        onClick={() => handleEdit(category.id)}
                        className="w-full"
                      >
                        저장
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>

                <AlertDialog>
                  <AlertDialogTrigger
                    render={
                      <Button variant="destructive" size="sm" />
                    }
                  >
                    삭제
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        카테고리를 삭제하시겠습니까?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        이 카테고리와 관련된 모든 트랜잭션 및 파일이
                        삭제됩니다. 이 작업은 되돌릴 수 없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction
                        onClick={() => handleDelete(category.id)}
                      >
                        삭제
                      </AlertDialogAction>
                    </AlertDialogFooter>
                  </AlertDialogContent>
                </AlertDialog>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
