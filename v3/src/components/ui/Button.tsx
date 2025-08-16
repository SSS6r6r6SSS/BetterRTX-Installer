import cx from "classix";

export default function Button({
  children,
  theme = null,
  size = null,
  disabled = false,
  block = false,
  ...rest
}: {
  children: React.ReactNode;
  theme?: "primary" | "secondary" | null;
  size?: "sm" | "md" | "lg" | null;
  disabled?: boolean;
  block?: boolean;
  [key: string]: any;
}) {
  return (
    <button
      className={cx(
        "btn",
        theme === "primary" && "btn--primary",
        theme === "secondary" && "btn--secondary",
        size === "sm" && "btn--sm",
        size === "md" && "btn--md",
        size === "lg" && "btn--lg",
        block && "w-full",
        !disabled && "cursor-pointer"
      )}
      type="button"
      disabled={disabled}
      {...rest}
    >
      <span className="btn__wrapper">{children}</span>
    </button>
  );
}
