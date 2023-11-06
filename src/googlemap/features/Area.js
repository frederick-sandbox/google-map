/*global google*/
import { useState, useEffect } from "react";
import {
  convertGooglePolygonPathsToCoordinates,
  convertGeoJSONCoordinatesToGooglePolygonPaths,
} from "./AreaUtils";

export const OCArea = ({
  feature,
  map,
  updateFeature,
  isVisible,
  isSelectable,
  isSelected,
  setSelected,
}) => {
  const [area, setArea] = useState(null);
  const [listeners, setListeners] = useState([]);
  const styles = feature.properties.styles;

  // setup
  useEffect(() => {
    if (area) return; // prevent double render

    const polygon = new google.maps.Polygon({
      map,
      //   paths: geojsonCoordinatesToPaths(feature.geometry.coordinates),
      paths: convertGeoJSONCoordinatesToGooglePolygonPaths(
        feature.geometry.coordinates
      ),
      strokeColor: styles.stroke.color,
      strokeWeight: styles.stroke.weight,
      strokeOpacity: styles.stroke.opacity,
      fillColor: styles.fill.color,
      fillOpacity: styles.fill.opacity,
    });
    setArea(polygon);

    // cleanup
    return () => polygon.setMap(null);
  }, []);

  // update props and listeners
  useEffect(() => {
    if (!area) return;

    listeners && listeners.map((listener) => listener.remove());

    area.setEditable(false);
    area.setDraggable(false);
    area.setPaths(
      // add or remove cut-outs
      convertGeoJSONCoordinatesToGooglePolygonPaths(
        feature.geometry.coordinates
      )
    );
    area.setOptions({
      strokeColor: styles.stroke.color,
      strokeWeight: styles.stroke.weight,
      strokeOpacity: styles.stroke.opacity,
      fillColor: styles.fill.color,
      fillOpacity: styles.fill.opacity,
    });
    area.setVisible(isVisible);

    if (isVisible && isSelectable) {
      const listeners = [
        google.maps.event.addListener(area, "click", setSelected),
      ];
      if (isSelected) {
        area.setDraggable(true);
        area.setEditable(true);

        const setNewCoordinates = (idx) =>
          updateFeature(feature.properties.id, {
            ...feature,
            geometry: {
              ...feature.geometry,
              coordinates: convertGooglePolygonPathsToCoordinates(area),
            },
          });

        listeners.push(
          ...area
            .getPaths()
            .getArray()
            .flatMap((path, idx) => [
              // idx = 0 is the outer polygon, all others are inner cut-outs
              // ordered according to their cration times
              google.maps.event.addListener(path, "set_at", () =>
                setNewCoordinates(idx)
              ),
              google.maps.event.addListener(path, "insert_at", () =>
                setNewCoordinates(idx)
              ),
              // any vertex is removed from the line
              google.maps.event.addListener(path, "remove_at", () =>
                setNewCoordinates(idx)
              ),
            ])
        );
      }
      setListeners(listeners);
    }
  }, [feature, styles, map, area, isVisible, isSelectable, isSelected]);
};
