import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";

export default function DocsPage() {
  return (
    <main className="mx-auto max-w-5xl p-6">
      <div className="mb-8">
        <h1 className="text-4xl font-bold">Data Share Space</h1>
        <p className="mt-2 text-lg text-muted-foreground">
          카테고리 기반 파일 공유 플랫폼 - API 및 웹 페이지 명세
        </p>
      </div>

      {/* 개요 */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>개요</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          <p>
            인증 없이 카테고리 UUID를 통해 접근하며, 파일 업로드 시 고유한
            다운로드 URL을 발급합니다. 모든 API는 웹 UI와 curl/Postman 등
            외부 호출 모두 지원합니다.
          </p>
          <div className="rounded-lg bg-muted p-4 font-mono text-xs">
            categories (1:N) → transactions (1:N) → files
          </div>
        </CardContent>
      </Card>

      {/* 웹 페이지 */}
      <h2 className="mb-4 text-2xl font-bold">웹 페이지</h2>
      <div className="mb-8 space-y-3">
        {webPages.map((page) => (
          <Card key={page.path}>
            <CardContent className="flex items-start gap-4 pt-4">
              <Badge variant="outline" className="mt-0.5 shrink-0 font-mono">
                GET
              </Badge>
              <div className="flex-1">
                <p className="font-mono text-sm font-medium">{page.path}</p>
                <p className="mt-1 text-sm text-muted-foreground">
                  {page.description}
                </p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="mb-8" />

      {/* API 엔드포인트 */}
      <h2 className="mb-4 text-2xl font-bold">API 엔드포인트</h2>

      {apiSections.map((section) => (
        <div key={section.title} className="mb-8">
          <h3 className="mb-3 text-xl font-semibold">{section.title}</h3>
          <div className="space-y-3">
            {section.endpoints.map((ep, i) => (
              <Card key={i}>
                <CardContent className="pt-4">
                  <div className="flex items-start gap-3">
                    <Badge
                      variant={methodVariant(ep.method)}
                      className="mt-0.5 shrink-0 font-mono"
                    >
                      {ep.method}
                    </Badge>
                    <div className="flex-1">
                      <p className="font-mono text-sm font-medium">
                        {ep.path}
                      </p>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {ep.description}
                      </p>
                    </div>
                  </div>

                  {(ep.request || ep.response) && (
                    <div className="mt-4 grid gap-4 md:grid-cols-2">
                      {ep.request && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Request
                          </p>
                          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                            {ep.request}
                          </pre>
                        </div>
                      )}
                      {ep.response && (
                        <div>
                          <p className="mb-1 text-xs font-medium text-muted-foreground">
                            Response
                          </p>
                          <pre className="overflow-x-auto rounded-lg bg-muted p-3 text-xs">
                            {ep.response}
                          </pre>
                        </div>
                      )}
                    </div>
                  )}

                  {ep.curl && (
                    <div className="mt-4">
                      <p className="mb-1 text-xs font-medium text-muted-foreground">
                        curl 예시
                      </p>
                      <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-3 text-xs text-zinc-100">
                        {ep.curl}
                      </pre>
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      ))}

      <Separator className="mb-8" />

      {/* 데이터베이스 스키마 */}
      <h2 className="mb-4 text-2xl font-bold">데이터베이스 스키마</h2>
      <div className="mb-8 grid gap-4 md:grid-cols-3">
        {dbTables.map((table) => (
          <Card key={table.name}>
            <CardHeader className="pb-2">
              <CardTitle className="text-base font-mono">
                {table.name}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ul className="space-y-1 text-xs">
                {table.columns.map((col) => (
                  <li key={col.name} className="flex justify-between">
                    <span className="font-mono">{col.name}</span>
                    <span className="text-muted-foreground">{col.type}</span>
                  </li>
                ))}
              </ul>
            </CardContent>
          </Card>
        ))}
      </div>

      <Separator className="mb-8" />

      {/* 설치 가이드 */}
      <h2 className="mb-4 text-2xl font-bold">설치 및 실행</h2>
      <Card className="mb-8">
        <CardContent className="pt-4">
          <pre className="overflow-x-auto rounded-lg bg-zinc-900 p-4 text-xs leading-relaxed text-zinc-100">
{`# 1. 저장소 클론
git clone https://github.com/EverybodyBusiness/data-share-space.git
cd data-share-space

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL 수정

# 4. 데이터베이스 생성 및 마이그레이션
createdb data_share_space
npx prisma migrate deploy
npx prisma generate

# 5. 업로드 디렉토리 생성
mkdir -p uploads

# 6. 실행
npm run dev          # 개발 서버
npm run build && npm start  # 프로덕션`}
          </pre>
        </CardContent>
      </Card>

      <div className="pb-8 text-center text-sm text-muted-foreground">
        Data Share Space &mdash; 카테고리 기반 파일 공유 플랫폼
      </div>
    </main>
  );
}

function methodVariant(method: string) {
  switch (method) {
    case "GET":
      return "outline" as const;
    case "POST":
      return "default" as const;
    case "PUT":
    case "PATCH":
      return "secondary" as const;
    case "DELETE":
      return "destructive" as const;
    default:
      return "outline" as const;
  }
}

const webPages = [
  {
    path: "/",
    description: "랜딩 페이지 - 카테고리 UUID를 입력하여 접근",
  },
  {
    path: "/categories/{categoryId}",
    description: "카테고리 대시보드 - 전체 카테고리 목록 조회 및 CRUD 관리",
  },
  {
    path: "/categories/{categoryId}/transactions",
    description:
      "트랜잭션 목록 - 해당 카테고리의 모든 업로드 트랜잭션 조회, 처리완료 토글, 삭제",
  },
  {
    path: "/categories/{categoryId}/upload",
    description: "파일 업로드 폼 - 설명 + 다수 파일을 업로드하고 다운로드 URL 발급",
  },
  {
    path: "/download/{transactionId}",
    description:
      "다운로드 페이지 (공개) - 설명 확인, 개별 파일 다운로드, 전체 ZIP 다운로드",
  },
  {
    path: "/docs",
    description: "API 문서 페이지 (현재 페이지)",
  },
];

interface Endpoint {
  method: string;
  path: string;
  description: string;
  request?: string;
  response?: string;
  curl?: string;
}

const apiSections: { title: string; endpoints: Endpoint[] }[] = [
  {
    title: "카테고리",
    endpoints: [
      {
        method: "GET",
        path: "/api/categories",
        description: "전체 카테고리 목록 조회 (트랜잭션 수 포함)",
        response: `[
  {
    "id": "uuid",
    "title": "카테고리명",
    "createdAt": "...",
    "updatedAt": "...",
    "_count": { "transactions": 3 }
  }
]`,
        curl: "curl http://localhost:3000/api/categories",
      },
      {
        method: "POST",
        path: "/api/categories",
        description: "새 카테고리 생성",
        request: `{
  "title": "카테고리 이름"
}`,
        response: `{
  "id": "uuid",
  "title": "카테고리 이름",
  "createdAt": "...",
  "updatedAt": "..."
}`,
        curl: `curl -X POST http://localhost:3000/api/categories \\
  -H "Content-Type: application/json" \\
  -d '{"title": "새 카테고리"}'`,
      },
      {
        method: "GET",
        path: "/api/categories/{id}",
        description: "카테고리 단건 조회 (트랜잭션 목록 포함)",
        curl: "curl http://localhost:3000/api/categories/{uuid}",
      },
      {
        method: "PUT",
        path: "/api/categories/{id}",
        description: "카테고리 제목 수정",
        request: `{
  "title": "수정된 이름"
}`,
        curl: `curl -X PUT http://localhost:3000/api/categories/{uuid} \\
  -H "Content-Type: application/json" \\
  -d '{"title": "수정된 이름"}'`,
      },
      {
        method: "DELETE",
        path: "/api/categories/{id}",
        description:
          "카테고리 삭제 (관련 트랜잭션 및 파일 CASCADE 삭제)",
        curl: "curl -X DELETE http://localhost:3000/api/categories/{uuid}",
      },
    ],
  },
  {
    title: "파일 업로드",
    endpoints: [
      {
        method: "POST",
        path: "/api/categories/{id}/upload",
        description:
          "파일 업로드 (multipart/form-data) - description + 다수 파일 전송, 다운로드 URL 반환",
        request: `Content-Type: multipart/form-data

Fields:
  description: "설명 텍스트"
  department: "부서명" (선택)
  name: "이름" (선택)
  phone: "연락처" (선택)
  email: "이메일" (선택)
  files: [file1, file2, ...]`,
        response: `{
  "transactionId": "uuid",
  "downloadUrl": "/api/download/{txId}",
  "description": "설명 텍스트",
  "fileCount": 2,
  "completed": true
}`,
        curl: `curl -X POST http://localhost:3000/api/categories/{uuid}/upload \\
  -F "description=설명 텍스트" \\
  -F "department=개발팀" \\
  -F "name=홍길동" \\
  -F "phone=010-1234-5678" \\
  -F "email=hong@example.com" \\
  -F "files=@image.png" \\
  -F "files=@document.docx"`,
      },
    ],
  },
  {
    title: "다운로드",
    endpoints: [
      {
        method: "GET",
        path: "/api/download/{transactionId}",
        description:
          "트랜잭션 메타데이터 + 파일 목록 조회 (download_count 자동 증가)",
        response: `{
  "transaction": {
    "id": "uuid",
    "description": "...",
    "completed": true,
    "processed": false,
    "downloadCount": 1,
    "categoryId": "uuid",
    "categoryTitle": "...",
    "createdAt": "..."
  },
  "files": [
    {
      "id": "uuid",
      "originalName": "file.png",
      "mimeType": "image/png",
      "sizeBytes": 204800,
      "downloadUrl": "/api/download/{txId}/files/{fileId}"
    }
  ],
  "zipUrl": "/api/download/{txId}/zip"
}`,
        curl: "curl http://localhost:3000/api/download/{transactionId}",
      },
      {
        method: "GET",
        path: "/api/download/{transactionId}/files/{fileId}",
        description: "개별 파일 바이너리 다운로드 (Content-Disposition: attachment)",
        curl: "curl -O http://localhost:3000/api/download/{txId}/files/{fileId}",
      },
      {
        method: "GET",
        path: "/api/download/{transactionId}/zip",
        description: "트랜잭션의 전체 파일을 ZIP으로 다운로드",
        curl: "curl -O http://localhost:3000/api/download/{txId}/zip",
      },
    ],
  },
  {
    title: "트랜잭션 관리",
    endpoints: [
      {
        method: "GET",
        path: "/api/categories/{id}/transactions",
        description: "해당 카테고리의 트랜잭션 목록 조회",
        curl: "curl http://localhost:3000/api/categories/{uuid}/transactions",
      },
      {
        method: "PATCH",
        path: "/api/transactions/{id}/process",
        description: "트랜잭션 처리완료 상태 변경",
        request: `{
  "processed": true
}`,
        curl: `curl -X PATCH http://localhost:3000/api/transactions/{uuid}/process \\
  -H "Content-Type: application/json" \\
  -d '{"processed": true}'`,
      },
      {
        method: "DELETE",
        path: "/api/transactions/{id}",
        description: "트랜잭션 1건 삭제 (관련 파일 포함)",
        curl: "curl -X DELETE http://localhost:3000/api/transactions/{uuid}",
      },
      {
        method: "DELETE",
        path: "/api/categories/{id}/transactions",
        description: "해당 카테고리의 모든 트랜잭션 일괄 삭제",
        curl: "curl -X DELETE http://localhost:3000/api/categories/{uuid}/transactions",
      },
    ],
  },
];

const dbTables = [
  {
    name: "categories",
    columns: [
      { name: "id", type: "UUID (PK)" },
      { name: "title", type: "VARCHAR(255)" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "transactions",
    columns: [
      { name: "id", type: "UUID (PK)" },
      { name: "category_id", type: "UUID (FK)" },
      { name: "description", type: "TEXT" },
      { name: "department", type: "VARCHAR(255)?" },
      { name: "name", type: "VARCHAR(255)?" },
      { name: "phone", type: "VARCHAR(50)?" },
      { name: "email", type: "VARCHAR(255)?" },
      { name: "completed", type: "BOOLEAN" },
      { name: "processed", type: "BOOLEAN" },
      { name: "download_count", type: "INTEGER" },
      { name: "created_at", type: "TIMESTAMPTZ" },
      { name: "updated_at", type: "TIMESTAMPTZ" },
    ],
  },
  {
    name: "files",
    columns: [
      { name: "id", type: "UUID (PK)" },
      { name: "transaction_id", type: "UUID (FK)" },
      { name: "original_name", type: "VARCHAR(512)" },
      { name: "stored_name", type: "VARCHAR(512)" },
      { name: "mime_type", type: "VARCHAR(255)" },
      { name: "size_bytes", type: "BIGINT" },
      { name: "storage_path", type: "TEXT" },
      { name: "created_at", type: "TIMESTAMPTZ" },
    ],
  },
];
