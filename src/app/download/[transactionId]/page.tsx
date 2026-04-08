import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { DownloadActions } from "@/components/download/download-actions";

interface PageProps {
  params: Promise<{ transactionId: string }>;
}

export default async function DownloadPage({ params }: PageProps) {
  const { transactionId } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { files: true, category: true },
  });

  if (!transaction) {
    notFound();
  }

  if (!transaction.completed) {
    return (
      <main className="flex min-h-screen items-center justify-center p-4">
        <Card className="w-full max-w-md">
          <CardContent className="pt-6 text-center">
            <p className="text-muted-foreground">
              업로드가 아직 진행중입니다. 잠시 후 다시 시도해주세요.
            </p>
          </CardContent>
        </Card>
      </main>
    );
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">파일 다운로드</CardTitle>
              <p className="mt-1 text-sm text-muted-foreground">
                카테고리: {transaction.category.title}
              </p>
            </div>
            <div className="flex gap-2">
              <Badge variant={transaction.processed ? "default" : "outline"}>
                {transaction.processed ? "처리완료" : "미처리"}
              </Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {transaction.description && (
            <div>
              <h3 className="mb-2 font-medium">설명</h3>
              <p className="whitespace-pre-wrap rounded-lg bg-muted p-4 text-sm">
                {transaction.description}
              </p>
            </div>
          )}

          <Separator />

          <div>
            <div className="mb-4 flex items-center justify-between">
              <h3 className="font-medium">
                파일 목록 ({transaction.files.length}개)
              </h3>
              <DownloadActions transactionId={transactionId} />
            </div>

            <div className="space-y-2">
              {transaction.files.map((file) => (
                <div
                  key={file.id}
                  className="flex items-center justify-between rounded-lg border p-3"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-lg">
                      {file.mimeType.startsWith("image/") ? "🖼️" : "📄"}
                    </span>
                    <div>
                      <p className="text-sm font-medium">
                        {file.originalName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {formatSize(Number(file.sizeBytes))}
                      </p>
                    </div>
                  </div>
                  <a
                    href={`/api/download/${transactionId}/files/${file.id}`}
                    download
                  >
                    <button className="rounded-md border px-3 py-1 text-sm hover:bg-muted">
                      다운로드
                    </button>
                  </a>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          <div className="text-xs text-muted-foreground">
            <p>업로드 일시: {transaction.createdAt.toLocaleString("ko-KR")}</p>
            <p>다운로드 횟수: {transaction.downloadCount}회</p>
          </div>
        </CardContent>
      </Card>
    </main>
  );
}

function formatSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
