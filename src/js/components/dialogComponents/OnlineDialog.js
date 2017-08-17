import React, { Component } from 'react';
import MuiThemeProvider from 'material-ui/styles/MuiThemeProvider';
import { Checkbox } from 'material-ui';

const OnlineDialog = (checkBoxAction) => {
    return (
        <MuiThemeProvider>
            <div>
                <p style={{ fontSize: 15 }}>
                  You are about to transmit data over the Internet.
                  <br/>
                  Are you sure you want to do that?
                </p>
                <div style={{ display: 'flex' }}>
                    <Checkbox
                        style={{ width: "0px", marginRight: -10 }}
                        iconStyle={{ fill: 'black' }}
                        labelStyle={{ color: "var(--reverse-color)", opacity: "0.7", fontWeight: "500" }}
                        onCheck={(e) => {
                            checkBoxAction(e.target.checked)
                        }}
                    />
                    Do not show this warning again</div>
            </div>
        </MuiThemeProvider>
    );
}

export default OnlineDialog;
