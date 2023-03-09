import React from 'react';
import './App.css';
import WeatherIcon from './WeatherIcon.js';

//start
//weatherDate

const ResultsItem = (props) => {

    let timeZoneDigit = parseInt(props.timeZoneOffset.slice(1, 3));

    const timeMil = props.weatherDate * 1000;
    const date = new Date(timeMil);
    let min;
    let hour;
    let meridiem;
    let dayShift;

    // let getHours = date.getHours();
    // let getMins = date.getMinutes();

    if (date.getUTCHours() === 0) {
        hour = 12;
        meridiem = 'am';
        //////add logic to deal with negative hour value from timezonedigit
    } else if ((date.getUTCHours() - timeZoneDigit) > 12) {
        hour = (date.getUTCHours() - timeZoneDigit) - 12;
        meridiem = 'pm';
    } else if ((date.getUTCHours() - timeZoneDigit) === 12) {
        hour = 12;
        meridiem = 'pm';
    } else {
        hour = date.getUTCHours() - timeZoneDigit;
        if (hour < 0) {
            hour = 12 - (-1 * hour);
            meridiem = 'pm';
        } else {
            meridiem = 'am';
        }

        if (hour === 0) {
            hour = 12;
        }
    }

    if (date.getMinutes() < 10) {
        min = `0${date.getMinutes()}`;
    } else {
        min = date.getMinutes();
    }

    const start = props.start * 1000;
    const startDate = new Date(start);

    const weather = props.weatherDate * 1000;
    const weatherDate = new Date(weather);

    if ((weatherDate.getDate() - startDate.getDate()) >= 0) {
        if ((weatherDate.getDate() - startDate.getDate()) > 0) {
            dayShift = `+${weatherDate.getDate() - startDate.getDate()}d`
        } else {
            dayShift = "";
        }
    } else {
        // console.log('different month');
        let n = 0;
        let deltaCheck = 1;

        while (deltaCheck === 1) {
            const preShiftDate = (n * 86400 * 1000) + start;
            n++;
            const shiftDate = (n * 86400 * 1000) + start;
            deltaCheck = shiftDate - preShiftDate;
        }
        // eslint-disable-next-line
        dayShift = `+${n + weatherDate.getDate()}d`
    }

    let location = `${props.place}, ${props.state}`;
    // if (location.length > 17) {
    //     location = location.substring(0, 14) + '...';
    // }

    return (
        <div className='results-item'>
            <div className='results-time'>{`${hour}:${min} ${meridiem}`}
                {/* <br></br><span className='results-time-day'>{dayShift}</span> */}
            </div>
            <div className='results-icon'><WeatherIcon forecast={props.forecast} /></div>
            <div className='results-location'>{location}</div>
        </div>
    )

}

export default ResultsItem