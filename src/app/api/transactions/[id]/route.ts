import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { deleteDirectory } from "@/lib/storage";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const transaction = await prisma.transaction.findUnique({
    where: { id },
    select: { id: true, categoryId: true },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404, headers: corsHeaders() }
    );
  }

  await prisma.transaction.delete({ where: { id } });
  await deleteDirectory(`${transaction.categoryId}/${transaction.id}`);

  return new NextResponse(null, { status: 204, headers: corsHeaders() });
}
