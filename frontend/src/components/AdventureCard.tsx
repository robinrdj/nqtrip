import { Link } from "react-router-dom";
import SafeImage from "./SafeImage";
import { formatCurrency } from "../lib/format";
import { GRID_IMAGE } from "../lib/images";
import type { Adventure } from "../types";

export default function AdventureCard({
  adventure,
  priority = false,
}: {
  adventure: Adventure;
  priority?: boolean;
}) {
  return (
    <div className="col-lg-3 col-md-4 col-sm-6 mb-4">
      <Link
        className="activity-card"
        to={`/adventures/${adventure.id}`}
        id={adventure.id}
      >
        <SafeImage
          className="activity-card-img"
          src={adventure.image}
          alt={adventure.name}
          sizing={GRID_IMAGE}
          priority={priority}
        />
        <span className="category-badge">{adventure.category}</span>
        <div className="activity-card-body">
          <div className="activity-card-row">
            <h5 className="content-item-left">{adventure.name}</h5>
            <h5 className="content-item-right">
              {formatCurrency(adventure.costPerHead)}
            </h5>
          </div>
          <div className="activity-card-row">
            <p className="content-item-left">Duration</p>
            <p className="content-item-right">{adventure.duration} hours</p>
          </div>
        </div>
      </Link>
    </div>
  );
}
