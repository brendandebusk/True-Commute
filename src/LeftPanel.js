// you shouldn't need the global React import as of v17+, just need the hooks, etc in the curly braces
import React, { useState, useEffect } from "react";
import { createPortal } from 'react-dom';
import "./App.css";
import Controls from "./Controls.js";
import Results from "./Results.js";
import { getWeather } from "./Weather.js";
import Error from "./Error.js";
import ResetButton from "./ResetButton.js";

const LeftPanel = (props) => {
  const [displayResults, setDisplayResults] = useState(false);
  const [completeData, setCompleteData] = useState([]);
  // consider using real JS Date/Time API w/ Intl API for formatting
  const [time, setTime] = useState("7:30 am");
  const [weightedValue, setWeightedValue] = useState(null);
  const [unweightedValue, setUnweightedValue] = useState(0);
  const [selectedTime, setSelectedTime] = useState(0);
  const [timeZoneOffset, setTimeZoneOffset] = useState(null);
  const [origintimezoneAbr, setOrigintimezoneAbr] = useState(null);
  const [startAdd, setStartAdd] = useState(null);
  const [endAdd, setEndAdd] = useState(null);
  const [arrivalOffset, setArrivalOffset] = useState(null);
  const [destTimeZoneAbr, setDestTimeZoneAbr] = useState(null);
  const [error, setError] = useState(false);
  const [badTime, setBadTime] = useState(false);
  const [loading, setLoading] = useState(false);
  const [routeLog, setRouteLog] = useState([]);
  const [arriveBy, setArriveBy] = useState(false);
  const [timezoneDelta, setTimezoneDelta] = useState(0);

  // consider writing a useAsyncEffect wrapper hook to make this cleaner
  // ex: function useAsyncEffect(effect, dependencies) {
  //       useEffect(() => effect(), dependencies);
  //     }
  // i know it doesn't look that different but it is nice when you are doing this immediately-called
  // wrapper function pattern all the time
  useEffect(() => {
    
    async function onLoad() {
      if (props.newPanelRoute && props.route !== null) {
        //selectedTime = start of drive, if using arriveBy need to update this
        //duration is returned in seconds
        //selectedTime is in seconds
        //reassign value of time, use setTime
        let adjustedSelectedTime;
        if (arriveBy) {
          const origintimezoneSub = parseInt(timeZoneOffset.slice(2, 3));
          const desttimezoneSub = parseInt(arrivalOffset.slice(2, 3));
          let timezonedelta = 0;

          if (desttimezoneSub - origintimezoneSub > 0) {
            timezonedelta = 3600 * (desttimezoneSub - origintimezoneSub);
          } else if (desttimezoneSub - origintimezoneSub < 0) {
            timezonedelta = -3600 * (desttimezoneSub - origintimezoneSub);
          }

          adjustedSelectedTime = selectedTime - props.duration - timezonedelta;
          const adjustedOriginDate = new Date(adjustedSelectedTime * 1000);
          const adjustedOriginDateUTCHour = adjustedOriginDate.getUTCHours();
          const adjustedOriginDateUTCMin = adjustedOriginDate.getUTCMinutes();
          let adjustedOriginDateMeridiem = "am";

          let adjustedOriginDateHour =
            adjustedOriginDateUTCHour - origintimezoneSub;

          adjustedOriginDateHour =
            adjustedOriginDateHour < 0
              ? 24 + adjustedOriginDateHour
              : adjustedOriginDateHour;

          if (adjustedOriginDateHour === 0) {
            adjustedOriginDateHour = 12;
          } else if (adjustedOriginDateHour === 12) {
            adjustedOriginDateMeridiem = "pm";
          } else if (adjustedOriginDateHour > 12) {
            adjustedOriginDateHour = adjustedOriginDateHour - 12;
            adjustedOriginDateMeridiem = "pm";
          }

          let adjustedOriginDateMin =
            adjustedOriginDateUTCMin < 10
              ? `0${adjustedOriginDateUTCMin}`
              : adjustedOriginDateUTCMin;

          setTime(
            `${adjustedOriginDateHour}:${adjustedOriginDateMin} ${adjustedOriginDateMeridiem}`
          );
          setTimezoneDelta(timezonedelta);
        }

        if (!routeLog[props.routeIndex]) {
          const weatherData = await getWeather(
            props.route,
            arriveBy ? adjustedSelectedTime : selectedTime,
            props.duration,
            props.mapboxApiAccessToken
          );
          const newArray = {
            index: props.routeIndex,
            weightedValue: weatherData.weightedDuration,
            unweightedValue: weatherData.tripTime,
            completeData: weatherData.points,
          };
          setRouteLog(routeLog.concat(newArray));
          setDisplayResults(true);
          setWeightedValue(weatherData.weightedDuration);
          setUnweightedValue(weatherData.tripTime);
          setCompleteData(weatherData.points);

        } else {
          setDisplayResults(true);
          setWeightedValue(routeLog[props.routeIndex].weightedValue);
          setUnweightedValue(routeLog[props.routeIndex].unweightedValue);
          setCompleteData(routeLog[props.routeIndex].completeData);
        }

        props.panelResetReceived();

        // const reset = document.createElement("div");
        // reset.innerHTML = "➜";
        // reset.className = "inline-button inline-button-reset";
        // reset.setAttribute("id", "inline-reset-button");
        // reset.addEventListener("click", ResetDisplay);
        // const resetContainer = document.getElementById(
        //   "inline-controls-div-fullscreen"
        // );

        // const existingReset = document.getElementById("inline-reset-button");
        // if (!existingReset) {
        //   container.prepend(reset);
        // }
      }
    }
    onLoad();
  });

  //handles submission fron Controls
  // just make this whole function async instead of making it a wrapper around an async function you're
  // calling immediately. also this function should probably live below the component, externally from it
  // and then you'd pass in whatever state/prop updater functions into it as arguments.
  const controlsToLeftPanel = (value) => {
    async function toLP(value) {
      setLoading(true);
      setBadTime(false);

      const weatherOptions = {
        'method': 'GET',
        'hostname': 'api.weather.gov',
        'headers': {
          // 'Content-Type': 'application/geo+json',
          // 'Accept': '*/*' ,
          // 'Connection': 'keep-alive',
          // 'X-Correlation-Id': crypto.randomUUID(),
          // 'X-Request-Id': crypto.randomUUID(),
          // 'X-Server-Id': 'truecommute.app',
          'User-Agent': 'truecommute.app'
        },
        'maxRedirects': 20
      };

      const originTimezoneFetch = await fetch(
        `https://api.weather.gov/points/${value.start[1].toFixed(
          4
        )},${value.start[0].toFixed(4)}`,
        weatherOptions
      );
      if (originTimezoneFetch.status >= 204) {
        setError(true);
      }

      const destinationTimezoneFetch = await fetch(
        `https://api.weather.gov/points/${value.end[1].toFixed(
          4
        )},${value.end[0].toFixed(4)}`,
        weatherOptions
      );
      if (destinationTimezoneFetch.status >= 204) {
        setError(true);
      }

      const originTimezoneResponseJson = await originTimezoneFetch.json();
      const originTimezoneResponse =
        originTimezoneResponseJson.properties.timeZone;
      // const originStateResponse =
      //   originTimezoneResponseJson.properties.relativeLocation.properties.state;

      const destTimezoneResponseJson = await destinationTimezoneFetch.json();
      const destTimezoneResponse = destTimezoneResponseJson.properties.timeZone;
      // const destStateResponse =
      //   destTimezoneResponseJson.properties.relativeLocation.properties.state;

      let timezoneOffset2;
      let origintimezoneAbr;

      let destTimezoneOffset2;
      let destTimezoneAbr;

      if (originTimezoneResponse === "America/Honolulu") {
        timezoneOffset2 = "-10:00";
        origintimezoneAbr = "HST";
      } else if (originTimezoneResponse === "America/Anchorage") {
        timezoneOffset2 = "-09:00";
        origintimezoneAbr = "AKST";
      } else if (originTimezoneResponse === "America/Los_Angeles") {
        timezoneOffset2 = "-08:00";
        origintimezoneAbr = "PST";
      } else if (originTimezoneResponse === "America/Denver") {
        timezoneOffset2 = "-07:00";
        origintimezoneAbr = "MST";
      } else if (originTimezoneResponse === "America/Chicago") {
        timezoneOffset2 = "-06:00";
        origintimezoneAbr = "CST";
      } else {
        timezoneOffset2 = "-05:00";
        origintimezoneAbr = "EST";
      }

      if (destTimezoneResponse === "America/Honolulu") {
        destTimezoneOffset2 = "-10:00";
        destTimezoneAbr = "HST";
      } else if (destTimezoneResponse === "America/Anchorage") {
        destTimezoneOffset2 = "-09:00";
        destTimezoneAbr = "AKST";
      } else if (destTimezoneResponse === "America/Los_Angeles") {
        destTimezoneOffset2 = "-08:00";
        destTimezoneAbr = "PST";
      } else if (destTimezoneResponse === "America/Denver") {
        destTimezoneOffset2 = "-07:00";
        destTimezoneAbr = "MST";
      } else if (destTimezoneResponse === "America/Chicago") {
        destTimezoneOffset2 = "-06:00";
        destTimezoneAbr = "CST";
      } else {
        destTimezoneOffset2 = "-05:00";
        destTimezoneAbr = "EST";
      }

      //get date and time of user
      const now = new Date();
      const nowString = now.toLocaleString("en-GB", {
        timeZone: value.arriveBy ? destTimezoneAbr : origintimezoneAbr,
      });
      //output in format 'dd/mm/yyyy, HH:mm:ss'

      let time;

      if (value.time.length < 8) {
        time = `0${value.time}`;
      } else {
        time = value.time;
      }

      let setHour = time.slice(0, 2);
      const setMin = time.slice(3, 5);
      const meridiem = time.slice(6, 8);

      //convert to 24hr format

      if (meridiem === "pm") {
        let setHourInteger = parseFloat(setHour) + 12;
        setHour = `${setHourInteger}`;
      }

      let dateTimeString;
      let dateTimeSec;

      //determines which timezone to use for map routing if user selects depart at vs arrive by routing
      let timeZoneOffsetString;
      if (value.arriveBy === false) {
        timeZoneOffsetString = timezoneOffset2;
      } else {
        timeZoneOffsetString = destTimezoneOffset2;
      }

      //putting together the time string to be used by mapbox, uses different logic if user selects today vs tomorrow
      if (!value.tomorrow) {
        dateTimeString = `${nowString.slice(6, 10)}-${nowString.slice(
          3,
          5
        )}-${nowString.slice(
          0,
          2
        )}T${setHour}:${setMin}:00${timeZoneOffsetString}`;
      } else {
        const tomorrowMil = now.getTime() + 86400000;
        const tomorrow = new Date(tomorrowMil);
        const tomorrowString = tomorrow.toLocaleString("en-GB", {
          timeZone: value.arriveBy ? destTimezoneAbr : origintimezoneAbr,
        });
        dateTimeString = `${tomorrowString.slice(6, 10)}-${tomorrowString.slice(
          3,
          5
        )}-${tomorrowString.slice(
          0,
          2
        )}T${setHour}:${setMin}:00${timeZoneOffsetString}`;
      }

      let dateTimeObj = new Date(dateTimeString);
      let dateTimeMil = dateTimeObj.getTime();
      dateTimeSec = dateTimeObj.getTime() / 1000;

      //making sure the user doesn't pick a time before now, if okay then the values are saved in an object and passed up to Content
      if (dateTimeMil < Date.now()) {
        setBadTime(true);
        setLoading(false);
      } else {
        const returnedValue = {
          start: value.start,
          end: value.end,
          time: value.time,
          arriveBy: value.arriveBy,
          tomorrow: value.tomorrow,
          toll: value.toll,
          ferry: value.ferry,
          motorway: value.motorway,
          unpaved: value.unpaved,
          startAdd: value.startAdd,
          endAdd: value.endAdd,
          dateTimeString: dateTimeString,
        };
        props.coordinatesToContent(returnedValue);

        // i would suggest using one state object that holds all of these values if you're going
        // to update them together like this. react allegedly groups updates to prevent
        // excessive UI recalculations but i wouldn't rely on that
        setTime(value.time);
        setSelectedTime(dateTimeSec);
        setTimeZoneOffset(timezoneOffset2);
        setStartAdd(value.startAdd);
        setEndAdd(value.endAdd);
        setArrivalOffset(destTimezoneOffset2);
        setOrigintimezoneAbr(origintimezoneAbr);
        setDestTimeZoneAbr(destTimezoneAbr);
        setArriveBy(value.arriveBy);
      }
    }
    toLP(value);
  };

  //resets results display so user can start over
  // i would say same thing about extracting this and passing in setters as args i think. if you were not to
  // do that, my other suggestion would be to wrap this (and any other functions defined inside of a functional
  // component) in useCallback
  const ResetDisplay = () => {
    // RED ALERT RED ALERT ABORT ABORT DO NOT DO THIS
    // Reference all elements via react refs, show/hide w/ state variables and/or CSS
    // NEVER mess w/ any elements managed by react w/ traditional DOM APIs
    //BD: fixed, reset button is now added to an existing div using a portal (below). 

    setRouteLog([]);

    props.removeRoutesReceived();

    // same thing here re: grouping state values that get updated together into the same object
    setDisplayResults(false);
    setWeightedValue(0);
    setUnweightedValue(0);
    setCompleteData([]);
    setTime("7:30 am");
    setLoading(false);
    setArriveBy(false);
  };

  if (error) {
    return (
      <div>
        <div>
          <Error />
        </div>
      </div>
    );
  } else {
    return (
      <div className="left-panel" id="left-panel">
        {displayResults ? (
          <>
          <Results
            timeZoneOffset={timeZoneOffset}
            ResetDisplay={ResetDisplay}
            newPanelRoute={props.newPanelRoute}
            completeData={completeData}
            unweightedValue={unweightedValue}
            weightedValue={weightedValue}
            startAdd={startAdd}
            endAdd={endAdd}
            time={time}
            arrivalOffset={arrivalOffset}
            origintimezoneAbr={origintimezoneAbr}
            destTimeZoneAbr={destTimeZoneAbr}
            timezoneDelta={timezoneDelta}
            arriveBy={arriveBy}
          />
          {createPortal(<ResetButton ResetDisplay={ResetDisplay}/>, document.getElementById(
    "resetPortal"))}
        </>) : (
          <Controls
            controlsToLeftPanel={controlsToLeftPanel}
            mapboxApiAccessToken={props.mapboxApiAccessToken}
            badTime={badTime}
            loading={loading}
          />
        )}
        <div className="left-panel-filler"></div>
      </div>
    );
  }
};

export default LeftPanel;
