import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ transactionId: string }> }
) {
  const { transactionId } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id: transactionId },
    include: { files: true, category: true },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404, headers: corsHeaders() }
    );
  }

  if (!transaction.completed) {
    return NextResponse.json(
      { error: "Upload in progress" },
      { status: 409, headers: corsHeaders() }
    );
  }

  await prisma.transaction.update({
    where: { id: transactionId },
    data: { downloadCount: { increment: 1 } },
  });

  const files = transaction.files.map((f) => ({
    id: f.id,
    originalName: f.originalName,
    mimeType: f.mimeType,
    sizeBytes: Number(f.sizeBytes),
    downloadUrl: `/api/download/${transactionId}/files/${f.id}`,
  }));

  return NextResponse.json(
    {
      transaction: {
        id: transaction.id,
        description: transaction.description,
        department: transaction.department,
        name: transaction.name,
        phone: transaction.phone,
        email: transaction.email,
        completed: transaction.completed,
        processed: transaction.processed,
        downloadCount: transaction.downloadCount + 1,
        categoryId: transaction.categoryId,
        categoryTitle: transaction.category.title,
        createdAt: transaction.createdAt,
      },
      files,
      zipUrl: `/api/download/${transactionId}/zip`,
    },
    { headers: corsHeaders() }
  );
}
