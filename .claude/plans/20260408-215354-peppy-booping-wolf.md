---
created_at: 2026-04-08T21:53:54+09:00
global_source: /Users/byoungchullee/.claude/plans/peppy-booping-wolf.md
project_root: /Users/byoungchullee/Project/data-share-space
project_name: data-share-space
---

# Data Share Space - 파일 공유 플랫폼 구축 플랜

## Context

카테고리 기반 파일 공유 시스템을 구축한다. 인증 없이 카테고리 UUID를 통해 접근하며, 파일 업로드 시 다운로드 URL을 발급하는 구조. Next.js App Router + PostgreSQL + Prisma로 구현. 프로젝트는 현재 완전히 비어있는 상태.

## 요구사항 요약

- **카테고리**: UUID PK, title, CRUD
- **트랜잭션**: description, completed(업로드완료), processed(처리완료), download_count, 카테고리 1:N
- **파일**: 파일 위치정보, 트랜잭션 1:N
- **업로드**: description + 다수 파일 → 다운로드 URL 반환
- **다운로드**: URL 통해 description + 전체 파일 다운로드
- **웹 접근**: 카테고리 UUID 필요, 접근 후 카테고리 CRUD 가능
- **인증 없음**

---

## Phase 0: Git Repository 생성 및 초기화

- GitHub 토큰: `~/.env`의 `GITHUB_TOKEN` 사용
- **Public** 리포지토리로 생성

```bash
# 1. Git 초기화
cd /Users/byoungchullee/Project/data-share-space
git init

# 2. GitHub 리포지토리 생성 (gh CLI 사용)
export GITHUB_TOKEN=$(grep GITHUB_TOKEN ~/.env | cut -d= -f2)
gh repo create data-share-space --public --source=. --remote=origin

# 3. .gitignore 생성 후 첫 커밋 & 푸시
```

---

## Phase 1: 프로젝트 초기화

### 1-1. Next.js 프로젝트 생성
```bash
npx create-next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"
```

### 1-2. 의존성 설치
```
@prisma/client, prisma, archiver, @types/archiver
shadcn/ui (init + 컴포넌트)
```

### 1-3. shadcn/ui 컴포넌트 설치
```
button, input, textarea, dialog, alert-dialog, card, badge,
skeleton, sonner, dropdown-menu, separator, breadcrumb, progress, table, tooltip
```

### 1-4. 환경 설정
- **로컬 PostgreSQL** 사용 (사용자 기존 인스턴스)
- `.env.local`: `DATABASE_URL=postgresql://USER:PASS@localhost:5432/data_share_space`, UPLOAD_DIR
- `next.config.js`: bodySizeLimit 50mb 설정
- `.gitignore`: uploads/, .env.local 추가
- DB 생성: `createdb data_share_space` (필요 시)

---

## Phase 2: 데이터베이스 스키마

### ERD
```
categories 1──N transactions 1──N files
```

### Prisma Schema (`prisma/schema.prisma`)

```prisma
model Category {
  id           String        @id @default(uuid()) @db.Uuid
  title        String        @db.VarChar(255)
  createdAt    DateTime      @default(now()) @map("created_at") @db.Timestamptz
  updatedAt    DateTime      @updatedAt @map("updated_at") @db.Timestamptz
  transactions Transaction[]
  @@map("categories")
}

model Transaction {
  id            String   @id @default(uuid()) @db.Uuid
  categoryId    String   @map("category_id") @db.Uuid
  description   String   @default("") @db.Text
  completed     Boolean  @default(false)          // 업로드 완료 여부
  processed     Boolean  @default(false)          // 처리완료 여부 (수신자가 처리)
  downloadCount Int      @default(0) @map("download_count")
  createdAt     DateTime @default(now()) @map("created_at") @db.Timestamptz
  updatedAt     DateTime @updatedAt @map("updated_at") @db.Timestamptz
  category      Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  files         File[]
  @@index([categoryId])
  @@map("transactions")
}

model File {
  id            String      @id @default(uuid()) @db.Uuid
  transactionId String      @map("transaction_id") @db.Uuid
  originalName  String      @map("original_name") @db.VarChar(512)
  storedName    String      @map("stored_name") @db.VarChar(512)
  mimeType      String      @default("application/octet-stream") @map("mime_type") @db.VarChar(255)
  sizeBytes     BigInt      @default(0) @map("size_bytes")
  storagePath   String      @map("storage_path") @db.Text
  createdAt     DateTime    @default(now()) @map("created_at") @db.Timestamptz
  transaction   Transaction @relation(fields: [transactionId], references: [id], onDelete: Cascade)
  @@index([transactionId])
  @@map("files")
}
```

