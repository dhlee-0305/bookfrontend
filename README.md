# 📚 내 서재 (Book Frontend)

개인 도서 관리 웹 서비스입니다. 보유 도서를 등록하고 독서 기록, 메모, 통계를 관리할 수 있습니다.

---

## 주요 기능

- **도서 관리**: 도서 등록, 조회, 수정, 삭제
- **독서 기록**: 시작일, 종료일, 별점, 감상문 기록
- **메모**: 도서별 메모 및 페이지 번호 관리
- **통계**: 도서 현황 및 독서 통계 시각화
- **인증**: 이메일 기반 회원가입 / 로그인 (세션 쿠키 방식)

---

## 기술 스택

| 분류 | 사용 기술 |
|------|-----------|
| UI | React 19, Tailwind CSS 4 |
| 빌드 | Vite 8 |
| 라우팅 | React Router DOM 7 |
| 서버 상태 | TanStack Query (React Query) 5 |
| API 통신 | Axios |
| 폼 검증 | React Hook Form + Zod |

---

## 실행 환경 요구사항

- **Node.js** 18 이상
- **npm** 9 이상
- **API 서버** `http://localhost:4000` 에서 실행 중이어야 합니다.

---

## 개발 환경 설정

### 1. 저장소 클론

```bash
git clone <repository-url>
cd bookfrontend
```

### 2. 의존성 설치

```bash
npm install
```

### 3. 개발 서버 실행

```bash
npm run dev
```

브라우저에서 [http://localhost:5173](http://localhost:5173) 접속

> API 요청은 Vite 프록시를 통해 `http://localhost:4000` 으로 전달됩니다.

---

## 빌드 및 미리보기

```bash
# 프로덕션 빌드
npm run build

# 빌드 결과물 로컬 미리보기
npm run preview
```

---

## 코드 품질 검사

```bash
npm run lint
```

---

## 프로젝트 구조

```
src/
├── api/          # Axios API 호출 모듈
├── components/   # 공통 재사용 컴포넌트
├── constants/    # 상수 정의
├── context/      # 전역 상태 (AuthContext)
├── hooks/        # React Query 커스텀 훅
└── pages/        # 페이지 컴포넌트
```

상세 명세는 [docs/spec.md](docs/spec.md)를 참고하세요.
