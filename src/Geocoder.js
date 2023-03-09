import { useState, useEffect, useMemo } from "react";
import PropTypes from "prop-types";
import MapboxClient from "mapbox";
import ClipLoader from "react-spinners/ClipLoader.js";
import "./App.css";

const Geocoder = (props) => {

  const [results, setResults] = useState([]);
  const [showResults, setShowResults] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const [findingUserLocation, setFindingUserLocation] = useState(false);
  
  const client = useMemo(() => {
    return new MapboxClient(props.mapboxApiAccessToken);
  }, [props.mapboxApiAccessToken])
  
  let debounceTimeout = null;

  useEffect(() => {
    if (inputValue.length === 0 && props.initialInputValue !== "") {
      setInputValue(props.initialInputValue)
    }
  },
  [props.initialInputValue, inputValue])

  function onChange(event) {
    const { timeout, queryParams, localGeocoder, limit, localOnly } =
      props;
    const queryString = event.target.value;

    setInputValue(event.target.value);

    clearTimeout(debounceTimeout);

    debounceTimeout = setTimeout(() => {
      const localResults = localGeocoder ? localGeocoder(queryString) : [];
      const params = {
        ...queryParams,
        ...{ limit: limit - localResults.length },
      };

      if (params.limit > 0 && !localOnly && queryString.length > 0) {
        client.geocodeForward(queryString, params).then((res) => {
          setResults([...localResults, ...res.entity.features]);
          // console.log(res);
        });
      } else {
        setResults(localResults);
      }
    }, timeout);
  }

  function onSelected(item) {
    props.parentCallback(item);
    const { hideOnSelect, formatItem, updateInputOnSelect } = props;

    if (hideOnSelect) {
      setResults([]);
    }

    if (updateInputOnSelect) {
      setInputValue(formatItem(item));
    }

    props.grabAddressString(formatItem(item));
  }

  function showResultsFunc() {
    setShowResults(true);
  }

  function hideResults() {
    setTimeout(() => {
      setShowResults(false);
    }, 300);
  }

  /////current location logic

  function getCurrentLocation() {
    setFindingUserLocation(true);

    const currentLocationOptions = {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      };

    navigator.geolocation.getCurrentPosition(
      currentLocationSuccess,
      currentLocationError,
      currentLocationOptions
    );
  }

  function currentLocationError(err) {
    console.log(err);
    alert(
      "Unable to get current location. Please make sure location services are enabled."
    );
    setFindingUserLocation(false);
  }

  async function currentLocationSuccess(loc) {
    console.log("success");
    const returnedValue = {
      center: [loc.coords.longitude, loc.coords.latitude],
    };
    //return value to controls
    props.parentCallback(returnedValue);

    //reverse geocode to update input to be user readable
    const response = await fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${loc.coords.longitude},${loc.coords.latitude}.json?country=us&limit=1&access_token=${props.mapboxApiAccessToken}`
    );
    const responseBody = await response.json();
    const inputValue = responseBody.features[0].place_name;

    setInputValue(inputValue);
    props.grabAddressString(inputValue);
    setFindingUserLocation(false);
  }

    const { formatItem, className, inputComponent, itemComponent } = props;

    const Input = inputComponent || "input";
    const Item = itemComponent || "div";

    return (
      <div className="geocoder-container">
      <div className={`react-geocoder ${className}`}>
        <Input
          type="search"
          placeholder="Address"
          onChange={onChange}
          onBlur={hideResults}
          onFocus={showResultsFunc}
          value={inputValue}
        />

        {showResults && !!results.length && (
          <div className="react-geocoder-results">
            {results.map((item, index) => (
              <Item
                key={index}
                className="react-geocoder-item"
                onClick={() => onSelected(item)}
                item={item}
              >
                {formatItem(item)}
              </Item>
            ))}
          </div>
        )}
      </div>
              <div
              alt="Find my location"
              className="findLocationButton"
              onClick={getCurrentLocation}
            >
              <h3>
                {findingUserLocation ? (
                  <ClipLoader speedMultiplier={0.8} color="#151515" size={20} />
                ) : (
                  `➤`
                )}
              </h3>
            </div>
            </div>
    );
}

Geocoder.propTypes = {
  timeout: PropTypes.number,
  queryParams: PropTypes.object,
  transitionDuration: PropTypes.number,
  hideOnSelect: PropTypes.bool,
  pointZoom: PropTypes.number,
  mapboxApiAccessToken: PropTypes.string.isRequired,
  formatItem: PropTypes.func,
  className: PropTypes.string,
  inputComponent: PropTypes.func,
  itemComponent: PropTypes.func,
  limit: PropTypes.number,
  localGeocoder: PropTypes.func,
  localOnly: PropTypes.bool,
  updateInputOnSelect: PropTypes.bool,
  initialInputValue: PropTypes.string,
};

Geocoder.defaultProps = {
  timeout: 300,
  transitionDuration: 0,
  hideOnSelect: false,
  updateInputOnSelect: false,
  pointZoom: 16,
  formatItem: (item) => item.place_name,
  queryParams: {},
  className: "",
  limit: 5,
  initialInputValue: "",
};

export default Geocoder;
