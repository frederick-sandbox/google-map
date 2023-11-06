/*global google*/

import { useState, useEffect } from "react";
import { v4 as uuid } from "uuid";
import { getStyle, LINE_STYLE } from "../Styles";

/**
 * util to translate polyline's path into geojson coordinates
 */
const getPolylineCoordinates = (polyline) =>
  polyline
    .getPath()
    .getArray()
    .map((path) => [path.lng(), path.lat()]);

/**
 * OC's react component for a line feature
 */
export const OCLine = ({
  feature,
  controls,
  map,
  updateFeature,
  isSelected,
  setSelected,
}) => {
  return (
    <Line
      map={map}
      styles={feature.properties.styles}
      coordinates={feature.geometry.coordinates[0]}
      setCoordinates={(coordinates) => {
        updateFeature(feature.properties.id, {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates: [coordinates],
          },
        });
      }}
      isVisible={controls.visible}
      isSelectable={controls.editable}
      isSelected={isSelected}
      setSelected={setSelected}
    />
  );
};

/**
 * The line feature implementation that interface with Google Map API (polyline)
 */
export const Line = ({
  map,
  styles,
  coordinates,
  setCoordinates,
  isVisible,
  isSelectable,
  isSelected,
  setSelected,
}) => {
  const [line, setLine] = useState(null);
  const [listeners, setListeners] = useState([]);

  // setup
  useEffect(() => {
    // prevent react strict/dev double render
    if (line) return;

    // coordinates are only needed to initialize the google polylline
    // changes to the coordinates are sending back to parent when
    // change events are detected. no need to update the polyline's
    // coordinates - otherwise circular updates will occur
    const path = coordinates.map((c) => ({ lng: c[0], lat: c[1] }));

    const lineObj = new google.maps.Polyline({
      map,
      path,
      strokeColor: getStyle(styles, LINE_STYLE, "strokeColor"),
      strokeWeight: getStyle(styles, LINE_STYLE, "strokeWeight"),
      strokeOpacity: getStyle(styles, LINE_STYLE, "strokeOpacity"),
      // clickable: true, // ok to generate mouse event?
      // editable: true,
      // draggable: true, // use 'dragend' to capture new position
      // visible: true, // visible on the map?
    });
    setLine(lineObj);

    // cleanup
    return () => lineObj.setMap(null);
  }, []);

  // xxx need to useEffect on style change

  // update the line's event listeners
  useEffect(() => {
    if (!line) return;

    listeners && listeners.forEach((listener) => listener.remove());

    line.setEditable(false);
    line.setDraggable(false);
    line.setVisible(isVisible);
    if (isVisible) {
      if (isSelectable) {
        const listeners = [
          google.maps.event.addListener(line, "click", setSelected),
        ];
        if (isSelected) {
          line.setDraggable(true);
          line.setEditable(true);
          // listening "dragend" event is redundant because every drag
          // triggers many "set_at" events, but we also need
          // "set_at" to know that individual vertex's coordinates
          // changed event.
          listeners.push(
            // any vertex's coordinates changed
            google.maps.event.addListener(line.getPath(), "set_at", () =>
              setCoordinates(getPolylineCoordinates(line))
            ),
            // new vertex is added to the line
            google.maps.event.addListener(line.getPath(), "insert_at", () =>
              setCoordinates(getPolylineCoordinates(line))
            ),
            // any vertex is removed from the line
            google.maps.event.addListener(line.getPath(), "remove_at", () =>
              setCoordinates(getPolylineCoordinates(line))
            )
          );
        }
        setListeners(listeners);
      }
    }
  }, [line, isVisible, isSelectable, isSelected]);

  return null;
};

/**
 * converting a google overlay into OCLine object in GeoJSON
 */
export const getOcLine = (overlay) => {
  const paths = overlay.getPath().getArray();
  const coordinates = paths.map((path) => [path.lng(), path.lat()]);
  return {
    type: "Feature",
    geometry: {
      type: "LineString",
      coordinates: [coordinates],
    },
    properties: {
      id: uuid(),
      name: `Line-${new Date().getTime()}`,
      type: "Line",
      styles: {
        stroke: {
          color: getStyle({}, LINE_STYLE, "strokeColor"),
          weight: getStyle({}, LINE_STYLE, "strokeWeight"),
          opacity: getStyle({}, LINE_STYLE, "strokeOpacity"),
        },
      },
    },
  };
};
