import { motion } from "framer-motion";
import { ArrowRight } from "lucide-react";
import { Link } from "react-router-dom";
import { GRID_IMAGE } from "../lib/images";
import type { City } from "../types";
import SafeImage from "./SafeImage";

interface CityTileProps {
  city: City;
  index?: number;
  priority?: boolean;
}

export default function CityTile({ city, index = 0, priority = false }: CityTileProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 18 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{
        duration: 0.4,
        delay: Math.min(index * 0.05, 0.35),
        ease: [0.22, 1, 0.36, 1],
      }}
    >
      <Link
        to={`/adventures?city=${encodeURIComponent(city.id)}`}
        className="group relative block overflow-hidden rounded-card shadow-card transition-shadow duration-300 hover:shadow-lift"
      >
        <SafeImage
          src={city.image}
          alt=""
          sizing={GRID_IMAGE}
          priority={priority}
          className="aspect-[4/3] w-full"
          imgClassName="group-hover:scale-[1.06] duration-700"
        />

        {/*
          A gradient rather than a flat scrim: the text sits over the dark end
          while the top of the photograph stays legible.
        */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/25 to-transparent" />

        <div className="absolute inset-x-0 bottom-0 p-4">
          <h3 className="text-lg font-semibold text-white drop-shadow-sm">
            {city.city}
          </h3>
          <div className="flex items-center justify-between">
            <p className="text-sm text-white/80">
              {city.adventureCount > 0
                ? `${city.adventureCount} ${city.adventureCount === 1 ? "adventure" : "adventures"}`
                : city.description}
            </p>
            <ArrowRight
              className="size-4 text-white transition-transform duration-300 group-hover:translate-x-1"
              aria-hidden="true"
            />
          </div>
        </div>
      </Link>
    </motion.div>
  );
}
