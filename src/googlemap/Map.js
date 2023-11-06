/*global google*/
import { useRef, useState, useEffect } from "react";

import { Wrapper, Status } from "@googlemaps/react-wrapper";
import { GoogleMapApiKey, GoogleMapId } from "../Constants";

import { OCText, getOcText } from "./features/Text";
import { OCLine, getOcLine } from "./features/Line";
import { OCArea } from "./features/Area";
import {
  addCutoutToArea,
  convertGoogleDrawPolygonToArea,
} from "./features/AreaUtils";

import {
  DRAWING_NONE,
  DRAWING_TEXT,
  DRAWING_LINE,
  DRAWING_AREA,
  DRAWING_CUTOUT,
  OC_TEXT,
  OC_LINE,
  OC_AREA,
} from "../Constants";

const GoogleMap = ({
  center,
  zoom,
  features,
  updateFeature,
  drawingMode,
  selectedFeatureId,
  setSelectedFeatureId,
}) => {
  const ref = useRef();
  const [map, setMap] = useState();

  const [drawingManager, setDrawingManager] = useState(null);
  const [drawingListeners, setDrawingListeners] = useState([]);
  const addListener = (listener) =>
    setDrawingListeners((existing) => [...existing, listener]);

  const mapOptions = {
    mapTypeId: "satellite",
    mapId: GoogleMapId,
    center,
    zoom,

    tilt: 0,
    rotateControl: false,
    disableDefaultUI: true,

    // draggableCursor: "crosshair",
  };

  // setup
  useEffect(() => {
    // initialize the map
    setMap(new google.maps.Map(ref.current, mapOptions));

    // initialize the drawing manager
    setDrawingManager(
      new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
        drawingControl: false,
        polylineOptions: {
          clickable: true,
          draggable: true,
          editable: true,
          strokeColor: "white",
          strokeWeight: 1,
          strokeOpacity: 1.0,
          visible: true,
        },
        polygonOptions: {
          strokeColor: "yellow",
          strokeOpacity: 0.7,
          strokeWeight: 3,
          fillColor: "yellow",
          fillOpacity: 0.3,
          clickable: true,
          draggable: true,
          editable: true,
          visible: true,
        },
      })
    );
  }, []);

  useEffect(() => {
    if (!map || !drawingManager) return;

    // first, cleanup previous drawing session if any
    // equivalent to DRAWING_NONE
    drawingManager.setMap(null);
    drawingListeners && drawingListeners.map((listener) => listener.remove());

    // map onclick de-select feature
    addListener(
      // xxx this click event will be triggered when user drag a custom marker
      // (when dragend event fires). I think this is a bug because it does not
      // happen to other shapes like line and polygon. this will "de-select" a
      // dragged text label, and there is currently no workaround.
      google.maps.event.addListener(map, "click", (e) => {
        console.log("map clicked");
        setSelectedFeatureId(null);
      })
    );

    if (drawingMode.mode === DRAWING_NONE) return;

    if (drawingMode.mode === DRAWING_TEXT) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.MARKER);
      addListener(
        google.maps.event.addListener(
          drawingManager,
          "overlaycomplete",
          (e) => {
            const feature = getOcText(e.overlay); // convert google marker to OCText
            e.overlay.setMap(null); // remove from the map
            drawingMode.updater(feature); // update the feature list
          }
        )
      );
    } else if (drawingMode.mode === DRAWING_LINE) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYLINE);
      addListener(
        google.maps.event.addListener(
          drawingManager,
          "overlaycomplete",
          (e) => {
            const feature = getOcLine(e.overlay); // convert google polyline to OC Line
            e.overlay.setMap(null); // remove from the map
            drawingMode.updater(feature); // update feature list
          }
        )
      );
    } else if (drawingMode.mode === DRAWING_AREA) {
      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      addListener(
        google.maps.event.addListener(
          drawingManager,
          "overlaycomplete",
          (e) => {
            const feature = convertGoogleDrawPolygonToArea(e.overlay);
            e.overlay.setMap(null);
            drawingMode.updater(feature);
          }
        )
      );
    } else if (drawingMode.mode === DRAWING_CUTOUT) {
      if (
        !selectedFeatureId ||
        features[selectedFeatureId].geojson.properties.type !== OC_AREA
      ) {
        throw new Error(`An "Area" must be selected to draw a cut-out`);
      }

      drawingManager.setDrawingMode(google.maps.drawing.OverlayType.POLYGON);
      addListener(
        google.maps.event.addListener(
          drawingManager,
          "overlaycomplete",
          (e) => {
            const cutout = convertGoogleDrawPolygonToArea(e.overlay);
            e.overlay.setMap(null);
            drawingMode.updater(
              addCutoutToArea(
                cutout.geometry.coordinates[0],
                features[selectedFeatureId].geojson
              )
            );
          }
        )
      );
    } else {
      throw new Error(`Unknown map drawing mode: ${drawingMode.mode}`);
    }
    drawingManager.setMap(map); // enable drawing on the map
  }, [map, selectedFeatureId, drawingManager, drawingMode]);

  // re-center the map
  useEffect(() => {
    map && center && map.panTo(center);
  }, [map, center]);

  return (
    <>
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      {map &&
        Object.entries(features).map(([key, feature]) => {
          if (feature.geojson.properties.type === OC_TEXT) {
            return (
              <OCText
                key={key}
                map={map}
                feature={feature.geojson}
                controls={feature.controls}
                updateFeature={updateFeature}
                isSelected={selectedFeatureId === feature.geojson.properties.id}
                setSelected={() =>
                  setSelectedFeatureId(feature.geojson.properties.id)
                }
              />
            );
          } else if (feature.geojson.properties.type === OC_LINE) {
            return (
              <OCLine
                key={key}
                map={map}
                feature={feature.geojson}
                controls={feature.controls}
                updateFeature={updateFeature}
                isSelected={selectedFeatureId === feature.geojson.properties.id}
                setSelected={() =>
                  setSelectedFeatureId(feature.geojson.properties.id)
                }
              />
            );
          } else if (feature.geojson.properties.type === OC_AREA) {
            return (
              <OCArea
                key={key}
                map={map}
                feature={feature.geojson}
                updateFeature={updateFeature}
                isVisible={feature.controls.visible}
                isSelectable={feature.controls.editable}
                isSelected={selectedFeatureId === feature.geojson.properties.id}
                setSelected={() =>
                  setSelectedFeatureId(feature.geojson.properties.id)
                }
              />
            );
          } else {
            return null;
          }
        })}
    </>
  );
};

const Map = (props) => {
  return (
    <Wrapper
      apiKey={GoogleMapApiKey}
      render={(status) => {
        if (status === Status.FAILURE) return <div>failure</div>;
        if (status === Status.LOADING) return <div>loading</div>;
        return null;
      }}
      libraries={["marker", "drawing"]}
    >
      <GoogleMap {...props} />
    </Wrapper>
  );
};

export default Map;
