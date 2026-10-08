import {
  Cloud,
  CloudDrizzle,
  CloudFog,
  CloudLightning,
  CloudRain,
  CloudSun,
  Snowflake,
  Sun,
  type LucideIcon,
} from "lucide-react";
import { useForecast } from "../hooks/queries";
import { cn } from "../lib/cn";
import type { WeatherCondition } from "../types";

const ICONS: Record<WeatherCondition, LucideIcon> = {
  clear: Sun,
  "partly-cloudy": CloudSun,
  cloudy: Cloud,
  fog: CloudFog,
  drizzle: CloudDrizzle,
  rain: CloudRain,
  snow: Snowflake,
  thunderstorm: CloudLightning,
};

const TINTS: Record<WeatherCondition, string> = {
  clear: "text-amber-500",
  "partly-cloudy": "text-amber-500",
  cloudy: "text-ink-muted",
  fog: "text-ink-muted",
  drizzle: "text-sky-500",
  rain: "text-sky-600",
  snow: "text-sky-400",
  thunderstorm: "text-violet-500",
};

interface WeatherBadgeProps {
  city: string | undefined;
  /** YYYY-MM-DD, the calendar day of the trip. */
  date: string | undefined;
  className?: string;
}

/**
 * The forecast for a trip's day, when there is one.
 *
 * Renders nothing while loading, beyond the 16-day forecast window, or when the
 * weather service is down - it is a nicety, and a spinner or an error in its
 * place would draw more attention than the forecast itself deserves.
 */
export default function WeatherBadge({ city, date, className }: WeatherBadgeProps) {
  const { data } = useForecast(city, date);

  if (!data?.available) return null;

  const Icon = ICONS[data.condition];
  const rainy = data.precipitationChance !== null && data.precipitationChance >= 40;

  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full bg-surface-inset px-2.5 py-1 text-xs font-medium text-ink-soft",
        className
      )}
      title={`Forecast: ${data.summary}, ${data.tempMin}°–${data.tempMax}°C`}
    >
      <Icon className={cn("size-3.5", TINTS[data.condition])} aria-hidden="true" />
      <span>
        {data.summary} · {data.tempMax}°/{data.tempMin}°C
        {rainy && <span className="text-sky-600 dark:text-sky-400"> · {data.precipitationChance}% rain</span>}
      </span>
    </span>
  );
}
