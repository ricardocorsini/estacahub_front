import "./BrandMark.css";

export default function BrandMark({ compact = false }) {
  return (
    <span
      className={`landing-brand-mark ${compact ? "h-8 w-8 rounded-[10px]" : "h-9 w-9 rounded-xl"}`}
      aria-hidden="true"
    >
      <span className="landing-brand-line landing-brand-line-1" />
      <span className="landing-brand-line landing-brand-line-2" />
      <span className="landing-brand-line landing-brand-line-3" />
      <span className="landing-brand-dot" />
    </span>
  );
}
