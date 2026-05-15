import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import markerIcon2x from "leaflet/dist/images/marker-icon-2x.png";
import markerIcon from "leaflet/dist/images/marker-icon.png";
import markerShadow from "leaflet/dist/images/marker-shadow.png";

L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon2x,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export interface MapPoint {
  id: string;
  name: string;
  city: string | null;
  type: string | null;
  latitude: number;
  longitude: number;
}

const TYPE_LABELS: Record<string, string> = {
  studio: "Studio",
  salle_evenement: "Salle d'événement",
  coworking: "Coworking",
};

export default function LieuxMap({ points }: { points: MapPoint[] }) {
  const center: [number, number] =
    points.length > 0 ? [points[0].latitude, points[0].longitude] : [46.6, 2.5];
  return (
    <MapContainer
      center={center}
      zoom={points.length > 0 ? 6 : 5}
      style={{ height: "100%", width: "100%" }}
      scrollWheelZoom={false}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      {points.map((l) => (
        <Marker key={l.id} position={[l.latitude, l.longitude]}>
          <Popup>
            <div className="text-sm">
              <p className="font-semibold">{l.name}</p>
              {l.city && <p className="text-xs">{l.city}</p>}
              {l.type && <p className="text-xs mt-1">{TYPE_LABELS[l.type] ?? l.type}</p>}
            </div>
          </Popup>
        </Marker>
      ))}
    </MapContainer>
  );
}
