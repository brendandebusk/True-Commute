import React from "react";

const LearnMore = () => {
  return (
    <div>
      TrueCommute calculates a more accurate estimate for your commute time by
      tying together traffic data (historical and current when applicable) with
      weather forecasts along your route.
      <br></br>
      <br></br>
      v1.1 released 2/28/2023.
      <br></br>
      <br></br>
      Coming soon:
      <br></br>
      <ul>
        <li>DST accomodations</li>
        <li>Algorithm speed improvements</li>
        <li>User presets</li>
        <li>Improved error handling</li>
      </ul>
      Developed by Brendan DeBusk
      <br></br>
      <a
        href="https://www.brendandebusk.com"
        target="_blank"
        rel="noopener noreferrer"
      >
        www.brendandebusk.com
      </a>
    </div>
  );
};

export default LearnMore;
