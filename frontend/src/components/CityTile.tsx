import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";
import { GRID_IMAGE } from "../lib/images";
import type { City } from "../types";

export default function CityTile({
  city,
  priority = false,
}: {
  city: City;
  priority?: boolean;
}) {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <Link className="tile" to={`/adventures?city=${city.id}`} id={city.id}>
        <SafeImage
          className="tile-img"
          src={city.image}
          alt={city.city}
          sizing={GRID_IMAGE}
          priority={priority}
        />
        <div className="tile-text">
          <h5>{city.city}</h5>
          <p>{city.description}</p>
        </div>
      </Link>
    </div>
  );
}
