export type ProviderDebugFlags = {
  noAuth?: boolean;
  noLanguage?: boolean;
  noQuery?: boolean;
};

export function getProviderDebugFlags(): ProviderDebugFlags {
  if (typeof window === "undefined") return {};
  const params = new URLSearchParams(window.location.search);
  return {
    noAuth: params.get("noAuth") === "1",
    noLanguage: params.get("noLang") === "1",
    noQuery: params.get("noQuery") === "1",
  };
}