### 파일 저장 구조
```
uploads/{categoryId}/{transactionId}/{uuid}.{ext}
```

---

## Phase 3: Backend API

### 수정 대상 파일 목록

│ 파일 경로                                              │ 메서드
├────────────────────────────────────────────────────────┼─────────────
│ src/lib/prisma.ts                                     │ Prisma 싱글턴
│ src/lib/storage.ts                                    │ 파일 저장/읽기/삭제
│ src/app/api/categories/route.ts                       │ GET, POST
│ src/app/api/categories/[id]/route.ts                  │ GET, PUT, DELETE
│ src/app/api/categories/[id]/upload/route.ts           │ POST (multipart)
│ src/app/api/categories/[id]/transactions/route.ts     │ GET
│ src/app/api/download/[transactionId]/route.ts         │ GET (메타+파일목록)
│ src/app/api/download/[transactionId]/files/[fileId]/route.ts │ GET (파일 스트림)
│ src/app/api/download/[transactionId]/zip/route.ts     │ GET (ZIP 다운로드)
│ src/app/api/transactions/[id]/process/route.ts        │ PATCH (처리완료 토글)

### 핵심 API 흐름

> **모든 API는 웹페이지 + curl/Postman 등 외부 API 호출 모두 지원** (CORS 허용, 인증 없음)

**카테고리 CRUD** — 웹페이지 + API 독립 호출 모두 지원
```bash
# 생성
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"title": "디자인 파일"}'

# 목록 조회
curl http://localhost:3000/api/categories

# 단건 조회
curl http://localhost:3000/api/categories/{uuid}

# 수정
curl -X PUT http://localhost:3000/api/categories/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"title": "수정된 제목"}'

# 삭제
curl -X DELETE http://localhost:3000/api/categories/{uuid}
```

**업로드 (POST /api/categories/:id/upload)** — 웹페이지 + API 독립 호출 모두 지원
- **웹페이지**: Upload 폼에서 description + 파일 선택 후 제출
- **API 직접 호출**: curl/Postman 등으로 multipart/form-data 전송
  ```bash
  curl -X POST http://localhost:3000/api/categories/{uuid}/upload \
    -F "description=설명 텍스트" \
    -F "files=@image1.png" \
    -F "files=@document.docx"
  ```
1. 카테고리 존재 확인
2. `request.formData()` 파싱 (description + files[])
3. Transaction 생성 (completed=false)
4. 각 파일 디스크 저장 + File 레코드 생성
5. Transaction completed=true 갱신
6. `{ transactionId, downloadUrl: "/api/download/{txId}" }` 반환

> **CORS**: API 독립 호출을 위해 CORS 헤더 설정 (모든 origin 허용, 인증 없음)

**다운로드 메타 (GET /api/download/:transactionId)**
1. Transaction + Files 조회
2. download_count 증가
3. description + 파일 목록 반환

**파일 다운로드 (GET /api/download/:txId/files/:fileId)**
- `Content-Disposition: attachment` 헤더로 파일 스트림

**ZIP 다운로드 (GET /api/download/:txId/zip)**
- `archiver` 라이브러리로 전체 파일 ZIP 스트림

**처리완료 업데이트 (PATCH /api/transactions/:id/process)**
- `{ processed: true }` 또는 `{ processed: false }` 토글
- 트랜잭션의 처리완료 상태를 업데이트
- 응답: 갱신된 Transaction 객체 반환

---

## Phase 4: Frontend

### 라우트 구조

│ 경로                                  │ 역할
├───────────────────────────────────────┼──────────────────────────────
│ src/app/page.tsx                      │ 랜딩 - 카테고리 UUID 입력
│ src/app/categories/[categoryId]/      │ 카테고리 대시보드
│   ├── layout.tsx                      │ UUID 검증 게이트
│   ├── page.tsx                        │ 카테고리 목록 + CRUD
│   ├── transactions/page.tsx           │ 트랜잭션 목록
│   └── upload/page.tsx                 │ 업로드 폼
│ src/app/download/[transactionId]/     │ 다운로드 페이지 (공개)
│   └── page.tsx                        │ description + 파일 목록

### 주요 컴포넌트

