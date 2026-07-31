import { useTranslation } from "react-i18next";

type PageRefreshButtonProps = {
  onRefresh: () => void;
  refreshing?: boolean;
  disabled?: boolean;
};

/** Header action to re-fetch the current browse list. */
export function PageRefreshButton({
  onRefresh,
  refreshing = false,
  disabled = false,
}: PageRefreshButtonProps) {
  const { t } = useTranslation("common");
  return (
    <button
      type="button"
      className="button-secondary page__refresh"
      disabled={disabled || refreshing}
      onClick={onRefresh}
      aria-busy={refreshing || undefined}
    >
      {refreshing ? t("loading") : t("refresh")}
    </button>
  );
}
