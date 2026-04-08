# Data Share Space

카테고리 기반 파일 공유 플랫폼. 인증 없이 카테고리 UUID를 통해 접근하며, 파일 업로드 시 다운로드 URL을 발급합니다.

## Prerequisites

- Node.js 18+
- PostgreSQL 15+
- npm

## 설치 및 실행

```bash
# 1. 저장소 클론
git clone https://github.com/YOUR_USER/data-share-space.git
cd data-share-space

# 2. 의존성 설치
npm install

# 3. 환경 변수 설정
cp .env.example .env
# .env 파일에서 DATABASE_URL을 실제 PostgreSQL 접속 정보로 수정

# 4. 데이터베이스 생성
createdb data_share_space

# 5. 마이그레이션 적용 및 Prisma Client 생성
npx prisma migrate deploy
npx prisma generate

# 6. 업로드 디렉토리 생성
mkdir -p uploads

# 7. 개발 서버 실행
npm run dev

# 또는 프로덕션 빌드
npm run build
npm start
```

## 환경 변수

| 변수 | 설명 | 기본값 |
|------|------|--------|
| `DATABASE_URL` | PostgreSQL 접속 문자열 | - (필수) |
| `UPLOAD_DIR` | 파일 저장 디렉토리 | `uploads` |

## API 엔드포인트

### 카테고리 CRUD

```bash
# 생성
curl -X POST http://localhost:3000/api/categories \
  -H "Content-Type: application/json" \
  -d '{"title": "카테고리 이름"}'

# 목록 조회
curl http://localhost:3000/api/categories

# 단건 조회 (트랜잭션 포함)
curl http://localhost:3000/api/categories/{uuid}

# 수정
curl -X PUT http://localhost:3000/api/categories/{uuid} \
  -H "Content-Type: application/json" \
  -d '{"title": "수정된 이름"}'

# 삭제
curl -X DELETE http://localhost:3000/api/categories/{uuid}
```

### 파일 업로드

```bash
curl -X POST http://localhost:3000/api/categories/{categoryId}/upload \
  -F "description=설명 텍스트" \
  -F "files=@image.png" \
  -F "files=@document.docx"
```

응답:
```json
{
  "transactionId": "uuid",
  "downloadUrl": "/api/download/{transactionId}",
  "fileCount": 2,
  "completed": true
}
```

### 다운로드

```bash
# 트랜잭션 메타데이터 + 파일 목록
curl http://localhost:3000/api/download/{transactionId}

# 개별 파일 다운로드
curl -O http://localhost:3000/api/download/{transactionId}/files/{fileId}

# 전체 파일 ZIP 다운로드
curl -O http://localhost:3000/api/download/{transactionId}/zip
```

### 처리완료 상태 변경

```bash
curl -X PATCH http://localhost:3000/api/transactions/{transactionId}/process \
  -H "Content-Type: application/json" \
  -d '{"processed": true}'
```

### 트랜잭션 목록 조회

```bash
curl http://localhost:3000/api/categories/{categoryId}/transactions
```

## 웹 페이지

| 경로 | 설명 |
|------|------|
| `/` | 카테고리 UUID 입력 페이지 |
| `/categories/{uuid}` | 카테고리 대시보드 (CRUD) |
| `/categories/{uuid}/transactions` | 트랜잭션 목록 |
| `/categories/{uuid}/upload` | 파일 업로드 |
| `/download/{transactionId}` | 다운로드 페이지 (공개) |

## 데이터베이스 스키마

```
categories 1──N transactions 1──N files
```

- **categories**: id(UUID), title
- **transactions**: id(UUID), category_id(FK), description, completed, processed, download_count
- **files**: id(UUID), transaction_id(FK), original_name, stored_name, mime_type, size_bytes, storage_path

## 프로덕션 배포 주의사항

- `uploads/` 디렉토리에 쓰기 권한 필요
- `.env` 파일의 `DATABASE_URL`을 프로덕션 DB로 변경
- 대용량 파일 업로드 시 reverse proxy (nginx)의 `client_max_body_size` 설정 확인
- `uploads/` 디렉토리를 영구 스토리지로 마운트 권장
