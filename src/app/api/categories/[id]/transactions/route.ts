import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteDirectory } from "@/lib/storage";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: categoryId } = await params;

  const transactions = await prisma.transaction.findMany({
    where: { categoryId },
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { files: true } } },
  });

  return NextResponse.json({ transactions }, { headers: corsHeaders() });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: categoryId } = await params;

  const category = await prisma.category.findUnique({
    where: { id: categoryId },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404, headers: corsHeaders() }
    );
  }

  await prisma.transaction.deleteMany({ where: { categoryId } });
  await deleteDirectory(categoryId);

  return NextResponse.json(
    { message: "All transactions deleted" },
    { headers: corsHeaders() }
  );
}
