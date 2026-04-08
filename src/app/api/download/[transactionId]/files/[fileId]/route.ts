import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "@/lib/storage";
import { corsHeaders, handleOptions } from "@/lib/cors";

export async function OPTIONS() {
  return handleOptions();
}

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ transactionId: string; fileId: string }> }
) {
  const { transactionId, fileId } = await params;

  const file = await prisma.file.findFirst({
    where: { id: fileId, transactionId },
  });

  if (!file) {
    return NextResponse.json(
      { error: "File not found" },
      { status: 404, headers: corsHeaders() }
    );
  }

  const buffer = await readFile(file.storagePath);

  return new NextResponse(new Uint8Array(buffer), {
    headers: {
      ...corsHeaders(),
      "Content-Type": file.mimeType,
      "Content-Disposition": `attachment; filename="${encodeURIComponent(file.originalName)}"`,
      "Content-Length": String(buffer.length),
    },
  });
}
