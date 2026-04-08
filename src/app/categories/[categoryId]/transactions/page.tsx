import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TransactionList } from "@/components/transaction/transaction-list";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function TransactionsPage({ params }: PageProps) {
  const { categoryId } = await params;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    notFound();
  }

  const transactions = await prisma.transaction.findMany({
    where: { categoryId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true } } },
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">트랜잭션 목록</h1>
          <p className="text-muted-foreground">
            카테고리: {category.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/categories/${categoryId}`}>
            <Button variant="outline">카테고리 목록</Button>
          </Link>
          <Link href={`/categories/${categoryId}/upload`}>
            <Button>파일 업로드</Button>
          </Link>
        </div>
      </div>

      <TransactionList
        categoryId={categoryId}
        transactions={transactions.map((t) => ({
          id: t.id,
          description: t.description,
          completed: t.completed,
          processed: t.processed,
          downloadCount: t.downloadCount,
          fileCount: t._count.files,
          createdAt: t.createdAt.toISOString(),
        }))}
      />
    </main>
  );
}
