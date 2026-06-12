# Architecture: bookfrontend

개인 도서 관리 웹 서비스의 프론트엔드 아키텍처 문서.
새 개발자나 AI 에이전트가 프로젝트 구조를 빠르게 이해할 수 있도록 작성되었다.

> **표기 규칙**
> - ✅ 코드에서 직접 확인된 사실
> - ⚠️ 추정 또는 불확실한 사항 (검증 필요)

---

## 1. 프로젝트 개요

쿠키 세션 기반 인증 위에서 동작하는 개인용 React SPA.
도서 등록/조회/수정/삭제, 독서 기록, 메모, 통계 기능을 제공한다.
백엔드(`http://localhost:4000`)가 별도로 필요하며, Vite 프록시로 연결된다.

---

## 2. 시스템 구성 요약

```
브라우저
  └── Vite Dev Server (개발) / 정적 파일 서버 (프로덕션)
        ├── /api/*  → http://localhost:4000  (백엔드 REST API)
        └── /kakao/* → https://dapi.kakao.com  (카카오 도서 검색 API)
```

프론트엔드는 순수 클라이언트 사이드 렌더링(CSR) SPA다.
서버 사이드 렌더링(SSR)이나 정적 사이트 생성(SSG)은 사용하지 않는다. ✅

---

## 3. 주요 디렉터리와 책임

```
src/
├── main.jsx          # 앱 진입점. QueryClient, React.StrictMode 설정
├── App.jsx           # 라우팅 트리 정의. Provider 조합
├── api/              # Axios 기반 HTTP 함수 (도메인별 분리)
│   ├── client.js     # Axios 인스턴스: baseURL, withCredentials, 에러 정규화
│   ├── auth.js       # 인증 API (me, login, logout, signup)
│   ├── books.js      # 도서 CRUD
│   ├── readings.js   # 독서 기록 CRUD
│   ├── memos.js      # 메모 CRUD
│   └── stats.js      # 통계 조회
├── hooks/            # TanStack Query 훅 (캐시 + 뮤테이션 래퍼)
│   ├── useBooks.js
│   ├── useReadings.js
│   ├── useMemos.js
│   └── useStats.js
├── context/
│   └── AuthContext.jsx  # 전역 인증 상태 (user, login, logout)
├── pages/            # 라우트 단위 뷰 컴포넌트
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── BookList.jsx
│   ├── BookForm.jsx  # 등록·수정 겸용 (isEdit = !!id)
│   ├── BookDetail.jsx
│   └── Stats.jsx
├── components/       # 재사용 UI 컴포넌트
│   ├── Layout.jsx        # 공통 헤더 + 메인 래퍼
│   ├── BookCard.jsx      # 목록 카드 (인라인 상태 변경/삭제 포함)
│   ├── BookStatusBadge.jsx
│   ├── ReadingTab.jsx    # 독서 기록 탭 (내부에 Form/Item 컴포넌트 포함)
│   ├── MemoTab.jsx       # 메모 탭 (내부에 Form/Item 컴포넌트 포함)
│   ├── Toast.jsx         # 3초 자동 닫힘 알림
│   └── ConfirmModal.jsx  # 삭제 확인 모달
└── constants/
    └── book.js       # BOOK_STATUS, GENRE_OPTIONS, READ_STATUS_OPTIONS, SORT_OPTIONS
```

---

## 4. 애플리케이션 진입점

```
index.html
  └── src/main.jsx
        ├── QueryClientProvider (staleTime: 30s, retry: 1)
        └── App.jsx
              ├── BrowserRouter
              └── AuthProvider
                    ├── /login  → <Login />       (Layout 바깥, 인증 불필요)
                    ├── /signup → <Signup />       (Layout 바깥, 인증 불필요)
                    └── /*      → <Layout>         (공통 헤더 포함)
                                    ├── /          → redirect /books
                                    ├── /books     → <BookList />
                                    ├── /books/new → <BookForm />
                                    ├── /books/:id → <BookDetail />
                                    ├── /books/:id/edit → <BookForm />
                                    └── /stats     → <Stats />
```

`AuthProvider`는 마운트 시 `/api/auth/me`를 호출해 세션 유효 여부를 확인한다. ✅

---

## 5. 주요 모듈과 의존 관계

### 5-1. 인증 흐름

```
AuthProvider (mount)
  → fetchMe() → GET /api/auth/me
  → 성공: setUser(res.data)  /  실패: setUser(null)

useAuth() → { user, login, logout }
  user === undefined  : 초기화 전 (로딩 중)
  user === null       : 비로그인
  user === { ... }    : 로그인된 사용자 객체
```

