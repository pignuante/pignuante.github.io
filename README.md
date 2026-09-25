# AI Scream

[![CI](https://github.com/pignuante/pignuante.github.io/actions/workflows/ci.yml/badge.svg)](https://github.com/pignuante/pignuante.github.io/actions/workflows/ci.yml)
[![Deploy](https://github.com/pignuante/pignuante.github.io/actions/workflows/deploy.yml/badge.svg)](https://github.com/pignuante/pignuante.github.io/actions/workflows/deploy.yml)

RPG 게임 화면처럼 꾸민 개인 포트폴리오와 여행 기록 사이트입니다. GitHub Pages에 정적 SPA로 배포됩니다.

**https://pignuante.github.io**

| 페이지   | 경로                           | 내용                                                           |
| -------- | ------------------------------ | -------------------------------------------------------------- |
| Home     | `/`                            | 타이틀 화면과 대화창. ↑↓ 키로 메뉴 선택                        |
| About    | `/about`                       | 캐릭터 정보, 잡 트리, 장비(기술 스택), 모험 기록               |
| Projects | `/projects`, `/projects/:slug` | 메인·사이드 퀘스트로 나눈 프로젝트와 픽셀아트 썸네일           |
| Travel   | `/travel`                      | 픽셀 세계 지도(양피지)와 지구본(수정구), 방문자 현재 위치 표시 |
| History  | `/history/`                    | 예전 Jekyll 블로그의 정적 아카이브                             |

## 기술 스택

| 영역       | 사용                                                               |
| ---------- | ------------------------------------------------------------------ |
| UI         | React 19, TypeScript 6, React Router 8 (라우트별 lazy loading)     |
| 빌드       | Vite 8 (SWC plugin)                                                |
| 스타일     | Tailwind CSS v4 (`@theme`, 설정 파일 없음), oklch 디자인 토큰      |
| 애니메이션 | Motion 12 (페이지 전환)                                            |
| 지도       | PixiJS 8 + @pixi/react, d3-geo                                     |
| 품질       | ESLint 10 (perfectionist 정렬 규칙), Prettier, Husky + lint-staged |

## 시작하기

Node.js 22가 필요합니다(CI와 같은 버전).

```bash
npm ci
npm run dev        # http://localhost:5173
```

| 명령                                      | 하는 일                                          |
| ----------------------------------------- | ------------------------------------------------ |
| `npm run dev`                             | 개발 서버                                        |
| `npm run build`                           | 타입 검사(`tsc -b`) 후 `dist/`에 production 빌드 |
| `npm run preview`                         | 빌드 결과를 로컬에서 서빙                        |
| `npm run lint` / `npm run lint:fix`       | ESLint 검사 / 자동 수정                          |
| `npm run format` / `npm run format:check` | Prettier 적용 / 검사                             |
| `npm run bake:world`                      | 세계 지도 격자 다시 굽기 (아래 참고)             |

커밋할 때 pre-commit hook이 staged 파일에 `eslint --fix`와 `prettier --write`를 돌립니다.

## 구조

```text
src/
  App.tsx              라우트 정의 (모든 페이지 lazy)
  components/layout/   Navbar, Footer, 페이지 전환 Layout
  contexts/            색 스킴 상태 (SchemeProvider, useScheme)
  styles/tokens.css    디자인 토큰 (색, 픽셀 테두리·그림자)
  pages/
    home/  about/  projects/  travel/   페이지별 컴포넌트와 데이터
public/
  404.html             GitHub Pages SPA fallback (sessionStorage로 원래 경로 복원)
  history/             예전 블로그 아카이브
  world-grid.png       구운 세계 지도 격자
scripts/               데이터·폰트를 미리 굽는 스크립트
```

### 디자인 토큰과 색 스킴

색은 `src/styles/tokens.css`의 CSS 변수로 씁니다. CSS 변수를 읽지 못하는 PixiJS 지도만 예외로, `src/styles/tokens.ts`와 `src/pages/travel/constants.ts`의 숫자 값을 씁니다. 토큰은 네 층으로 나뉩니다: Primitives(`@theme`) → Schemes(`[data-scheme]`) → Semantics(`:root`) → Pixel System.

색 스킴은 네 가지이고, 헤더의 점 네 개로 바꿉니다. 선택은 `localStorage`에 저장되고, `index.html`의 인라인 스크립트가 첫 화면이 깜빡이지 않게 먼저 적용합니다.

| 스킴                | brand  | accent     |
| ------------------- | ------ | ---------- |
| Aurora Dream (기본) | 라벤더 | 민트       |
| Cotton Sky          | 로즈   | 스카이블루 |
| Matcha Garden       | 녹색   | 연두       |
| Peach Blossom       | 복숭아 | 금색       |

밝은 테마 하나만 씁니다(다크 모드 없음). `tokens.ts`는 `tokens.css`와 같은 값을 유지해야 합니다.

## 미리 굽는 데이터

런타임 번들을 작게 두려고, 무거운 원본 데이터는 스크립트로 한 번 가공해 결과만 커밋합니다.

| 결과물                                                 | 스크립트                          | 원본                                                   |
| ------------------------------------------------------ | --------------------------------- | ------------------------------------------------------ |
| `public/world-grid.png`, `public/world-grid-meta.json` | `npm run bake:world`              | world-atlas 50m (Natural Earth)                        |
| `src/pages/travel/timezone-coords.json`                | `node scripts/bake-timezones.mjs` | tzdb 2026d, ISO 3166 코드표 (고정 커밋, 네트워크 필요) |
| `src/assets/fonts/PignuPixel{14,11}.woff2`             | `scripts/subset-fonts.py`         | Galmuri14, Galmuri11                                   |

폰트 스크립트는 fonttools와 brotli가 필요합니다. 사용법은 스크립트 첫 부분에 있습니다. KS X 1001 밖의 한글 음절처럼 subset에 없는 글자를 새로 쓰면 다시 돌립니다.

## 배포와 CI

| 워크플로     | 언제                   | 하는 일                                                                          |
| ------------ | ---------------------- | -------------------------------------------------------------------------------- |
| `ci.yml`     | main 대상 PR           | lint, typecheck, build, format-check, security(`npm audit` + gitleaks) 병렬 실행 |
| `deploy.yml` | main에 push, 수동 실행 | 빌드 후 GitHub Pages에 배포                                                      |

GitHub Actions는 모두 commit SHA로 고정했습니다. CI 권한은 `contents: read`만, 배포 워크플로는 여기에 Pages 배포용 `pages: write`, `id-token: write`만 더합니다. Dependabot이 npm 의존성(매주 월요일, minor·patch는 하나로 묶음)과 Actions(매월)를 갱신합니다.

## 코드 규칙

- import, JSX props, object key는 알파벳순으로 정렬합니다(`eslint-plugin-perfectionist`). `npm run lint:fix`가 맞춰 줍니다.
- 경로 별칭 `@/*`는 `src/*`를 가리킵니다.
- UI 문구와 주석은 한국어로 써도 됩니다(`<html lang="ko">`).
- 브랜드 이름은 "AI Scream"(단수)입니다.

## 라이선스와 출처

- **폰트:** [Galmuri](https://github.com/quiple/galmuri)(SIL Open Font License 1.1)를 subset한 것입니다. OFL의 Reserved Font Name 조항에 따라 이름을 PignuPixel14 / PignuPixel11로 바꿨습니다. 라이선스 전문은 [`src/assets/fonts/OFL.md`](src/assets/fonts/OFL.md)에 있습니다.
- **지도:** [world-atlas](https://github.com/topojson/world-atlas) (Natural Earth 기반).
- **시간대:** [IANA tz database](https://www.iana.org/time-zones), [lukes/ISO-3166-Countries-with-Regional-Codes](https://github.com/lukes/ISO-3166-Countries-with-Regional-Codes).
