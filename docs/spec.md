# Book Frontend 서비스 명세

## 개요

개인 도서 관리 웹 서비스. 도서 등록/조회/수정/삭제, 독서 기록, 메모, 통계 기능을 제공한다.

- **Tech Stack**: React 19, Vite, TanStack Query, React Router DOM, React Hook Form + Zod, Tailwind CSS, Axios
- **API Base URL**: `/api` (Vite 프록시 → `http://localhost:4000`)

---

## 주요 기능

### 도서 목록 (BookList)
- 상태 탭 필터: 전체 / 소장 중 / 읽는 중 / 완독 / 읽기 제외 / 판매 / 기부
- 키워드 검색: 제목, 저자, ISBN
- 장르 필터
- 정렬: 등록일 / 제목 / 구입일 × 오름/내림차순

### 도서 등록/수정 (BookForm)
- 필수: 제목, 저자
- 선택: 출판사, ISBN, 장르, 상태, 구입일, 표지 이미지 URL
- 표지 이미지 URL 입력 시 미리보기 제공
- 유효성 검증: React Hook Form + Zod

### 도서 상세 (BookDetail)
- 도서 정보 표시 + 수정/삭제
- **독서 기록 탭**: 시작일, 종료일, 별점(1~5), 감상문 관리
- **메모 탭**: 내용, 페이지 번호 관리

### 통계 (Stats)
- 요약 카드: 전체 도서 수, 완독 수, 읽는 중 수, 평균 별점
- 월별 완독 수 (최근 12개월 막대 차트)
- 상태별/장르별/별점별 분포 차트

---

## 프로젝트 구조

```
bookfrontend/
├── public/
├── src/
│   ├── api/                       # Axios API 호출 모듈
│   ├── assets/                    # 정적 파일 (이미지, SVG)
│   ├── components/                # 공통 재사용 컴포넌트
│   ├── constants/                 # 상수 정의
│   ├── hooks/                     # React Query 커스텀 훅
│   ├── pages/                     # 페이지 컴포넌트
│   ├── App.jsx                    # 라우팅 설정
│   ├── App.css                    # 앱 스타일
│   ├── index.css                  # 글로벌 스타일 (Tailwind)
│   └── main.jsx                   # 진입점 (React Query Provider)
└── docs/
```

---

## 라우팅

| 경로 | 페이지 | 설명 |
|------|--------|------|
| `/` | redirect | `/books`로 리다이렉트 |
| `/books` | BookList | 도서 목록 (검색, 필터, 정렬) |
| `/books/new` | BookForm | 도서 등록 |
| `/books/:id` | BookDetail | 도서 상세 + 독서기록/메모 탭 |
| `/books/:id/edit` | BookForm | 도서 수정 |
| `/stats` | Stats | 통계 대시보드 |

---

## API 엔드포인트

### 도서 (Books)

| 메서드 | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| GET | `/api/books` | 도서 목록 조회 | query: `status`, `genre`, `search`, `sortBy`, `order`, `include` | `{ data: Book[], total: number }` |
| GET | `/api/books/:id` | 도서 상세 조회 | - | `{ data: Book }` |
| POST | `/api/books` | 도서 등록 | `{ title, author, publisher?, isbn?, genre?, coverImageUrl?, purchaseDate?, status }` | `{ data: Book }` |
| PUT | `/api/books/:id` | 도서 수정 | 등록과 동일 (부분 허용) | `{ data: Book }` |
| DELETE | `/api/books/:id` | 도서 삭제 | - | - |

### 독서 기록 (reading-logs)

| 메서드 | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| GET | `/api/books/:bookId/reading-logs` | 독서 기록 목록 | - | `{ data: Reading[] }` |
| POST | `/api/books/:bookId/reading-logs` | 독서 기록 추가 | `{ userName, startDate, endDate?, rating?, review? }` | `{ data: Reading }` |
| PUT | `/api/books/:bookId/reading-logs/:id` | 독서 기록 수정 | 추가와 동일 (부분 허용) | `{ data: Reading }` |
| DELETE | `/api/books/:bookId/reading-logs/:id` | 독서 기록 삭제 | - | - |

### 메모 (Memos)

| 메서드 | 경로 | 설명 | 요청 | 응답 |
|--------|------|------|------|------|
| GET | `/api/books/:bookId/memos` | 메모 목록 | - | `{ data: Memo[] }` |
| POST | `/api/books/:bookId/memos` | 메모 추가 | `{ content, page? }` | `{ data: Memo }` |
| PUT | `/api/books/:bookId/memos/:id` | 메모 수정 | `{ content?, page? }` | `{ data: Memo }` |
| DELETE | `/api/books/:bookId/memos/:id` | 메모 삭제 | - | - |

### 통계 (Stats)

| 메서드 | 경로 | 설명 | 응답 |
|--------|------|------|------|
| GET | `/api/stats` | 통계 조회 | `{ totalBooks, byStatus, byGenre, byMonth, avgRating, ratingDistribution }` |

---

## 데이터 모델

### Book

```json
{
  "id": "number",
  "title": "string",
  "author": "string",
  "publisher": "string | null",
  "isbn": "string | null",
  "genre": "string | null",
  "coverImageUrl": "string | null",
  "purchaseDate": "date-string | null",
  "status": "OWNED | SOLD | DONATED",
  "createdAt": "ISO-8601",
  "readStatus": "string | null"
}
```

> `readStatus`는 `reading_logs` 테이블 조인 값으로, 도서 목록 조회 시 `include=readStatus` 쿼리 파라미터를 전달할 때 포함된다.

### Reading

```json
{
  "id": "number",
  "bookId": "number",
  "userName": "string",
  "startDate": "date-string",
  "endDate": "date-string | null",
  "rating": "number (1~5) | null",
  "review": "string | null"
}
```

### Memo

```json
{
  "id": "number",
  "bookId": "number",
  "content": "string",
  "page": "number | null",
  "createdAt": "ISO-8601"
}
```

### Stats

```json
{
  "totalBooks": "number",
  "byStatus": { "OWNED": "number", "READING": "number", "DONE": "number", "...": "number" },
  "byGenre": { "소설": "number", "자기계발": "number", "...": "number" },
  "byMonth": { "YYYY-MM": "number" },
  "avgRating": "number",
  "ratingDistribution": { "1": "number", "2": "number", "3": "number", "4": "number", "5": "number" }
}
```

## 상태 코드

| 코드 | 레이블 |
|------|--------|
| `OWNED` | 소장 중 |
| `SOLD` | 판매 |
| `DONATED` | 기부 |
