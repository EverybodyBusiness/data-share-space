import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { saveFile } from "@/lib/storage";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function POST(
  request: Request,
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

  const formData = await request.formData();
  const description = (formData.get("description") as string) ?? "";
  const department = (formData.get("department") as string) || null;
  const name = (formData.get("name") as string) || null;
  const phone = (formData.get("phone") as string) || null;
  const email = (formData.get("email") as string) || null;
  const uploadedFiles = formData.getAll("files") as File[];

  if (uploadedFiles.length === 0) {
    return NextResponse.json(
      { error: "No files provided" },
      { status: 400, headers: corsHeaders() }
    );
  }

  const transaction = await prisma.transaction.create({
    data: { categoryId, description, department, name, phone, email, completed: false },
  });

  const fileRecords = [];

  for (const file of uploadedFiles) {
    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = await saveFile(
      categoryId,
      transaction.id,
      file.name,
      buffer
    );

    const record = await prisma.file.create({
      data: {
        transactionId: transaction.id,
        originalName: file.name,
        storedName: stored.storedName,
        mimeType: file.type || "application/octet-stream",
        sizeBytes: stored.sizeBytes,
        storagePath: stored.storagePath,
      },
    });

    fileRecords.push(record);
  }

  await prisma.transaction.update({
    where: { id: transaction.id },
    data: { completed: true },
  });

  return NextResponse.json(
    {
      transactionId: transaction.id,
      downloadUrl: `/api/download/${transaction.id}`,
      description,
      fileCount: fileRecords.length,
      completed: true,
    },
    { status: 201, headers: corsHeaders() }
  );
}
