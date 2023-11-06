import { v4 as uuid } from "uuid";
import { OC_AREA } from "../../Constants";

export const convertGooglePolygonPathsToCoordinates = (polygon) => {
  const pathsArray = polygon.getPaths().getArray();
  return pathsArray.map((path) =>
    path.getArray().map((coordinates) => [coordinates.lng(), coordinates.lat()])
  );
};

export const convertGeoJSONCoordinatesToGooglePolygonPaths = (coordinates) =>
  coordinates.map((polygonCoordinates) =>
    polygonCoordinates.map((coordinate) => ({
      lng: coordinate[0],
      lat: coordinate[1],
    }))
  );

/**
 *
 * expect both coordinates and area are in GeoJSON format
 */
export const addCutoutToArea = (coordinates, area) => {
  const c = isPolygonRingClockwise(coordinates)
    ? coordinates.reverse()
    : coordinates;
  return {
    ...area,
    geometry: {
      coordinates: [...area.geometry.coordinates, [...c]],
    },
  };
};

/**
 * Once the user draw a polygon using google draw tool, an
 * overlay is created (as google polygon object). We need to
 * convert this polygon object into GeoJSON format with OC
 * specific attributes.
 */
export const convertGoogleDrawPolygonToArea = (overlay) => {
  const c = fixGooglePolygonClosing(
    overlay
      .getPaths()
      .getArray()[0]
      .getArray()
      .map((c) => [c.lng(), c.lat()])
  );
  return {
    type: "Feature",
    geometry: {
      type: "MultiPolygon",
      coordinates: [isPolygonRingClockwise(c) ? c : c.reverse()],
    },
    properties: {
      type: OC_AREA,
      id: uuid(),
      name: `Area-${new Date().getTime()}`,
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
  };
};

/**
 * GeoJSON defines a polygon as an array of coordinate arrays
 * [[lng, lat], [lng, lat], ...], with the first coordinate array
 * matching the last coordinate array (both lngs and lats are the
 * same values - in other words, the same point/coordinate)
 *
 * Google does not construct a polygon this way. It does not have a
 * "matching" closing coordinate. Therefore we will need to "append"
 * the first coordinate array to the end of the coordinate arrays.
 *
 * Note: appending the closing coordinate array will not mess up how
 * Google map api interpret the polygon. It still draw the same polygon
 * on the map.
 */
export const fixGooglePolygonClosing = (coordinates) =>
  coordinates[0][0] !== coordinates[coordinates.length - 1][0] ||
  coordinates[0][1] !== coordinates[coordinates.length - 1][1]
    ? [...coordinates, coordinates[0]]
    : [...coordinates];

/**
 * Google handles cut-out in a polygon by putting multiple polygon
 * paths (coordinate arrays) in an array (similar to how GeoJSON
 * represents a multi-polygon feature). The only requirement is
 * the paths of the outer polygon (the first set of coordinate arrays)
 * must have different "rotation" than the rest of the cut-out polygons.
 * Check if the coordinates are listed clockwise or anti-clockwise will
 * help to enforce this ordering in our representation of an area with
 * cut-outs. In our implementation, the outer polygon will always be
 * in clockwise direction, and all the cut-outs will be in
 * anti-clockwise direction.
 */
export const isPolygonRingClockwise = (coordinates) => {
  var area = 0,
    err = 0;
  for (var i = 0, len = coordinates.length, j = len - 1; i < len; j = i++) {
    var k =
      (coordinates[i][0] - coordinates[j][0]) *
      (coordinates[j][1] + coordinates[i][1]);
    var m = area + k;
    err += Math.abs(area) >= Math.abs(k) ? area - m + k : k - m + area;
    area = m;
  }
  return area + err >= 0;
};
