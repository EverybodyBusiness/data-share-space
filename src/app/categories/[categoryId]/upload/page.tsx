import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { UploadForm } from "@/components/upload/upload-form";

interface PageProps {
  params: Promise<{ categoryId: string }>;
}

export default async function UploadPage({ params }: PageProps) {
  const { categoryId } = await params;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    notFound();
  }

  return (
    <main className="mx-auto max-w-3xl p-6">
      <div className="mb-6">
        <div>
          <h1 className="text-3xl font-bold">파일 업로드</h1>
          <p className="text-muted-foreground">
            카테고리: {category.title}
          </p>
        </div>
        <div className="mt-4 flex gap-2">
          <Link href={`/categories/${categoryId}`}>
            <Button variant="outline">카테고리 목록</Button>
          </Link>
          <Link href={`/categories/${categoryId}/transactions`}>
            <Button variant="outline">트랜잭션 목록</Button>
          </Link>
        </div>
      </div>

      <UploadForm categoryId={categoryId} />
    </main>
  );
}
