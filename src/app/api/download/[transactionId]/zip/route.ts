import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { readFile } from "@/lib/storage";
import archiver from "archiver";
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
    include: { files: true },
  });

  if (!transaction) {
    return NextResponse.json(
      { error: "Transaction not found" },
      { status: 404, headers: corsHeaders() }
    );
  }

  const archive = archiver("zip", { zlib: { level: 5 } });
  const chunks: Buffer[] = [];

  archive.on("data", (chunk: Buffer) => chunks.push(chunk));

  for (const file of transaction.files) {
    const buffer = await readFile(file.storagePath);
    archive.append(buffer, { name: file.originalName });
  }

  await archive.finalize();

  const zipBuffer = Buffer.concat(chunks);

  return new NextResponse(new Uint8Array(zipBuffer), {
    headers: {
      ...corsHeaders(),
      "Content-Type": "application/zip",
      "Content-Disposition": `attachment; filename="${transactionId}.zip"`,
      "Content-Length": String(zipBuffer.length),
    },
  });
}
