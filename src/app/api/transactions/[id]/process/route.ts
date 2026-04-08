import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();

  if (typeof body.processed !== "boolean") {
    return NextResponse.json(
      { error: "processed (boolean) is required" },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const transaction = await prisma.transaction.update({
      where: { id },
      data: { processed: body.processed },
    });

    return NextResponse.json(transaction, { headers: corsHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404, headers: corsHeaders() }
    );
  }
}
