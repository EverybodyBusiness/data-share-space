import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const category = await prisma.category.findUnique({
    where: { id },
    include: {
      transactions: {
        orderBy: { createdAt: "desc" },
        include: { _count: { select: { files: true } } },
      },
    },
  });

  if (!category) {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404, headers: corsHeaders() }
    );
  }

  return NextResponse.json(category, { headers: corsHeaders() });
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await request.json();
  const title = body.title?.trim();

  if (!title) {
    return NextResponse.json(
      { error: "title is required" },
      { status: 400, headers: corsHeaders() }
    );
  }

  try {
    const category = await prisma.category.update({
      where: { id },
      data: { title },
    });
    return NextResponse.json(category, { headers: corsHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404, headers: corsHeaders() }
    );
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    await prisma.category.delete({ where: { id } });
    return new NextResponse(null, { status: 204, headers: corsHeaders() });
  } catch {
    return NextResponse.json(
      { error: "Category not found" },
      { status: 404, headers: corsHeaders() }
    );
  }
}
