import "./App.css";
import { useState } from "react";
import LeftPanel from "./LeftPanel.js";
import Map from "./Map.js";
import InlineControls from "./InlineControls.js";

const Content = () => {
  const [origin, setOrigin] = useState(null);
  const [dest, setDest] = useState(null);
  const [routeIndex, setRouteIndex] = useState(0);
  const [newMapRoute, setNewMapRoute] = useState(false);
  const [newPanelRoute, setNewPanelRoute] = useState(false);
  const [duration, setDuration] = useState(0);
  const [route, setRoute] = useState(null);
  const [removeRoutes, setRemoveRoutes] = useState(false);
  const [toll, setToll] = useState(false);
  const [ferry, setFerry] = useState(false);
  const [motorway, setMotorway] = useState(false);
  const [dateTimeString, setDateTimeString] = useState(null);
  const [displayResults, setDisplayResults] = useState(false);
  const [startAdd, setStartAdd] = useState(null);
  const [endAdd, setEndAdd] = useState(null);
  const [arriveBy, setArriveBy] = useState(false);
  const [googleURL, setGoogleURL] = useState("");
  const [appleURL, setAppleURL] = useState("");
  //Mapbox's API is intended to be used for both frontend and backend application and allows you to limit access to certain domains, highly recommended to use since this key is public
  const mapboxApiAccessToken = "YOUR_KEY_HERE";

  function cleanAddrStr(addrStr) {
    return addrStr.replaceAll(",", "").replaceAll(" ", "+");
  }

  function calculateMapURL() {
    if (startAdd !== null && endAdd !== null) {
      const startAddString = cleanAddrStr(startAdd);
      const endAddString = cleanAddrStr(endAdd);

      let avoidOpts = "";
      if (motorway) {
        avoidOpts = avoidOpts.concat("!1b1");
      }

      if (toll) {
        avoidOpts = avoidOpts.concat("!2b1");
      }

      if (ferry) {
        avoidOpts = avoidOpts.concat("!3b1");
      }

      setGoogleURL(
        `https://www.google.com/maps/dir/${startAddString}/${endAddString}/data=!4m3!4m2!2m1${avoidOpts}`
      );
      setAppleURL(
        `https://maps.apple.com/?saddr=${startAddString}&daddr=${endAddString}&dirflg=d`
      );
    }
  }

  function handleCoordinatesFromLP(value) {
    setOrigin(value.start);
    setDest(value.end);
    setToll(value.toll);
    setFerry(value.ferry);
    setMotorway(value.motorway);
    setNewMapRoute(true);
    setRemoveRoutes(false);
    setArriveBy(value.arriveBy);
    setDateTimeString(value.dateTimeString);
    setStartAdd(value.startAdd);
    setEndAdd(value.endAdd);

    calculateMapURL();
  }

  function handleRouteFromMap(value) {
    setRoute(value.geoJSON);
    setNewPanelRoute(true);
    setDuration(value.duration);
    setRouteIndex(value.routeIndex);
  }

  function mapResetReceived() {
    setNewMapRoute(false);
  }

  function panelResetReceived() {
    setNewPanelRoute(false);
    setDisplayResults(true);
  }

  function removeRoutesReceived() {
    setRemoveRoutes(true);
    setDisplayResults(false);
  }

  function resetRemoveRoutes() {
    setRemoveRoutes(false);
  }

  return (
    <div id="app-content" className="app-content">
      <div
        className={displayResults ? "map-container" : "map-container-hidden"}
      >
        <div
          className="inline-controls-div-fullscreen"
          id="inline-controls-div-fullscreen"
        >
          <div id="resetPortal"></div>
          {displayResults ? (
            <InlineControls apple={appleURL} google={googleURL} />
          ) : null}
          ``
        </div>
        <Map
          removeRoutes={removeRoutes}
          resetRemoveRoutes={resetRemoveRoutes}
          mapboxApiAccessToken={mapboxApiAccessToken}
          newMapRoute={newMapRoute}
          mapResetReceived={mapResetReceived}
          origin={origin}
          dest={dest}
          routeToContent={handleRouteFromMap}
          toll={toll}
          ferry={ferry}
          motorway={motorway}
          dateTimeString={dateTimeString}
          arriveBy={arriveBy}
        />{" "}
      </div>
      <LeftPanel
        mapboxApiAccessToken={mapboxApiAccessToken}
        removeRoutesReceived={removeRoutesReceived}
        duration={duration}
        route={route}
        newPanelRoute={newPanelRoute}
        panelResetReceived={panelResetReceived}
        coordinatesToContent={handleCoordinatesFromLP}
        routeIndex={routeIndex}
      />
    </div>
  );
};

export default Content;
