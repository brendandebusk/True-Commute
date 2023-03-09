import React, { useMemo } from "react";
import "./App.css";
import { ReactComponent as Car } from "./icons/car.svg";
import ResultsItem from "./ResultsItem.js";

export default function Results(props) {
  const calculations = useMemo(() => {
    //grab origin + dest names
    const startAddIndex = props.startAdd.indexOf(",");
    const endAddIndex = props.endAdd.indexOf(",");
    const startString = props.startAdd.slice(0, startAddIndex);
    const endString = props.endAdd.slice(0, endAddIndex);

    let arrivalTimeZoneDigit = parseInt(props.arrivalOffset.slice(1, 3));
    let arrivalDataIndex = props.completeData.length - 1;

    const timeMil =
      (props.completeData[arrivalDataIndex].weatherDate + props.timezoneDelta) *
      1000;

    // wrap large chunks of work like this with the useMemo hook to avoid redoing it
    // every time react re-calculates this component
    //BD: done
    let arrivalMin;
    let arrivalHour;
    let arrivalMeridiem;
    const arrivalDate = new Date(timeMil);
    if (arrivalDate.getUTCHours() === 0) {
      arrivalHour = 12;
      arrivalMeridiem = "am";
    } else if (arrivalDate.getUTCHours() - arrivalTimeZoneDigit > 12) {
      arrivalHour = arrivalDate.getUTCHours() - arrivalTimeZoneDigit - 12;
      arrivalMeridiem = "pm";
    } else if (arrivalDate.getUTCHours() - arrivalTimeZoneDigit === 12) {
      arrivalHour = 12;
      arrivalMeridiem = "pm";
    } else {
      arrivalHour = arrivalDate.getUTCHours() - arrivalTimeZoneDigit;
      if (arrivalHour < 0) {
        arrivalHour = 12 - -1 * arrivalHour;
        arrivalMeridiem = "pm";
      } else {
        arrivalMeridiem = "am";
      }

      if (arrivalHour === 0) {
        arrivalHour = 12;
      }
    }

    if (arrivalDate.getMinutes() < 10) {
      arrivalMin = `0${arrivalDate.getMinutes()}`;
    } else {
      arrivalMin = arrivalDate.getMinutes();
    }

    const hhFormatWeighted = Math.floor(props.weightedValue / 3600);
    const mmFormatWeighted = Math.floor((props.weightedValue % 3600) / 60);

    let weightedReturnString =
      hhFormatWeighted > 0
        ? `${hhFormatWeighted} hr ${mmFormatWeighted} min`
        : `${mmFormatWeighted} min`;

    const hhFormatDelta = Math.floor(
      (props.weightedValue - props.unweightedValue) / 3600
    );
    const mmFormatDelta = Math.floor(
      ((props.weightedValue - props.unweightedValue) % 3600) / 60
    );

    let deltaReturnString =
      hhFormatDelta > 0
        ? `${hhFormatDelta} hr ${mmFormatDelta} min`
        : `${mmFormatDelta} min`;

    //creates new array with weather points that are affecting score
    let weatherReport = props.completeData.filter(
      (x) =>
        x.forecast.includes("Rain") ||
        x.forecast.includes("Snow") ||
        x.forecast.includes("Fog") ||
        x.forecast.includes("Visibility") ||
        x.forecast.includes("Thunderstorm")
    );

    weatherReport = weatherReport.filter((item) => item.state !== "NA");

    //reduces results quantity to 6
    // while (weatherReport.length > 6) {
    //     weatherReport = weatherReport.filter(function (_, i) {
    //         return (i + 1) % 3;
    //     })
    // }

    return {
      weatherReport: weatherReport,
      deltaReturnString: deltaReturnString,
      weightedReturnString: weightedReturnString,
      startString: startString,
      endString: endString,
      arrivalHour: arrivalHour,
      arrivalMin: arrivalMin,
      arrivalMeridiem: arrivalMeridiem,
    };

    // weatherReport, deltaReturnString, weightedReturnString, startString, endString, arrivalHour, arrivalMin, arrivalMeridiem
  }, [
    props.arrivalOffset,
    props.completeData,
    props.endAdd,
    props.startAdd,
    props.timezoneDelta,
    props.unweightedValue,
    props.weightedValue,
  ]);

  window.scrollTo(0, 0);

  return (
    <div className="results" id="results">
      <div
        className={props.newPanelRoute ? "results-grey" : "results-grey-hidden"}
      >
        Recalculating...
      </div>
      <div className="pill-grab"></div>
      <div className="results-header" id="results-header">
        <div className="car">
          <Car />
        </div>
        <div className="results-header-text">
          <h2>{calculations.weightedReturnString}</h2>
          <h4>Accounting for weather + traffic</h4>
        </div>
      </div>

      <div className="results-body" id="results-body">
        <div className="results-summary-container">
          <div className="results-summary-row">
            <div className="results-summary-line-left">
              <span className="results-summary-title">FROM</span>
            </div>
            <div className="results-summary-line-left">
              {calculations.startString}
            </div>
          </div>
          <div className="results-summary-row">
            <div className="results-summary-line-right">
              <span className="results-summary-title">TO</span>
            </div>
            <div className="results-summary-line-right">
              {calculations.endString}
            </div>
          </div>
        </div>
        <div className="results-summary-container">
          <div className="results-summary-row">
            <div className="results-summary-line-left">
              <span className="results-summary-title">
                {props.arriveBy ? "DEPART AT" : "DEPART AT"}
              </span>
            </div>
            <div className="results-summary-line-left">
              {props.time} {props.origintimezoneAbr}
            </div>
          </div>
          <div className="results-summary-row">
            <div className="results-summary-line-right">
              <span className="results-summary-title">
                {props.arriveBy ? "ARRIVE BY" : "ARRIVE AROUND"}
              </span>
            </div>
            <div className="results-summary-line-right">
              {calculations.arrivalHour}:{calculations.arrivalMin}{" "}
              {calculations.arrivalMeridiem} {props.destTimeZoneAbr} {}
            </div>
          </div>
        </div>

        {/* deltaReturnString */}
        {/* `Weather impacting your drive, times below in origin timezone` */}

        <h4>
          {calculations.weatherReport.length > 0
            ? `Weather conditions are expected to add ${calculations.deltaReturnString} to your drive. Below are conditions you can expect along the way, time displayed in origin timezone.`
            : `Weather conditions along your drive are expected to be favorable and
            should not impact trip time`}
        </h4>
        {calculations.weatherReport.map((x, index) => (
          <ResultsItem
            key={index}
            forecast={x.forecast}
            place={x.place}
            state={x.state}
            weatherDate={x.weatherDate}
            start={x.weatherDate - x.duration}
            timeZoneOffset={props.timeZoneOffset}
            origintimezoneAbr={props.origintimezoneAbr}
          />
        ))}
        <div
          className="submit"
          id="reset-full-size"
          onClick={props.ResetDisplay}
        >
          Reset
        </div>
      </div>
    </div>
  );
}
