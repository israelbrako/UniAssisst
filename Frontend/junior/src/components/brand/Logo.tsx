import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/uniasssistlogo.png";
import { cn } from "@/lib/utils";

export function Logo({
  tone = "light",
  className,
  to = "/",
  showWordmark = true,
}: {
  tone?: "light" | "dark";
  className?: string;
  to?: string;
  showWordmark?: boolean;
}) {
  return (
    <Link
      to={to}
      className={cn("flex shrink-0 items-center gap-2.5", className)}
      aria-label="UniAssist home"
    >
      <span className="grid size-9 place-items-center overflow-hidden rounded-lg bg-ink ring-1 ring-mint/15">
        <img src={logoImg} alt="" aria-hidden className="size-9 object-cover" />
      </span>
      {showWordmark && (
        <span className="min-w-0">
          <span
            className={cn(
              "block text-[17px] leading-none font-extrabold tracking-tight",
              tone === "dark" ? "text-ivory" : "text-foreground",
            )}
          >
            Uni<span className="text-emerald">Assist</span>
          </span>
        </span>
      )}
    </Link>
  );
}
