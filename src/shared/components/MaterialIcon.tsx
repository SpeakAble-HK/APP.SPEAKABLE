interface MaterialIconProps {
  icon: string;
  filled?: boolean;
  className?: string;
  size?: number;
  weight?: number;
}

export function MaterialIcon({
  icon,
  filled = false,
  className = "",
  size,
  weight,
}: MaterialIconProps) {
  const style: React.CSSProperties = {};
  const settings: string[] = [];

  settings.push(`'FILL' ${filled ? 1 : 0}`);
  settings.push(`'wght' ${weight ?? 400}`);
  settings.push("'GRAD' 0");
  settings.push(`'opsz' ${size ?? 24}`);

  style.fontVariationSettings = settings.join(", ");

  return (
    <span
      className={`material-symbols-outlined ${className}`}
      style={style}
      aria-hidden="true"
    >
      {icon}
    </span>
  );
}
