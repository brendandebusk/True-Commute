import React from 'react';
import './App.css';

const ResetButton = (props) => {
      
    return(
        <div>
            <div className="inline-button inline-button-reset" id="inline-reset-button" onClick={props.ResetDisplay}>➜</div>
        </div>
    )
}

export default ResetButton;
