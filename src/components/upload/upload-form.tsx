"use client";

import { useCallback, useRef, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";

interface UploadFormProps {
  categoryId: string;
}

interface UploadResult {
  transactionId: string;
  downloadUrl: string;
  description: string;
  fileCount: number;
}

export function UploadForm({ categoryId }: UploadFormProps) {
  const [description, setDescription] = useState("");
  const [files, setFiles] = useState<File[]>([]);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<UploadResult | null>(null);
  const [dragOver, setDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const addFiles = useCallback((newFiles: FileList | File[]) => {
    const arr = Array.from(newFiles);
    setFiles((prev) => [...prev, ...arr]);
  }, []);

  function removeFile(index: number) {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  }

  function handleDrop(e: React.DragEvent) {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files.length > 0) {
      addFiles(e.dataTransfer.files);
    }
  }

  async function handleUpload() {
    if (files.length === 0) {
      toast.error("파일을 선택해주세요");
      return;
    }

    setUploading(true);
    setProgress(0);

    const formData = new FormData();
    formData.append("description", description);
    files.forEach((f) => formData.append("files", f));

    const xhr = new XMLHttpRequest();

    xhr.upload.addEventListener("progress", (e) => {
      if (e.lengthComputable) {
        setProgress(Math.round((e.loaded / e.total) * 100));
      }
    });

    xhr.addEventListener("load", () => {
      setUploading(false);
      if (xhr.status === 201) {
        const data = JSON.parse(xhr.responseText) as UploadResult;
        setResult(data);
        toast.success("업로드가 완료되었습니다");
        setDescription("");
        setFiles([]);
      } else {
        toast.error("업로드에 실패했습니다");
      }
    });

    xhr.addEventListener("error", () => {
      setUploading(false);
      toast.error("네트워크 오류가 발생했습니다");
    });

    xhr.open("POST", `/api/categories/${categoryId}/upload`);
    xhr.send(formData);
  }

  function copyUrl() {
    if (!result) return;
    const url = `${window.location.origin}/download/${result.transactionId}`;
    navigator.clipboard.writeText(url);
    toast.success("URL이 복사되었습니다");
  }

  function formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="space-y-6">
      <div>
        <label className="mb-2 block text-sm font-medium">설명</label>
        <Textarea
          placeholder="파일에 대한 설명을 입력하세요"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          rows={3}
        />
      </div>

      <div>
        <label className="mb-2 block text-sm font-medium">파일 선택</label>
        <div
          className={`cursor-pointer rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
            dragOver
              ? "border-primary bg-primary/5"
              : "border-muted-foreground/25 hover:border-primary/50"
          }`}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={handleDrop}
          onClick={() => inputRef.current?.click()}
        >
          <p className="text-muted-foreground">
            파일을 드래그하거나 클릭하여 선택하세요
          </p>
          <p className="mt-1 text-xs text-muted-foreground">
            이미지, DOCX 파일 지원
          </p>
          <input
            ref={inputRef}
            type="file"
            multiple
            accept="image/*,.docx,.doc,application/vnd.openxmlformats-officedocument.wordprocessingml.document,application/msword"
            className="hidden"
            onChange={(e) => {
              if (e.target.files) addFiles(e.target.files);
              e.target.value = "";
            }}
          />
        </div>
      </div>

      {files.length > 0 && (
        <Card>
          <CardContent className="pt-4">
            <p className="mb-2 text-sm font-medium">
              선택된 파일 ({files.length}개)
            </p>
            <ul className="space-y-2">
              {files.map((file, i) => (
                <li
                  key={`${file.name}-${i}`}
                  className="flex items-center justify-between rounded border p-2 text-sm"
                >
                  <div className="flex items-center gap-2">
                    <span>
                      {file.type.startsWith("image/") ? "🖼️" : "📄"}
                    </span>
                    <span className="truncate max-w-xs">{file.name}</span>
                    <span className="text-muted-foreground">
                      ({formatSize(file.size)})
                    </span>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => removeFile(i)}
                  >
                    ✕
                  </Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      )}

      {uploading && (
        <div className="space-y-2">
          <Progress value={progress} />
          <p className="text-center text-sm text-muted-foreground">
            {progress}% 업로드 중...
          </p>
        </div>
      )}

      <Button
        onClick={handleUpload}
        disabled={uploading || files.length === 0}
        className="w-full"
        size="lg"
      >
        {uploading ? "업로드 중..." : "업로드"}
      </Button>

      <Dialog open={!!result} onOpenChange={(open) => !open && setResult(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>업로드 완료</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              {result?.fileCount}개 파일이 업로드되었습니다
            </p>
            <div>
              <label className="mb-1 block text-sm font-medium">
                다운로드 URL
              </label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  value={
                    result
                      ? `${window.location.origin}/download/${result.transactionId}`
                      : ""
                  }
                />
                <Button onClick={copyUrl}>복사</Button>
              </div>
            </div>
            <a
              href={result ? `/download/${result.transactionId}` : "#"}
              target="_blank"
              rel="noreferrer"
            >
              <Button variant="outline" className="w-full">
                다운로드 페이지로 이동
              </Button>
            </a>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
