
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

## 서비스 명세
@docs/spec.md

---

## 사용 기술
프론트엔드 기본: React 19
빌드/개발 서버: Vite 8
라우팅: react-router-dom
서버 상태 관리: @tanstack/react-query
API 통신: Axios
폼 처리/검증: react-hook-form + zod + @hookform/resolvers
스타일링: Tailwind CSS 4
품질 관리: ESLint