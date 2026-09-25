import { type ReactElement, useEffect } from "react";
import { Link, useRouteError } from "react-router";
import { SiteShell } from "./SiteShell";

/** A page's code failed to load, typically after a new deploy replaced it. */
function isChunkLoadError(error: unknown): boolean {
  return (
    error instanceof TypeError &&
    /dynamically imported module|module script failed|Failed to fetch/i.test(
      error.message,
    )
  );
}

/**
 * Route error boundary: keeps the site's frame instead of the router's
 * default page, and shows no error details or stack.
 */
export default function RouteError(): ReactElement {
  const error = useRouteError();

  useEffect(() => {
    console.error(error);
  }, [error]);

  const staleChunk = isChunkLoadError(error);

  return (
    <SiteShell>
      <section
        aria-labelledby="route-error-title"
        className="mx-auto max-w-5xl pixel-dot-bg px-6 py-24"
      >
        <div className="max-w-2xl pixel-dialog p-6">
          <h1 className="font-pixel text-[16px]" id="route-error-title">
            <span aria-hidden="true">! </span>
            {staleChunk ? "새 버전이 나왔어요" : "문제가 생겼어요"}
          </h1>
          <p
            className="mt-3 font-pixel-body text-[15px]"
            style={{ color: "var(--text-secondary)" }}
          >
            {staleChunk
              ? "사이트가 방금 업데이트되어 이 페이지를 불러오지 못했어요. 새로 고치면 최신 버전으로 열립니다."
              : "페이지를 그리는 중에 오류가 났어요. 새로 고치거나 홈으로 돌아가 주세요."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <button
              className="pixel-btn text-xs text-[var(--text-primary)]"
              onClick={() => window.location.reload()}
              type="button"
            >
              새로 고침
            </button>
            <Link
              className="pixel-btn text-xs text-[var(--text-primary)]"
              to="/"
            >
              홈으로
            </Link>
          </div>
        </div>
      </section>
    </SiteShell>
  );
}
