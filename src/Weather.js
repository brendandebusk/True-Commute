const weatherOptions = {
  method: "GET",
  hostname: "api.weather.gov",
  cache: "no-store",
  headers: {
    // 'Content-Type': 'application/geo+json',
    // 'Accept': '*/*' ,
    // 'Connection': 'keep-alive',
    // 'X-Correlation-Id': crypto.randomUUID(),
    // 'X-Request-Id': crypto.randomUUID(),
    // 'X-Server-Id': 'truecommute.app',
    "User-Agent": "truecommute.app",
  },
  maxRedirects: 20,
};

export async function getWeather(route, setTime, duration, accessToken) {
  //from the route selected, grabbing the data we want from the response -- coordinates is an array of [lot,lat] points along the route
  const coordinatesData = route.coordinates[0];

  let tripTime;

  tripTime = duration;

  //removing first coordinates of route, assigning it to prevRef
  //first coordinate is wrapped in an additional array, this removes that outer layer
  let prevRef = coordinatesData.splice(0, 1)[0];

  console.log("initializing points array");
  //initializing an array of objects for storing the points that will be used to grab weather conditions
  let points = [
    {
      lon: prevRef[0],
      lat: prevRef[1],
      duration: 0,
    },
  ];

  console.log("finding points");
  //run through all points for json, log points that are 50mi apart

  coordinatesData.forEach((x) => {
    const coords1 = [prevRef[0], prevRef[1]];
    const coords2 = [x[0], x[1]];

    const d = haversineDistance(coords1, coords2, true);

    if (d >= 50) {
      points.push({
        lon: x[0],
        lat: x[1],
      });
      prevRef = x;
    }

    if (d >= 100) {
      const m = midpointCalc(coords1, coords2);
      points.push({
        lon: m[0],
        lat: m[1],
      });
    }
  });

  //add destination to array as final point
  points.push({
    lon: coordinatesData[coordinatesData.length - 1][0],
    lat: coordinatesData[coordinatesData.length - 1][1],
  });

  console.log("finding duration of each point");
  points.forEach((v, i) => {
    v.point = i;
    //calculate duration for each point
    const numOfLegs = points.length - 1;
    const duration = tripTime / numOfLegs;
    v.duration = duration * i;
    //calculate time to check weather at each point
    v.weatherDate = getWeatherDate(v.duration, tripTime, setTime);
  });

  console.log("getting weather at each point");
  //check weather at each point

  let forecastData = await checkForecast(points);
  await parseForecast(points, forecastData);

  console.log("calculating weight score");
  //calculate weight score
  const weight = calculateScore(points);

  console.log("converting to hh:mm");
  //report new duration
  //this is in seconds
  const weightedDuration = weight * tripTime;

  console.log("reversing coordinates");
  await reverseAddress(points, accessToken);

  return {
    tripTime: tripTime,
    weightedDuration: weightedDuration,
    points: points,
  };
}

//haversine function, inputs accepted in [long, lat] format
function haversineDistance(coords1, coords2, isMiles) {
  function toRad(x) {
    return (x * Math.PI) / 180;
  }

  var lon1 = coords1[0];
  var lat1 = coords1[1];

  var lon2 = coords2[0];
  var lat2 = coords2[1];

  var R = 6371; // km

  var x1 = lat2 - lat1;
  var dLat = toRad(x1);
  var x2 = lon2 - lon1;
  var dLon = toRad(x2);
  var a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) *
      Math.cos(toRad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  var d = R * c;

  if (isMiles) d /= 1.60934;

  return d;
}

//midpoint formula
function midpointCalc(coords1, coords2) {
  var lon1 = coords1[0];
  var lat1 = coords1[1];

  var lon2 = coords2[0];
  var lat2 = coords2[1];

  const m = [(lon1 + lon2) / 2, (lat1 + lat2) / 2];

  return m;
}

//used to iterate through every weather point, with duration pulled from object -- setTime/setTomorrow pulled from userform, with setTime in "12:00 AM" format and setTomorrow is true/false -- arriveAt is true/false
function getWeatherDate(duration, tripTime, setTime) {
  let dateTimeSec = setTime;
  let weatherStart = dateTimeSec;

  //in UTC (seconds)
  return weatherStart + duration;
}

//updated checkForecast - creates array of fetch URLs
async function checkForecast(points) {
  const promises = points.map((p) =>
    fetch(
      `https://api.weather.gov/points/${p.lat.toFixed(4)},${p.lon.toFixed(4)}`,
      weatherOptions
    )
  );
  const allResponses = await Promise.all(promises);
  const allResponseBodies = await Promise.all(
    allResponses.map((r) => r.json())
  );
  const responseData1 = allResponseBodies.map((fq) =>
    fq.status >= 204 ? "bad-location" : fq.properties.forecastHourly
  );

  return responseData1;
}

