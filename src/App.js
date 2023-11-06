import React, { useState, useRef, useEffect } from "react";
import Map from "./googlemap/Map";
import { getLngLat } from "./googlemap/GeoCoder";

import {
  DRAWING_NONE,
  DRAWING_TEXT,
  DRAWING_LINE,
  DRAWING_AREA,
  DRAWING_CUTOUT,
  OC_AREA,
  GoogleMapApiKey,
} from "./Constants";

function App() {
  const inputRef = useRef(null);

  const [address, setAddress] = useState("44 Tehama St, San Francisco, CA");
  // const [center, setCenter] = useState({ lng: -122.3993087, lat: 37.7876414 });
  const [center, setCenter] = useState(null);
  const [zoom, setZoom] = useState(17);

  const [features, setFeatures] = useState({
    blah: {
      controls: {
        visible: true,
        editable: true,
      },
      geojson: {
        type: "Feature",
        geometry: {
          type: "MultiPolygon",
          coordinates: [
            [
              [-122.398735, 37.788129],
              [-122.397265, 37.788299],
              [-122.396063, 37.786594],
              [-122.398005, 37.786442],
              [-122.398735, 37.788129],
            ],
            [
              [-122.397962, 37.787654],
              [-122.397748, 37.787188],
              [-122.397158, 37.787112],
              [-122.397587, 37.787663],
              [-122.397962, 37.787654],
            ],
          ],
        },
        properties: {
          id: "blah",
          name: "Blah",
          type: "Area",
          styles: {
            stroke: {
              color: "yellow",
              weight: 3,
              opacity: 1.0,
            },
            fill: {
              color: "yellow",
              opacity: 0.4,
            },
          },
        },
      },
    },
  });
  const [selectedFeatureId, setSelectedFeatureId] = useState(null);

  const [drawingMode, setDrawingMode] = useState({
    mode: DRAWING_NONE,
    updater: () => {},
  });

  useEffect(() => {
    const setMapCenter = async () =>
      setCenter((await getLngLat({ address }, GoogleMapApiKey)).coordinate);
    setMapCenter();
  }, [address]);

  const updateFeature = (key, feature) => {
    setFeatures((existing) => {
      const id = key ? key : "feature-" + new Date().getTime;
      return {
        ...existing,
        [id]: {
          ...existing[id],
          geojson: feature,
        },
      };
    });
  };

  return (
    <div
      style={{
        display: "flex",
        width: "100vw",
        height: "100vh",
        flexDirection: "row",
      }}
    >
      <div style={{ width: 250, layout: "flex", flexDirection: "column" }}>
        <input
          type="text"
          ref={inputRef}
          placeholder={address}
          style={{ width: 190, padding: "10px 3px", margin: "5px 25px" }}
        />
        <button
          style={{ width: 200, padding: 10, margin: "5px 25px" }}
          onClick={() => {
            inputRef.current.value && setAddress(inputRef.current.value);
          }}
        >
          Change Center
        </button>
        <button
          style={{ width: 200, padding: 10, margin: "5px 25px" }}
          onClick={async () => {
            setDrawingMode({
              mode: DRAWING_TEXT,
              updater: (feature) => {
                // disable drawing
                setDrawingMode({ mode: DRAWING_NONE, updater: () => {} });

                // add to the feature list
                setFeatures((existing) => {
                  return {
                    ...existing,
                    [feature.properties.id]: {
                      controls: {
                        visible: true,
                        editable: true,
                      },
                      geojson: feature,
                    },
                  };
                });
              },
            });
          }}
        >
          Add Text
        </button>
        <button
          style={{ width: 200, padding: 10, margin: "5px 25px" }}
          onClick={async () => {
            setDrawingMode({
              mode: DRAWING_LINE,
              updater: (feature) => {
                // disable drawing
                setDrawingMode({ mode: DRAWING_NONE, updater: () => {} });

                // add to the feature list
                setFeatures((existing) => {
                  return {
                    ...existing,
                    [feature.properties.id]: {
                      controls: {
                        visible: true,
                        editable: true,
                      },
                      geojson: feature,
                    },
                  };
                });
              },
            });
          }}
        >
          Draw a Line
        </button>
        <button
          style={{ width: 200, padding: 10, margin: "5px 25px" }}
          onClick={async () => {
            setDrawingMode({
              mode: DRAWING_AREA,
              updater: (feature) => {
                // disable drawing
                setDrawingMode({ mode: DRAWING_NONE, updater: () => {} });

                // add to the feature list
                setFeatures((existing) => {
                  return {
                    ...existing,
                    [feature.properties.id]: {
                      controls: {
                        visible: true,
                        editable: true,
                      },
                      geojson: feature,
                    },
                  };
                });
              },
            });
          }}
        >
          Draw an Area
        </button>
        {selectedFeatureId &&
        features[selectedFeatureId].geojson.properties.type === OC_AREA ? (
          <button
            style={{ width: 200, padding: 10, margin: "5px 25px" }}
            onClick={() => {
              setDrawingMode({
                mode: DRAWING_CUTOUT,
                updater: (feature) => {
                  setDrawingMode({ mode: DRAWING_NONE, updater: () => {} });
                  setFeatures((existing) => {
                    return {
                      ...existing,
                      [feature.properties.id]: {
                        controls: {
                          visible: true,
                          editable: true,
                        },
                        geojson: feature,
                      },
                    };
                  });
                },
              });
            }}
          >
            Add Cut-out
          </button>
        ) : null}
        <div>
          <div
            style={{
              marginTop: 10,
              padding: 10,
              with: "100%",
              textAlign: "center",
            }}
          >
            Feature List
          </div>
          {features &&
            Object.entries(features).map(([key, feature]) => (
              <div
                style={{
                  padding: 10,
                  border: `1px solid ${
                    selectedFeatureId === key ? "orange" : "black"
                  }`,
                  margin: "10px 20px",
                }}
                key={key}
                onClick={() => setSelectedFeatureId(key)}
              >
                <div>{feature.geojson.properties.name}</div>
                <div style={{ paddingTop: 5, fontSize: 14 }}>
                  {feature.geojson.properties.type === "Text"
                    ? `${(
                        Math.round(
                          feature.geojson.geometry.coordinates[0] * 1000000
                        ) / 1000000
                      ).toFixed(6)}, ${(
                        Math.round(
                          feature.geojson.geometry.coordinates[1] * 1000000
                        ) / 1000000
                      ).toFixed(6)}`
                    : feature.geojson.geometry.coordinates.map((path) => (
                        <div style={{ padding: "3px 0" }}>
                          {path.map((coord, idx) => (
                            <div
                              key={`${feature.geojson.properties.id}-${idx}`}
                            >
                              {(
                                Math.round(coord[0] * 1000000) / 1000000
                              ).toFixed(6)}
                              ,&nbsp;&nbsp;
                              {(
                                Math.round(coord[1] * 1000000) / 1000000
                              ).toFixed(6)}
                            </div>
                          ))}{" "}
                        </div>
                      ))}
                </div>
              </div>
            ))}
        </div>
      </div>
      <div style={{ flex: 1, backgroundColor: "blue" }}>
        <Map
          center={center}
          zoom={zoom}
          features={features}
          updateFeature={updateFeature}
          drawingMode={drawingMode}
          selectedFeatureId={selectedFeatureId}
          setSelectedFeatureId={setSelectedFeatureId}
        />
      </div>
    </div>
  );
}

export default App;