│ 컴포넌트                        │ 위치                              │ 유형
├─────────────────────────────────┼───────────────────────────────────┼─────────
│ CategoryAccessForm              │ src/components/category/          │ Client
│ CategoryList + CategoryCard     │ src/components/category/          │ Client
│ CreateCategoryDialog            │ src/components/category/          │ Client
│ EditCategoryDialog              │ src/components/category/          │ Client
│ DeleteCategoryAlert             │ src/components/category/          │ Client
│ TransactionList + Card          │ src/components/transaction/       │ Client
│ UploadForm                      │ src/components/upload/            │ Client
│ FileDropZone                    │ src/components/upload/            │ Client
│ FilePreviewList                 │ src/components/upload/            │ Client
│ UploadSuccessDialog             │ src/components/upload/            │ Client
│ FileGrid + FileCard             │ src/components/download/          │ Server
│ DownloadAllButton               │ src/components/download/          │ Client

### 데이터 페칭 전략

│ 페이지              │ 방식                    │ 이유
├─────────────────────┼─────────────────────────┼──────────────────────────
│ 랜딩                │ 없음                    │ 정적 폼
│ 카테고리 대시보드   │ Server Component + DB   │ 초기 렌더링
│ 트랜잭션 목록       │ Server Component + DB   │ 읽기 전용
│ 업로드              │ Client + API route      │ multipart + progress
│ 다운로드            │ Server Component + DB   │ 공개 페이지
│ CRUD mutations      │ Server Actions          │ revalidatePath 연동

---

## Phase 5: 설치/셋업 가이드 (README.md)

새 서버에서 git clone 후 바로 실행할 수 있도록 README.md에 포함할 내용:

- **Prerequisites**: Node.js 18+, PostgreSQL 15+, npm/pnpm
- **설치 절차**:
  1. `git clone` + `npm install`
  2. `.env.local` 생성 (DATABASE_URL 등 환경변수 템플릿)
  3. `createdb data_share_space`
  4. `npx prisma migrate deploy` (마이그레이션 적용)
  5. `npx prisma generate`
  6. `uploads/` 디렉토리 생성
  7. `npm run dev` 또는 `npm run build && npm start`
- **환경변수 설명표**: 각 변수의 역할과 기본값
- **API 엔드포인트 요약표**
- **프로덕션 배포 시 주의사항**: uploads 디렉토리 퍼미션, DB 연결 등

`.env.example` 파일도 함께 생성하여 필요한 환경변수 템플릿 제공

---

## Phase 6: Git Push

```bash
git add .
git commit -m "feat: initial data-share-space implementation"
git push -u origin main
```

---

## 체크리스트

- [ ] Phase 0: Git repo 생성, .gitignore 설정
- [ ] Phase 1: Next.js 초기화, 의존성 설치, shadcn/ui 설정
- [ ] Phase 2: Prisma 스키마 작성, DB 마이그레이션
- [ ] Phase 3-1: lib/prisma.ts, lib/storage.ts 구현
- [ ] Phase 3-2: Category CRUD API
- [ ] Phase 3-3: Upload API (multipart)
- [ ] Phase 3-4: Download API (메타, 파일, ZIP)
- [ ] Phase 4-1: 랜딩 페이지 (카테고리 UUID 입력)
- [ ] Phase 4-2: 카테고리 대시보드 + CRUD UI
- [ ] Phase 4-3: 업로드 폼 (drag & drop, progress)
- [ ] Phase 4-4: 다운로드 페이지
- [ ] Phase 5: README.md 설치/셋업 가이드 + .env.example 작성
- [ ] Phase 6: Git commit & push

## 검증 방법

1. **DB**: `npx prisma studio`로 테이블/관계 확인
2. **API 독립 테스트**: curl로 카테고리 CRUD, 파일 업로드, 다운로드 URL 테스트
3. **Frontend**: 브라우저에서 전체 플로우 (UUID 입력 → 카테고리 CRUD → 업로드 → 다운로드 URL → 다운로드)
4. **ZIP**: 다수 파일 업로드 후 ZIP 다운로드 정상 작동 확인
5. **처리완료**: PATCH API로 processed 토글 → 상태 반영 확인
6. **API 업로드**: curl로 직접 multipart 업로드 → 다운로드 URL 정상 발급 확인

> **셀프 테스트**: 코드 작성 완료 후 dev 서버 실행하여 curl 기반 API 테스트 및 브라우저 확인까지 직접 수행
