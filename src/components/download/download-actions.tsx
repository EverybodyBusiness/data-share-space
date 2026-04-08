"use client";

import { Button } from "@/components/ui/button";

interface DownloadActionsProps {
  transactionId: string;
}

export function DownloadActions({ transactionId }: DownloadActionsProps) {
  return (
    <a href={`/api/download/${transactionId}/zip`} download>
      <Button size="sm">전체 다운로드 (ZIP)</Button>
    </a>
  );
}
