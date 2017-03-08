const dispatch = require("../pages/root").dispatch;
const Konami = require("konami-code");
const SettingsActions = require("../actions/SettingsActions");

new Konami (() => {
  console.log("this works!");
  alert("No tech support beyond this point");
  dispatch(SettingsActions.toggleSettings("developerMode"));
})
