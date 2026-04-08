"use client";

import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
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

interface TransactionItem {
  id: string;
  description: string;
  completed: boolean;
  processed: boolean;
  downloadCount: number;
  fileCount: number;
  createdAt: string;
}

interface TransactionListProps {
  transactions: TransactionItem[];
  categoryId: string;
}

export function TransactionList({
  transactions,
  categoryId,
}: TransactionListProps) {
  const router = useRouter();

  async function toggleProcessed(id: string, current: boolean) {
    const res = await fetch(`/api/transactions/${id}/process`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ processed: !current }),
    });

    if (res.ok) {
      toast.success(
        !current ? "처리완료로 변경되었습니다" : "미처리로 변경되었습니다"
      );
      router.refresh();
    } else {
      toast.error("상태 변경에 실패했습니다");
    }
  }

  async function handleDelete(id: string) {
    const res = await fetch(`/api/transactions/${id}`, { method: "DELETE" });

    if (res.ok) {
      toast.success("트랜잭션이 삭제되었습니다");
      router.refresh();
    } else {
      toast.error("삭제에 실패했습니다");
    }
  }

  async function handleDeleteAll() {
    const res = await fetch(`/api/categories/${categoryId}/transactions`, {
      method: "DELETE",
    });

    if (res.ok) {
      toast.success("모든 트랜잭션이 삭제되었습니다");
      router.refresh();
    } else {
      toast.error("삭제에 실패했습니다");
    }
  }

  function copyDownloadUrl(id: string) {
    const url = `${window.location.origin}/download/${id}`;
    navigator.clipboard.writeText(url);
    toast.success("다운로드 URL이 복사되었습니다");
  }

  if (transactions.length === 0) {
    return (
      <div className="rounded-lg border border-dashed p-12 text-center">
        <p className="text-muted-foreground">아직 트랜잭션이 없습니다</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <AlertDialog>
          <AlertDialogTrigger render={<Button variant="destructive" size="sm" />}>
            전체 삭제
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                모든 트랜잭션을 삭제하시겠습니까?
              </AlertDialogTitle>
              <AlertDialogDescription>
                이 카테고리의 모든 트랜잭션과 파일이 삭제됩니다. 이 작업은
                되돌릴 수 없습니다.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>취소</AlertDialogCancel>
              <AlertDialogAction onClick={handleDeleteAll}>
                전체 삭제
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>

      {transactions.map((tx) => (
        <Card key={tx.id}>
          <CardHeader className="pb-2">
            <div className="flex items-start justify-between">
              <CardTitle className="text-base">
                {tx.description || "(설명 없음)"}
              </CardTitle>
              <div className="flex gap-2">
                <Badge variant={tx.completed ? "default" : "secondary"}>
                  {tx.completed ? "업로드 완료" : "진행중"}
                </Badge>
                <Badge variant={tx.processed ? "default" : "outline"}>
                  {tx.processed ? "처리완료" : "미처리"}
                </Badge>
              </div>
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-4 text-sm text-muted-foreground">
              <span>파일 {tx.fileCount}개</span>
              <span>다운로드 {tx.downloadCount}회</span>
              <span>
                {new Date(tx.createdAt).toLocaleDateString("ko-KR")}
              </span>
            </div>
            <div className="flex flex-wrap gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => toggleProcessed(tx.id, tx.processed)}
                >
                  {tx.processed ? "미처리로 변경" : "처리완료"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => copyDownloadUrl(tx.id)}
                >
                  URL 복사
                </Button>
                <a href={`/download/${tx.id}`} target="_blank" rel="noreferrer">
                  <Button size="sm">다운로드 페이지</Button>
                </a>
                <AlertDialog>
                  <AlertDialogTrigger
                    render={<Button variant="destructive" size="sm" />}
                  >
                    삭제
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        이 트랜잭션을 삭제하시겠습니까?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        관련된 모든 파일이 삭제됩니다. 이 작업은 되돌릴 수
                        없습니다.
                      </AlertDialogDescription>
                    </AlertDialogHeader>
                    <AlertDialogFooter>
                      <AlertDialogCancel>취소</AlertDialogCancel>
                      <AlertDialogAction onClick={() => handleDelete(tx.id)}>
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
  );
}
