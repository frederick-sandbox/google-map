/**
 * All map features are encapsulated in GeoJSON which can only be used to
 * specify points, lines and polygons. The custom property "type" in the
 * GeoJSON defines OC's map feature mapping
 *
 * Text - a text label on the map
 *
 * Line - a line on the map, can be a connected multi-segment line, directionless,
 *        can return total length of the line
 *
 * Area - a polygon, with or without cut-outs, cut-outs cannot be overlapped in the
 *        polygon, and cut-outs cannot have any region outside the outer boundary of
 *        the polygon, and can return total area of the polygon
 */
export const OC_TEXT = "Text"; // a text label on the map
export const OC_LINE = "Line"; // a line on the map
export const OC_AREA = "Area"; // a polygon, with or without cut-outs, on the map

/**
 * Drawing mode for the map component
 */
export const DRAWING_NONE = "none";
export const DRAWING_TEXT = "point";
export const DRAWING_LINE = "line";
export const DRAWING_AREA = "area";
export const DRAWING_CUTOUT = "cutout";

export const MIN_ZOOM = 1;
export const MAX_ZOOM = 24;

export const GoogleMapApiKey = process.env.REACT_APP_GoogleMapApiKey;
export const GoogleMapId = process.env.REACT_APP_GoogleMapId;
