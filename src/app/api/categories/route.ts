import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: { createdAt: "desc" },
    include: { _count: { select: { transactions: true } } },
  });
  return NextResponse.json(categories, { headers: corsHeaders() });
}

export async function POST(request: Request) {
  const body = await request.json();
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const category = await prisma.category.create({
    data: { title },
  });

  return NextResponse.json(category, { status: 201, headers: corsHeaders() });
}
