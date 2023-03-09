import React from "react";
import "./App.css";
import { decode } from "geojson-polyline";
//BD: this is needed otherwise it won't load in production
// eslint-disable-next-line import/no-webpack-loader-syntax
import mapboxgl from "!mapbox-gl";
import MapboxDirections from "./lib/mapbox-directions/mapbox-gl-directions";

export default class Map extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      lng: -97,
      lat: 38,
      zoom: 3,
      directionsDisplay: false,
      directionsDisplayButton: false,
    };

    mapboxgl.accessToken = this.props.mapboxApiAccessToken;

    this.mapContainer = React.createRef();
    this.checkRoute = this.checkRoute.bind(this);
    this.onReceiveRouteFromMap = this.onReceiveRouteFromMap.bind(this);
    this.handleResize = this.handleResize.bind(this);
    this.getGeoJSON = this.getGeoJSON.bind(this);
    this.map = null;
    this.directions = null;
    this.routeIndex = 0;
    this.returnedVal = null;
  }

  componentDidMount() {
    window.addEventListener("resize", this.handleResize);

    // why not do this (through line 49) in the constructor? should only need to happen once
    //BD: doesn't work if moved into constructor
    const { lng, lat, zoom } = this.state;
    this.map = new mapboxgl.Map({
      container: "map",
      style: "mapbox://styles/mapbox/dark-v11",
      center: [lng, lat],
      zoom: zoom,
      interactive: true,
      trackResize: true,
    });

    this.map.addControl(new mapboxgl.NavigationControl(), "bottom-left");
    this.map.addControl(new mapboxgl.FullscreenControl(), "bottom-left");

    this.handleResize();
  }

  componentDidUpdate() {
    // the pattern here if you don't like typing out this.props over and over would be to destructure the object
    // into its properties. ex: const { x, y, z } = this.props;
    //BD: updated
    const { toll, ferry, motorway, unpaved, dateTimeString } = this.props;

    // you can do this operation inline where you're setting the prop below
    //BD: updated

    let settingsArray = [
      {
        name: "ferry",
        value: ferry,
      },
      {
        name: "toll",
        value: toll,
      },
      {
        name: "unpaved",
        value: unpaved,
      },
      {
        name: "motorway",
        value: motorway,
      },
    ];

    let settingsArrayTrue = settingsArray.filter((i) => i.value === true);

    // here is much shorter and simpler way to accomplish the above
    // let me know if you have questions about Object.entries or Array.reduce
    // const excludeString = Object.entries({ ferry, toll, unpaved, motorway })
    //     .filter(([_, value]) => value) // value is a boolean so you can just return it
    //     .reduce((prev, [key, _], i) => i === 0 ? key : `${prev},${key}`, '');

    // why did we do all the work above if none of it is used if this prop is false?
    //BD: moved below so only done if needed

    if (this.props.newMapRoute) {
      //depart at logic, no routing options selected
      if (this.props.arriveBy === false) {
        if (settingsArrayTrue.length === 0) {
          this.directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            styles: mapStyle,
            unit: "imperial",
            profile: "mapbox/driving-traffic",
            alternatives: true,
            controls: {
              inputs: false,
              instructions: true,
            },
            interactive: true,
            departAt: dateTimeString.slice(0, 16),
          });
          //depart at logic, with routing options selected
        } else {
          let excludeString = "excludeOptions";
          settingsArrayTrue.forEach((v, i) => {
            if (i === 0) {
              excludeString = v.name;
            } else {
              excludeString = `${excludeString},${settingsArrayTrue[i].name}`;
            }
          });
          this.directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            styles: mapStyle,
            unit: "imperial",
            profile: "mapbox/driving-traffic",
            alternatives: true,
            controls: {
              inputs: false,
              instructions: true,
            },
            exclude: excludeString,
            interactive: true,
            departAt: dateTimeString.slice(0, 16),
          });
        }
        //arrive by logic, no routing options selected
      } else {
        if (settingsArrayTrue.length === 0) {
          this.directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            styles: mapStyle,
            unit: "imperial",
            profile: "mapbox/driving",
            alternatives: true,
            controls: {
              inputs: false,
              instructions: true,
            },
            interactive: true,
            arriveBy: dateTimeString.slice(0, 16),
          });
          //arrive by logic, with routing options selected
        } else {
          let excludeString = "excludeOptions";
          settingsArrayTrue.forEach((v, i) => {
            if (i === 0) {
              excludeString = v.name;
            } else {
              excludeString = `${excludeString},${settingsArrayTrue[i].name}`;
            }
          });
          this.directions = new MapboxDirections({
            accessToken: mapboxgl.accessToken,
            styles: mapStyle,
            unit: "imperial",
            profile: "mapbox/driving",
            alternatives: true,
            controls: {
              inputs: false,
              instructions: true,
            },
            exclude: excludeString,
            interactive: true,
            arriveBy: dateTimeString.slice(0, 16),
          });
        }
      }

      this.map.addControl(this.directions, "top-right");

      this.directions.on("route", this.onReceiveRouteFromMap);
      this.props.mapResetReceived();
      this.directions.setOrigin(this.props.origin);
      this.directions.setDestination(this.props.dest);
    }

    if (this.props.removeRoutes) {
      this.props.resetRemoveRoutes();
      this.directions.removeRoutes();
      this.map.removeControl(this.directions);
    }

    this.handleResize();
  }

  onReceiveRouteFromMap() {
    const checkedRouteValue = this.directions.getRoute();

    this.returnedVal = this.directions.getRaw();
    if (this.returnedVal === undefined) {
      console.log("waiting for directions data");
    } else {
      console.log("directions data received");

      const { geometry, duration } =
        this.returnedVal.routes[0];
      // destructure returnedVal.routes[0] above so you don't have to keep referencing into it
      const geoJSON = this.getGeoJSON(geometry);
      const content = {
        geoJSON: geoJSON,
        duration: duration,
        routeIndex: checkedRouteValue,
      };
      this.props.routeToContent(content);
      this.setState({
        visible: true,
      });
    }
    this.handleResize();
    this.checkRoute();
  }

  checkRoute() {
    const checkedRouteValue = this.directions.getRoute();
    if (this.routeIndex !== checkedRouteValue) {
      this.routeIndex = checkedRouteValue;

      // this logic is repeated here and above - could be extracted to its own function
      //BD: fixed
      const geoJSON = this.getGeoJSON(
        this.returnedVal.routes[this.routeIndex].geometry
      );
      const content = {
        geoJSON: geoJSON,
        duration: this.returnedVal.routes[this.routeIndex].duration,
        routeIndex: checkedRouteValue,
      };
      this.props.routeToContent(content);
    }
    setTimeout(this.checkRoute, 500);
  }

  getGeoJSON(input) {
    const polygon = {
      type: "Polygon",
      coordinates: [input],
    };
    return decode(polygon);
  }

  handleResize() {
    let windowWidth = window.innerWidth;
    let windowHeight = window.innerHeight;

    let leftPanelHeight = document.getElementById("left-panel").offsetHeight;
    let heroHeight = document.getElementById("hero").offsetHeight;

    let navHeight = document.getElementById("nav").offsetHeight;

    let targetHeight = windowHeight - heroHeight - navHeight;

    // let target = document.getElementById("app-content").style.height;

    if (windowWidth <= 1000 && windowWidth > 800) {
      if (targetHeight > leftPanelHeight) {
        // query it once above instead of repeatedly in the branches
        //BD: done
        document.getElementById(
          "app-content"
        ).style.height = `${targetHeight}px`;
      } else {
        document.getElementById(
          "app-content"
        ).style.height = `${leftPanelHeight}px`;
      }
    } else if (windowWidth > 1000) {
      document.getElementById("app-content").style.height = "75vh";
    } else if (windowWidth <= 800) {
      //tbd
    }
    this.map.resize();
  }

  render() {
    return <div id="map" className="map"></div>;
  }
}

