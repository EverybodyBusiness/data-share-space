import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CategoryList } from "@/components/category/category-list";
import { Button } from "@/components/ui/button";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function CategoryDashboard({ params }: PageProps) {
  const { categoryId } = await params;

  const currentCategory = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!currentCategory) {
    notFound();
  }

  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { transactions: true } } },
  });

  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">카테고리 관리</h1>
          <p className="text-muted-foreground">
            현재 카테고리: {currentCategory.title}
          </p>
        </div>
        <div className="flex gap-2">
          <Link href={`/categories/${categoryId}/transactions`}>
            <Button variant="outline">트랜잭션 목록</Button>
          </Link>
          <Link href={`/categories/${categoryId}/upload`}>
            <Button>파일 업로드</Button>
          </Link>
        </div>
      </div>

      <CategoryList
        categories={categories.map((c) => ({
          ...c,
          transactionCount: c._count.transactions,
        }))}
        currentCategoryId={categoryId}
      />
    </main>
  );
}