async function parseForecast(points, forecastData) {
  //multiple fetches to address weather.gov caching issues, need to find more elegant solution
  const promises = forecastData.map((v) =>
    v === "bad-location" ? "bad-location" : fetch(v, weatherOptions)
  );
  // eslint-disable-next-line
  const firstResponses = Promise.all(promises);

  const promises2 = forecastData.map((v) =>
    v === "bad-location" ? "bad-location" : fetch(v, weatherOptions)
  );
  // eslint-disable-next-line
  const secondResponses = await Promise.all(promises2);

  const promises3 = forecastData.map((v) =>
    v === "bad-location" ? "bad-location" : fetch(v, weatherOptions)
  );

  const allResponses = await Promise.all(promises3);
  const responseData2 = await Promise.all(
    allResponses.map((r) => (r === "bad-location" ? "bad-location" : r.json()))
  );

  points.forEach((v, i) => {
    const weatherDateMil = v.weatherDate * 1000;
    const date = new Date(weatherDateMil);
    const setMonth = date.getUTCMonth() + 1;
    const setDay = date.getUTCDate();
    const setHour = date.getUTCHours();
    // eslint-disable-next-line
    const setMin = date.getUTCMinutes();

    let data;
    if (responseData2[i] === "bad-location") {
      v.forecast = i === 0 ? "Clear" : points[i - 1].forecast;
    } else if (responseData2[i].status >= 204 && v.point !== 0) {
      v.forecast = points[v.point - 1].forecast;
    } else if (responseData2[i].status >= 204 && v.point === 0) {
      v.forecast = "Clear";
    } else {
      data = responseData2[i].properties.periods;
      data.forEach((z, i) => {
        if (z.startTime === undefined && v.point !== 0) {
          v.forecast = points[v.point - 1].forecast;
        } else if (z.startTime === undefined && v.point === 0) {
          v.forecast = "Clear";
        } else {
          const dataDate = new Date(z.startTime);
          if (dataDate.getUTCMonth() + 1 === setMonth) {
            if (dataDate.getUTCDate() === setDay) {
              if (dataDate.getUTCHours() === setHour) {
                v.forecast = z.shortForecast;
              }
            }
          }
        }
      });
    }
  });
}

//calculates a multiplier from average trip time to create time estimate
function calculateScore(points) {
  //weights
  const clearWeight = 1;
  const lightrainWeight = 1.05;
  const heavyrainWeight = 1.08;
  const lightsnowWeight = 1.13;
  const heavysnowWeight = 1.2;
  const fogWeight = 1.12;

  let weightsArray = [];

  points.forEach((v) => {
    let weight;
    try {
      if (v.forecast.includes("Rain")) {
        if (v.forecast.includes("Heavy")) {
          weight = heavyrainWeight;
        } else {
          weight = lightrainWeight;
        }
      } else if (v.forecast.includes("Snow")) {
        if (v.forecast.includes("Heavy")) {
          weight = heavysnowWeight;
        } else if (v.forecast.includes("Chance Snow Showers")) {
          weight = heavysnowWeight;
        } else if (v.forecast.includes("Patchy Blowing Snow")) {
          weight = heavysnowWeight;
        } else {
          weight = lightsnowWeight;
        }
      } else if (v.forecast.includes("Fog")) {
        weight = fogWeight;
      } else if (v.forecast.includes("Visiblity")) {
        weight = fogWeight;
      } else if (v.forecast.includes("Thunderstorm")) {
        weight = heavyrainWeight;
      } else {
        weight = clearWeight;
      }
    } catch (error) {
      console.error(error);
    }
    weightsArray.push(weight);
  });

  const weightAvg =
    weightsArray.reduce((a, b) => a + b, 0) / weightsArray.length;
  console.log(`Score is ${weightAvg}`);
  return weightAvg;
}

async function reverseAddress(points, accessToken) {
  const promises = points.map((p) =>
    fetch(
      `https://api.mapbox.com/geocoding/v5/mapbox.places/${p.lon},${p.lat}.json?country=us&limit=1&types=place&access_token=${accessToken}`
    )
  );

  const response = await Promise.all(promises);
  const responseBodies = await Promise.all(response.map((r) => r.json()));

  responseBodies.forEach((v, i) => {
    if (v.status >= 204) {
      points[i].state = "NA";
      points[i].place = "Undefined";
    } else {
      const returnedState = v.features[0].context[1].short_code;
      points[i].state = returnedState.slice(3, 5);
      points[i].place = v.features[0].text;
    }
  });
}
