/*global google*/

import { useRef, useState, useEffect } from "react";
import { createRoot } from "react-dom/client";
import { v4 as uuid } from "uuid";

/**
 * OC's react component for a text feature
 *
 */
export const OCText = ({
  feature,
  controls,
  map,
  updateFeature,
  isSelected,
  setSelected,
}) => {
  return (
    <Text
      map={map}
      coordinates={feature.geometry.coordinates}
      setCoordinates={(coordinates) => {
        updateFeature(feature.properties.id, {
          ...feature,
          geometry: {
            ...feature.geometry,
            coordinates,
          },
        });
      }}
      isVisible={controls.visible}
      isSelectable={controls.editable}
      isSelected={isSelected}
      setSelected={setSelected}
    >
      <div
        style={
          isSelected
            ? { border: "1px solid yellow", padding: 2 }
            : { border: "1px solid transparent", padding: 2 }
        }
        onClick={(e) => {
          console.log("div clicked");
        }}
      >
        <div style={feature.properties.styles}>{feature.properties.name}</div>
      </div>
    </Text>
  );
};

/**
 * the text feature implementation that interface with Google Map API (using advanced marker)
 */
const Text = ({
  map,
  coordinates,
  setCoordinates,
  isVisible,
  isSelectable,
  isSelected,
  setSelected,
  children, // content to render
}) => {
  const contentRef = useRef();
  const markerRef = useRef();
  const [listeners, setListeners] = useState(null);

  // setup
  useEffect(() => {
    // prevent react strict/dev double render
    if (contentRef.current) return;

    // create a div to render the content
    const content = document.createElement("div");
    contentRef.current = createRoot(content);

    // create custom text marker using advanced marker
    markerRef.current = new google.maps.marker.AdvancedMarkerElement({
      content: content,
      position: { lng: coordinates[0], lat: coordinates[1] },
      gmpDraggable: false,
    });

    // cleanup
    return () => {
      markerRef.current.map = null;
      markerRef.current = null;
      content.remove();
      contentRef.current = null;
    };
  }, []);

  // update text's props, controls and event listeners
  useEffect(() => {
    if (!contentRef.current || !markerRef.current) return;

    // re-render the content
    contentRef.current.render(children);

    listeners && listeners.forEach((listener) => listener.remove());
    markerRef.current.setMap(isVisible ? map : null);
    markerRef.current.gmpDraggable = false;
    if (isVisible) {
      if (isSelectable) {
        const listeners = [
          google.maps.event.addListener(
            markerRef.current,
            "click",
            setSelected
          ),
        ];
        if (isSelected) {
          markerRef.current.gmpDraggable = true;
          listeners.push(
            google.maps.event.addListener(markerRef.current, "click", (e) => {
              console.log("marker clicked");
            }),

            google.maps.event.addListener(markerRef.current, "dragend", (e) => {
              setCoordinates([e.latLng.lng(), e.latLng.lat()]);
            })
          );
        }
        setListeners(listeners);
      }
    }
  }, [
    map,
    markerRef,
    contentRef,
    isVisible,
    isSelectable,
    isSelected,
    children,
  ]);
};

/**
 * converting a google overlay into OCText object in GeoJSON
 */
export const getOcText = (overlay) => {
  return {
    type: "Feature",
    geometry: {
      type: "Point",
      coordinates: [overlay.position.lng(), overlay.position.lat()],
    },
    properties: {
      id: uuid(),
      name: `Text-${new Date().getTime()}`,
      type: "Text",
      styles: {
        padding: 10,
        borderRadius: 4,
        color: "black",
        backgroundColor: "yellow",
      },
    },
  };
};