`Login.jsx`는 React Hook Form을 사용하지 않고 `useState`로 직접 폼을 관리한다. ✅
로그인 성공 후 `location.state?.from`이 있으면 해당 경로로 복귀한다. ✅

### 5-2. API 레이어

```
pages / components
  └── hooks/use*.js          (TanStack Query)
        └── api/*.js          (도메인 함수)
              └── api/client.js  (Axios 인스턴스)
                    └── /api/*   (Vite 프록시 → :4000)
```

`client.js` 응답 인터셉터는 두 가지 역할을 한다. ✅
- 성공: `res.data` unwrap → 훅에서 `data.data` 형태로 접근
- 실패: `err.response?.data?.message` 추출 후 `new Error(message)` 반환

### 5-3. 서버 상태 캐시 (TanStack Query)

| queryKey | 대상 | 무효화 트리거 |
|----------|------|--------------|
| `['books', params]` | 도서 목록 | createBook, updateBook, deleteBook |
| `['book', id]` | 도서 단건 | updateBook(해당 id), deleteBook |
| `['readings', bookId]` | 독서 기록 | createReading, updateReading, deleteReading |
| `['memos', bookId]` | 메모 | createMemo, updateMemo, deleteMemo |
| `['stats', email]` | 통계 | 없음 (명시적 무효화 없음) ⚠️ |

뮤테이션 성공 시 해당 queryKey를 `invalidateQueries`로 무효화해 즉시 리패치한다. ✅

### 5-4. 상태 관리 분류

| 종류 | 수단 |
|------|------|
| 서버 데이터 | TanStack Query |
| 전역 인증 | AuthContext (`useState`) |
| UI 상태 (모달, 토스트, 탭, 폼) | 각 컴포넌트 `useState` |
| URL/라우팅 상태 | `location.state` (페이지 번호 복원 등) |

---

## 6. 데이터 모델 및 주요 데이터 흐름

### 핵심 엔티티

```
User       { id, email, createdAt }
Book       { id, title, author, publisher, isbn, genre, coverUrl,
             purchaseDate, status(OWNED|SOLD|DONATED), createdAt, updatedAt }
Reading    { id, bookId, userName, readStatus(READ|EXCLUDED),
             startDate, endDate, rating(1~5), review, createdAt, updatedAt }
Memo       { id, bookId, content, page, createdAt, updatedAt }
```

### 도서 목록 필터링 흐름

```
BookList filters state
  → activeFilters 계산 (빈 값 제거)
  → readStatus 있으면 userName = user.email 추가  ← 사용자별 독서 상태 필터
  → useBooks({ ...activeFilters, page, limit })
  → GET /api/books?status=&genre=&search=&readStatus=&userName=&sortBy=&order=&page=&limit=
```

### 통계 데이터 흐름

```
useStats()
  → user.email을 쿼리 파라미터로 전달
  → GET /api/stats?email=...
  → Stats.jsx: statusCounts, genreCounts, yearlyReading, avgRating, ratingDistribution 시각화
```

---

## 7. 외부 시스템 연동

### 7-1. 백엔드 REST API

- **주소**: `http://localhost:4000` (개발 시 Vite 프록시, 프로덕션 배포 설정 미확인 ⚠️)
- **인증**: 쿠키 기반 세션 (`withCredentials: true`)
- **응답 형식**: `{ success, data, total? }` 래핑 구조

### 7-2. 카카오 도서 검색 API

- **용도**: `BookForm`의 수정 화면에서 ISBN 누락 또는 표지 없을 때 자동 검색, 결과 선택 시 ISBN/표지 URL 자동 입력 ✅
- **엔드포인트**: `GET /kakao/v3/search/book` (Vite가 `https://dapi.kakao.com`으로 프록시)
- **인증**: `KakaoAK {API_KEY}` 헤더
- **주의**: API 키(`4cfd15ad1eb6a00389c157129df7f245`)가 `BookForm.jsx:11`에 하드코딩되어 있다 ✅ → **보안 위험** (아래 섹션 참조)
- **호출 시점**: 수정 화면(`isEdit === true`)에서 `isbn` 또는 `coverUrl`이 없을 때만 호출 ✅

---

## 8. 인증, 권한, 보안 고려사항

### 인증 구조

- 세션 쿠키 기반. 프론트엔드는 쿠키를 직접 읽지 않고 `withCredentials: true`로 브라우저에 위임한다. ✅
- 앱 초기화 시 `/api/auth/me`로 세션 유효성 검증. 실패 시 `user = null`. ✅

