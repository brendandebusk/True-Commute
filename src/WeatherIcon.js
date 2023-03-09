import React from 'react';
import './App.css';
import { ReactComponent as Fog } from "./icons/foggy.svg";
import { ReactComponent as Snow } from "./icons/snow.svg";
import { ReactComponent as Rain } from "./icons/rain.svg";
import { ReactComponent as Thunderstorm } from "./icons/thunderstorm.svg";
import { ReactComponent as Sunny } from "./icons/sunny.svg";

const WeatherIcon = (props) => {

    if (props.forecast.includes("Rain")) {
        return (
            <Rain />
        )
    } else if (props.forecast.includes("Snow")) {
        return (
            <Snow />
        )
    } else if (props.forecast.includes("Fog") || props.forecast.includes("Visiblity")) {
        return (
            <Fog />
        )
    } else if (props.forecast.includes("Thunderstorm")) {
        return (
            <Thunderstorm />
        )
    } else {
        return (
            <Sunny />
        )
    }
}

export default WeatherIcon