const mapStyle = [
  {
    id: "directions-route-line-alt",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#b3b3b3",
      "line-width": 10,
    },
    filter: [
      "all",
      ["in", "$type", "LineString"],
      ["in", "route", "alternate"],
    ],
  },
  {
    id: "directions-route-line-casing",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "round",
      "line-join": "round",
    },
    paint: {
      "line-color": "#d7552a",
      "line-width": 10,
    },
    filter: ["all", ["in", "$type", "LineString"], ["in", "route", "selected"]],
  },
  {
    id: "directions-route-line",
    type: "line",
    source: "directions",
    layout: {
      "line-cap": "butt",
      "line-join": "round",
    },
    paint: {
      "line-color": {
        property: "congestion",
        type: "categorical",
        default: "#d7552a",
        stops: [
          ["unknown", "#4882c5"],
          ["low", "#4882c5"],
          ["moderate", "#f09a46"],
          ["heavy", "#e34341"],
          ["severe", "#8b2342"],
        ],
      },
      "line-width": 10,
    },
    filter: ["all", ["in", "$type", "LineString"], ["in", "route", "selected"]],
  },
  {
    id: "directions-hover-point-casing",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 8,
      "circle-color": "#b3b3b3",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "id", "hover"]],
  },
  {
    id: "directions-hover-point",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 6,
      "circle-color": "#FFFFFF",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "id", "hover"]],
  },
  {
    id: "directions-waypoint-point-casing",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 8,
      "circle-color": "#fff",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "id", "waypoint"]],
  },
  {
    id: "directions-waypoint-point",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 6,
      "circle-color": "#b3b3b3",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "id", "waypoint"]],
  },
  {
    id: "directions-origin-point",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 18,
      "circle-color": "#fff",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "marker-symbol", "A"]],
  },
  {
    id: "directions-origin-label",
    type: "symbol",
    source: "directions",
    layout: {
      "text-field": "A",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#000000",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "marker-symbol", "A"]],
  },
  {
    id: "directions-destination-point",
    type: "circle",
    source: "directions",
    paint: {
      "circle-radius": 18,
      "circle-color": "#fff",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "marker-symbol", "B"]],
  },
  {
    id: "directions-destination-label",
    type: "symbol",
    source: "directions",
    layout: {
      "text-field": "B",
      "text-font": ["Open Sans Bold", "Arial Unicode MS Bold"],
      "text-size": 12,
    },
    paint: {
      "text-color": "#000000",
    },
    filter: ["all", ["in", "$type", "Point"], ["in", "marker-symbol", "B"]],
  },
];
