import { prisma } from "@/lib/prisma";
import { notFound } from "next/navigation";

interface LayoutProps {
  children: React.ReactNode;
  params: Promise<{ categoryId: string }>;
}

export default async function CategoryLayout({
  children,
  params,
}: LayoutProps) {
  const { categoryId } = await params;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    notFound();
  }

  return <>{children}</>;
}
