import React, { useState, useCallback } from "react";
import "./App.css";
import DateToggleButton from "./DateToggleButton.js";
import ArrivalToggleButton from "./ArrivalToggleButton.js";
import Dropdown from "react-dropdown";
import ClipLoader from "react-spinners/ClipLoader.js";
import Geocoder from "./Geocoder.js";

const Controls = (props) => {
  const [start, setStart] = useState(null);
  const [end, setEnd] = useState(null);
  const [arriveBy, setArriveBy] = useState(false);
  const [tomorrow, setTomorrow] = useState(false);
  const [showLocError, setShowLocError] = useState(false);
  const [toll, setToll] = useState(false);
  const [motorway, setMotorway] = useState(false);
  const [ferry, setFerry] = useState(false);
  // eslint-disable-next-line
  const [unpaved, setUnpaved] = useState(false);
  const [startAdd, setStartAdd] = useState(null);
  const [endAdd, setEndAdd] = useState(null);
  //time defined below after logic to set default value (close to user's current time)

  const options = [
    "12:00 am",
    "12:15 am",
    "12:30 am",
    "12:45 am",
    "1:00 am",
    "1:15 am",
    "1:30 am",
    "1:45 am",
    "2:00 am",
    "2:15 am",
    "2:30 am",
    "2:45 am",
    "3:00 am",
    "3:15 am",
    "3:30 am",
    "3:45 am",
    "4:00 am",
    "4:15 am",
    "4:30 am",
    "4:45 am",
    "5:00 am",
    "5:15 am",
    "5:30 am",
    "5:45 am",
    "6:00 am",
    "6:15 am",
    "6:30 am",
    "6:45 am",
    "7:00 am",
    "7:15 am",
    "7:30 am",
    "7:45 am",
    "8:00 am",
    "8:15 am",
    "8:30 am",
    "8:45 am",
    "9:00 am",
    "9:15 am",
    "9:30 am",
    "9:45 am",
    "10:00 am",
    "10:15 am",
    "10:30 am",
    "10:45 am",
    "11:00 am",
    "11:15 am",
    "11:30 am",
    "11:45 am",

    "12:00 pm",
    "12:15 pm",
    "12:30 pm",
    "12:45 pm",
    "1:00 pm",
    "1:15 pm",
    "1:30 pm",
    "1:45 pm",
    "2:00 pm",
    "2:15 pm",
    "2:30 pm",
    "2:45 pm",
    "3:00 pm",
    "3:15 pm",
    "3:30 pm",
    "3:45 pm",
    "4:00 pm",
    "4:15 pm",
    "4:30 pm",
    "4:45 pm",
    "5:00 pm",
    "5:15 pm",
    "5:30 pm",
    "5:45 pm",
    "6:00 pm",
    "6:15 pm",
    "6:30 pm",
    "6:45 pm",
    "7:00 pm",
    "7:15 pm",
    "7:30 pm",
    "7:45 pm",
    "8:00 pm",
    "8:15 pm",
    "8:30 pm",
    "8:45 pm",
    "9:00 pm",
    "9:15 pm",
    "9:30 pm",
    "9:45 pm",
    "10:00 pm",
    "10:15 pm",
    "10:30 pm",
    "10:45 pm",
    "11:00 pm",
    "11:15 pm",
    "11:30 pm",
    "11:45 pm",
  ];

  const now = new Date();

  let nowHour = now.getHours();
  let nowMin = now.getMinutes();

  let formattedHour = "12";
  let formattedMin = "30";
  let formattedMeridiem = "am";
  let formattedNowString = "7:30 am";

  if (nowMin < 15) {
    formattedMin = "15";
  } else if (nowMin >= 15 && nowMin < 30) {
    formattedMin = "30";
  } else if (nowMin >= 30 && nowMin < 45) {
    formattedMin = "45";
  } else {
    formattedMin = "00";
    nowHour++;
    if (nowHour === 24) {
      nowHour = 0;
    }
  }

  if (nowHour === 0) {
    formattedHour = "12";
  } else if (nowHour > 12) {
    formattedHour = `${nowHour - 12}`;
    formattedMeridiem = "pm";
  } else {
    formattedHour = `${nowHour}`;
  }

  formattedNowString = `${formattedHour}:${formattedMin} ${formattedMeridiem}`;

  const defaultOption =
    options[options.findIndex((element) => element === formattedNowString)];

  const [time, setTime] = useState(formattedNowString);

  const queryParams = {
    country: "us",
  };

  let run = useCallback(() => {
    console.log(arriveBy);
    if (start === null || end === null) {
      setShowLocError(true);
    } else if (props.loading === false) {
      console.log(start);
      const returnedValue = {
        start: start,
        end: end,
        time: time,
        arriveBy: arriveBy,
        tomorrow: tomorrow,
        toll: toll,
        ferry: ferry,
        motorway: motorway,
        unpaved: unpaved,
        startAdd: startAdd,
        endAdd: endAdd,
      };
      setShowLocError(false);
      props.controlsToLeftPanel(returnedValue);
    }
    // eslint-disable-next-line
  }, [
    start,
    end,
    time,
    arriveBy,
    tomorrow,
    toll,
    ferry,
    motorway,
    unpaved,
    startAdd,
    endAdd,
  ]);

  return (
    <div className="controls">
      <h2>Origin</h2>
      <Geocoder
        mapboxApiAccessToken={props.mapboxApiAccessToken}
        parentCallback={(response) => setStart(response.center)}
        updateInputOnSelect={true}
        limit={5}
        queryParams={queryParams}
        grabAddressString={(response) => setStartAdd(response)}
      />
      <h2>Destination</h2>
      <Geocoder
        mapboxApiAccessToken={props.mapboxApiAccessToken}
        parentCallback={(response) => setEnd(response.center)}
        updateInputOnSelect={true}
        limit={5}
        queryParams={queryParams}
        grabAddressString={(response) => setEndAdd(response)}
      />
      <h2>Avoid</h2>
      <div className="controls-line3">
        <div className="controls-line3-child">
          <div className="controls-line3-child-child">
            <input
              type="checkbox"
              className="options-checkbox"
              id="tolls"
              name="tolls"
              onChange={(event) => setToll(event.target.checked)}
            />
            <div className="controls-line3-label">
              <h4>Tolls</h4>
            </div>
          </div>
          <div className="controls-line3-child-child">
            <input
              type="checkbox"
              className="options-checkbox"
              id="ferries"
              name="ferries"
              onChange={(event) => setFerry(event.target.checked)}
            />
            <div className="controls-line3-label">
              <h4>Ferries</h4>
            </div>
          </div>
        </div>

        <div className="controls-line3-child">
          <div className="controls-line3-child-child">
            <input
              type="checkbox"
              className="options-checkbox"
              id="highways"
              name="highways"
              onChange={(event) => setMotorway(event.target.checked)}
            />
            <div className="controls-line3-label">
              <h4>Highways</h4>
            </div>
          </div>
          {/* disabled for now since not support by most mapping services
          <div className="controls-line3-child-child">
            <input
              type="checkbox"
              className="options-checkbox"
              id="dirt"
              name="dirt"
              onChange={(event) => setUnpaved(event.target.checked)}
            />
            <div className="controls-line3-label">
              <h4>Unpaved Roads</h4>
            </div>
          </div> */}
        </div>
      </div>

      <div className="controls-line1">
        <h2>When</h2>
        <ArrivalToggleButton parentCallback={(value) => setArriveBy(value)}/>
      </div>

      <div className="controls-line1">
        <DateToggleButton parentCallback={(value) => setTomorrow(value)} />
      </div>

      <div className="controls-line2">
        <div className="time-select">
          <Dropdown
            options={options}
            onChange={(response) => setTime(response.value)}
            value={defaultOption}
          />
        </div>
        <div className="submit" onClick={run}>
          {props.loading ? <> <ClipLoader
          color={"#FFFFFF"}
          size={20}
          speedMultiplier={0.8}
        /></> : <>Submit</>}
        </div>
      </div>
      <div
        className={
          showLocError ? "controls-error-line" : "controls-error-line-hidden"
        }
      >
        Please set an origin and destination address
      </div>
      {/* <div
        className={
          props.loading ? "controls-error-line" : "controls-error-line-hidden"
        }
      >
        Checking the weather along your drive
      </div> */}
      <div
        className={
          props.badTime ? "controls-error-line" : "controls-error-line-hidden"
        }
      >
        Selected departure time is in the past. Please select a departure time
        that is now or in the future.
      </div>
    </div>
  );
};

export default Controls;
