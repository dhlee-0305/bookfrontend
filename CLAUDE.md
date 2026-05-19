# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## 서비스 명세
@docs/spec.md

---

## 개발 명령어

```bash
npm run dev       # 개발 서버 시작 (Vite, host: true로 외부 접속 허용)
npm run build     # 프로덕션 빌드
npm run lint      # ESLint 실행
npm run preview   # 빌드 결과 미리보기
```

백엔드 서버(`http://localhost:4000`)가 실행 중이어야 API 요청이 정상 동작한다.
Vite 개발 서버는 `/api` 요청을 `http://localhost:4000`으로, `/kakao` 요청을 Kakao API로 프록시한다.

---

## 아키텍처

### 인증 흐름
- `AuthContext` (`src/context/AuthContext.jsx`): 앱 진입 시 `/api/auth/me`를 호출해 로그인 상태를 초기화한다.
  - `user === undefined`: 초기화 전 (로딩 중)
  - `user === null`: 비로그인
  - `user === { ... }`: 로그인된 사용자 객체
- `Layout` 컴포넌트가 인증 보호 역할을 한다. `/login`, `/signup`은 Layout 바깥에 배치되어 있고, 나머지 모든 경로는 Layout 안에서 처리된다.
- `useAuth()` 훅으로 어디서든 `{ user, login, logout }` 접근 가능.

### 데이터 패칭 패턴
- `src/api/client.js`: Axios 인스턴스 (baseURL `/api`, `withCredentials: true`). 응답 인터셉터에서 `res.data`를 unwrap하고, 에러는 서버 메시지를 담은 `Error` 객체로 변환한다.
- `src/api/*.js`: 도메인별 API 함수 (auth, books, memos, readings, stats).
- `src/hooks/use*.js`: TanStack Query 훅으로 캐싱/뮤테이션 처리. 뮤테이션 성공 시 관련 queryKey를 `invalidateQueries`로 무효화한다.

### React Query 키 규약
| 리소스 | queryKey |
|--------|----------|
| 도서 목록 | `['books', params]` |
| 도서 단건 | `['book', id]` |
| 독서 기록 | `['readings', bookId]` |
| 메모 | `['memos', bookId]` |
| 통계 | `['stats', params]` |

### 상태 관리
- 서버 상태: TanStack Query (staleTime 30초, retry 1회)
- 클라이언트 UI 상태: `useState` (toast, modal, activeTab 등)
- 전역 인증 상태: `AuthContext`

### 컴포넌트 구조
- `Toast`: 3초 후 자동 닫힘. `onToast(message, type)` 콜백으로 페이지에서 호출.
- `ConfirmModal`: 삭제 확인용 모달.
- `BookStatusBadge`: 도서 소장 상태(OWNED/SOLD/DONATED) 배지.
- `ReadingTab` / `MemoTab`: BookDetail 페이지 내 탭 컴포넌트. `bookId`와 `onToast` prop을 받는다.

### 상수
`src/constants/book.js`에 `BOOK_STATUS`, `GENRE_OPTIONS`, `READ_STATUS_OPTIONS`, `SORT_OPTIONS`가 정의되어 있다. 새 장르나 상태 추가 시 이 파일을 수정한다.

---

## 사용 기술

| 역할 | 라이브러리 |
|------|-----------|
| UI 프레임워크 | React 19 |
| 빌드 | Vite 8 |
| 라우팅 | react-router-dom v7 |
| 서버 상태 | @tanstack/react-query v5 |
| API 통신 | Axios |
| 폼/검증 | react-hook-form + zod + @hookform/resolvers |
| 스타일 | Tailwind CSS v4 (Vite 플러그인 방식) |
| 린트 | ESLint |
