/*global google*/
import React, { useEffect, useRef, useState } from "react";
import { createRoot } from "react-dom/client";

import { Wrapper, Status } from "@googlemaps/react-wrapper";

import GoogleMap from 

import Markers from "./googlemap/AdvancedMarkers";

const apiKey = "AIzaSyAmzHbZPD0JNAUtt1_b_4e4JrFL8CLlOL4";
const mapId = "b8f3c6f00208851";

const MIN_ZOOM = 1;
const MAX_ZOOM = 24;

const GoogleMap = ({
  center,
  zoom,
  markers,
  addMarkerListener,
  drawingControl,
}) => {
  const ref = useRef();
  const [map, setMap] = useState();
  const [drawing, setDrawing] = useState();
  const [drawingListenerRemover, setDrawingListenerRemover] = useState(null);

  const mapOptions = {
    mapTypeId: "satellite",
    mapId,
    center,
    zoom,

    tilt: 0,
    rotateControl: false,
    disableDefaultUI: true,

    draggableCursor: "crosshair",
  };

  useEffect(() => {
    setMap(new google.maps.Map(ref.current, mapOptions));
    setDrawing(
      new google.maps.drawing.DrawingManager({
        drawingMode: google.maps.drawing.OverlayType.RECTANGLE,
        drawingControl: false,
        polylineOptions: {
          draggable: true,
          editable: true,
          strokeColor: "yellow",
          clickable: true,
        },
        polygonOptions: {
          strokeColor: "yellow",
        },
      })
    );
  }, []);

  console.log({ drawingControl });

  useEffect(() => {
    if (!map || !drawing) return;
    if (drawingControl) {
      drawing.setDrawingMode(drawingControl.type);
      drawing.setMap(map);
      drawingListenerRemover && drawingListenerRemover.remove();
      setDrawingListenerRemover(
        google.maps.event.addListener(
          drawing,
          "overlaycomplete",
          drawingControl.updater
        )
      );
    } else {
      drawing.setMap(null);
      drawingListenerRemover && drawingListenerRemover.remove();
    }
  }, [map, drawing, drawingControl]);

  useEffect(() => {
    map && center && map.panTo(center);
  }, [map, center]);

  const [addMarkerCleanup, setAddMarkerCleanup] = useState(null);

  useEffect(() => {
    if (!map) return;

    if (addMarkerListener) {
      addMarkerCleanup && addMarkerCleanup.remove();
      setAddMarkerCleanup(
        google.maps.event.addListenerOnce(map, "click", (e) => {
          map.setOptions({ draggableCursor: "default" });
          addMarkerListener(e);
        })
      );
      map.setOptions({ draggableCursor: "crosshair" });
    } else {
      addMarkerCleanup && addMarkerCleanup.remove();
      setAddMarkerCleanup(null);
      map.setOptions({ draggableCursor: "default" });
    }
  }, [map, addMarkerListener]);

  return (
    <>
      <div
        ref={ref}
        style={{
          width: "100%",
          height: "100%",
        }}
      />
      {map && <Markers map={map} markers={markers} />}
    </>
  );
};

const Map = (props) => {
  return (
    <Wrapper
      apiKey={apiKey}
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
