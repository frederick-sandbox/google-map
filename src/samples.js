const center = {
  lng: -122.396771,
  lat: 37.787713,
};

const zoom = 17;

const features = [
  {
    id: "6f8abd92-d0d9-4395-9d62-425ccb656f00",
    name: "Text",
    note: "Sample Text",
    styles: {
      color: "black",
      background: {
        color: "yellow",
        opacity: 1.0,
      },
    },
    geometry: {
      lng: -122.394583,
      lat: 37.785818,
    },
  },
  {
    id: "4b8d9c80-7755-4c9e-b96b-5bdc65d19df5",
    name: "Line",
    styles: {
      stroke: {
        color: "yellow",
        weight: 3,
        opacity: 1.0,
      },
    },
    geometry: [
      { lng: -122.400441, lat: 37.790533 },
      { lng: -122.399593, lat: 37.791169 },
      { lng: -122.398574, lat: 37.790804 },
    ],
  },
  {
    id: "b6c97aea-a150-4f32-aabf-dc8b3ccff101",
    name: "Area",
    styles: {
      stroke: {
        color: "yellow",
        opacity: 1.0,
        weight: 3,
      },
      fill: {
        color: "yellow",
        opacity: 0.4,
      },
    },
    geometry: [
      [
        { lng: -122.398735, lat: 37.788129 },
        { lng: -122.397265, lat: 37.788299 },
        { lng: -122.396063, lat: 37.786594 },
        { lng: -122.398005, lat: 37.786442 },
      ],
      [
        { lng: -122.397962, lat: 37.787654 },
        { lng: -122.397748, lat: 37.787188 },
        { lng: -122.397158, lat: 37.787112 },
        { lng: -122.397587, lat: 37.787663 },
      ],
    ],
  },
];
