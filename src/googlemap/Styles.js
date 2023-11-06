import { get } from "lodash";

const defStyles = {
  line: {
    stroke: {
      color: "yellow",
      weight: 3,
      opacity: 1.0,
    },
  },
};

export const LINE_STYLE = "line";
export const AREA_STYLE = "area";

export const getStyle = (styles, type, styleName) => {
  switch (type) {
    case LINE_STYLE:
      switch (styleName) {
        case "strokeColor":
          return get(styles, "stroke.color", defStyles.line.stroke.color);
        case "strokeWeight":
          return get(styles, "stroke.weight", defStyles.line.stroke.weight);
        case "strokeOpacity":
          return get(
            styleName,
            "stroke.opacity",
            defStyles.line.stroke.opacity
          );
        default:
          throw new Error(`unknown style: ${styleName}`);
      }
    default:
      throw new Error(`unknown type: ${type}`);
  }
};