### 인증 가드 미구현 (확인된 리스크)

`Layout.jsx`는 `user` 상태와 무관하게 자식 컴포넌트를 렌더링한다. ✅
비로그인 사용자가 `/books`, `/stats` 등에 직접 URL로 접근하면:
- 페이지 컴포넌트는 렌더링된다.
- API 요청이 백엔드에서 401을 반환하면 에러 UI가 표시된다.
- 자동으로 `/login`으로 리다이렉트되지 않는다.

→ `Layout` 또는 개별 페이지에서 `user === null`일 때 `/login`으로 리다이렉트하는 가드 로직 추가 필요. ⚠️

### 카카오 API 키 노출

`src/pages/BookForm.jsx:11`에 API 키가 소스코드에 직접 포함되어 있다. ✅
번들 결과물(`dist/`)에 그대로 포함되며, GitHub 공개 저장소라면 외부에 노출된다.
→ 환경 변수(`VITE_KAKAO_API_KEY`)로 분리하거나, 백엔드를 통해 프록시할 것을 권장. ⚠️

### 폼 유효성 검증

- `BookForm`: Zod 스키마 + `@hookform/resolvers`로 클라이언트 측 검증. ✅
- `Login`, `Signup`: `useState` 기반 수동 검증 (Zod 미사용). 이메일 형식은 정규식으로 확인. ✅
- 서버 측 검증이 최종 방어선. 클라이언트 검증은 UX 보조 역할. ✅

---

## 9. 배포와 운영 관점의 구조적 고려사항

### 빌드

```bash
npm run build   # dist/ 생성
npm run preview # 빌드 결과 로컬 확인
```

`dist/` 디렉터리가 저장소에 포함되어 있다. ✅ (일반적으로 `.gitignore`에 포함 권장 ⚠️)

### 프로덕션 환경 고려사항

- 개발 서버의 Vite 프록시(`/api → :4000`, `/kakao → dapi.kakao.com`)는 **프로덕션에서 동작하지 않는다.** ⚠️
  - 프로덕션 배포 시 Nginx 등 웹서버에서 동일한 프록시 규칙을 별도로 구성해야 한다.
  - 또는 프론트엔드를 백엔드와 동일 서버에서 서빙하거나, API URL을 환경 변수로 관리해야 한다.
- 현재 `vite.config.js`에 `server.host: true`가 설정되어 있어 WSL 등 로컬 네트워크 외부 접속이 허용된다. ✅

### 패키지 구성 특이사항

`package.json`에 `@rolldown/binding-linux-x64-gnu`와 `@rolldown/binding-win32-x64-msvc`가 `dependencies`에 직접 포함되어 있다. ✅
이는 WSL(Linux) + Windows 이중 환경에서 `node_modules`를 공유할 때 두 플랫폼 바인딩을 모두 설치하기 위한 조치로 추정된다. ⚠️ (일반적으로는 `optionalDependencies`에 넣거나 자동 해결에 맡김)

### 테스트

테스트 파일이 존재하지 않는다. ✅ 단위 테스트, 통합 테스트, E2E 테스트 모두 미구성 상태다.

---

## 10. 알려진 제약, 리스크, 추가 확인 필요 항목

| 항목 | 종류 | 세부 내용 |
|------|------|-----------|
| 프론트엔드 인증 가드 없음 | 리스크 | `Layout`이 비로그인 사용자를 `/login`으로 리다이렉트하지 않음 |
| 카카오 API 키 하드코딩 | 보안 위험 | `BookForm.jsx:11`, 환경 변수 분리 필요 |
| 프로덕션 프록시 미구성 | 배포 리스크 | Vite 프록시는 개발 전용, 프로덕션 대응 없음 |
| 통계 캐시 무효화 없음 | 데이터 정합성 | 도서/독서 기록 변경 후 Stats가 stale 상태 유지 (30초 후 자연 갱신) |
| `dist/` 저장소 포함 | 관리 문제 | 빌드 산출물이 git 추적 대상. `.gitignore` 등록 검토 필요 |
| 테스트 없음 | 품질 리스크 | 자동화된 검증 수단 없음 |
| `ReadingTab` 날짜 버그 | 기능 결함 | `ReadingForm`의 초기값이 `initial?.createdAt`을 `endDate`로 사용 (`ReadingTab.jsx:62`). endDate 표시 목적이면 `initial?.endDate`가 맞을 것으로 추정 ⚠️ |
| 백엔드 구조 미확인 | 추정 | 백엔드는 이 저장소에 포함되지 않음. API 계약은 `docs/spec.md` 기준 |
