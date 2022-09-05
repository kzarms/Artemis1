import clock from "clock";
import * as document from "document";
import { battery } from 'power';
import { display } from "display";
import { HeartRateSensor } from 'heart-rate';
import { today } from "user-activity";
import { user } from "user-profile";
import * as util from "../common/utils";

const app_time = document.getElementById("app_time");
const battery_level_element = document.getElementById("bat_level");
const heart_rate_element = document.getElementById("heart_rate");
const week_day = document.getElementById("week_day");
const date_day = document.getElementById("date_day");

const earth = document.getElementById("earth");
const moon = document.getElementById("moon");
const prgs = document.getElementById("prgs");
const prgsText = document.getElementById("prgsText");
const dataText = document.getElementById("dataText");

// Set days array
let days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
// Set global display value:
let dataTextCurrent = 0
// Set UTC time to start
const artemisStart = new Date('2022-09-02T19-17-00');
const artemisEnd = new Date('2022-10-10T12-00-00');
// Calculate static mission time in seconds
const missionSeconds = Math.floor((artemisEnd - artemisStart) / 1000);

function missionProgress() {
  const nowTime = Date.now();
  if(nowTime < artemisStart ){
    console.log("Mission is not started yet");
    return 0
  }
  if (nowTime > artemisEnd) {
    console.log("Mission has been completed");
    return 100
  }
  // Calculate progress
  console.log(`Mission time T: ${String(missionSeconds)} seconds`);
  const nowSeconds = Math.floor((nowTime - artemisStart) / 1000);
  console.log(`Mission time C: ${String(nowSeconds)} seconds`);
  const progress = Math.floor(nowSeconds/missionSeconds*100);
  console.log(`Progress: ${String(progress)}`);
  return progress
}

function dataTextUpdate(){
  if (dataTextCurrent === 0) {
    // Steps
    //console.log(`Stp: ${today.adjusted.steps}`);
    dataText.text = `Stp: ${today.adjusted.steps}`;
  } else if (dataTextCurrent === 1) {
    // Floors on display switch to next
    //console.log(`Flr: ${today.adjusted.elevationGain}`);
    dataText.text = `Flr: ${today.adjusted.elevationGain}`;
  } else {
    // Distance
    //console.log(`Dst: ${today.adjusted.distance}`);
    dataText.text = `Dst: ${today.adjusted.distance}`;
  }
}

dataText.addEventListener("click", () => {
  if (dataTextCurrent < 2) {
    dataTextCurrent += 1;
  } else {
    dataTextCurrent = 0;
  }
  dataTextUpdate();
});

// Hart rate sensor even handling
if (HeartRateSensor) {
  console.log("This device has a HeartRateSensor!");
  const hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () => {
    // Set color based on user profile
    let hrRate = hrm.heartRate;
    let hrZone = user.heartRateZone(hrRate);
    // Set HR value
    if (hrRate === null) {
      heart_rate_element.text = "--❤️";
    } else {
      heart_rate_element.text = hrRate + "❤️";
    }
    // Set HR color
    if (hrZone === "fat-burn"){
      heart_rate_element.style.fill = "fb-yellow";
    } else if (hrZone === "cardio") {
      heart_rate_element.style.fill = "fb-orange";
    } else if (hrZone === "peak") {
      heart_rate_element.style.fill = "fb-red";
    } else {
      heart_rate_element.style.fill = "white";
    }
    // console.log(hrZone);
  });
  // Automatically stop the sensor when the screen is off to conserve battery
  display.addEventListener("change", () => {
    display.on ? hrm.start() : hrm.stop();
  });
  // First start
  hrm.start();
} else {
  console.log("This device does NOT have a HeartRateSensor!");
}

// Set automation for display on and off
display.addEventListener("change", () => {
  if(display.on) {
    earth.animate("enable");
    moon.animate("enable");
    prgs.sweepAngle = missionProgress();
    prgsText.text = `${missionProgress()}%`;
  } else {
    earth.animate("disable");
    moon.animate("disable");
  }
});

// Update the clock every second
clock.granularity = "seconds";

clock.ontick = (evt) => {
  let today_time = evt.date;
  // Set time
  let hours = today_time.getHours();
  hours = util.zeroPad(hours);
  let mins = util.zeroPad(today_time.getMinutes());
  app_time.text = `${hours}:${mins}`;

  // Set day and date
  week_day.text = days[today_time.getDay()];
  date_day.text = util.zeroPad(today_time.getDate());

  // Battery
  battery_level_element.text = Math.floor(battery.chargeLevel) + "%";
  if (battery.chargeLevel < 10) {
		battery_level_element.style.fill = "fb-red";
	} else if (battery.chargeLevel < 20) {
		battery_level_element.style.fill = "fb-orange";
	} else {
    battery_level_element.style.fill = "white";
  }
  //console.log(battery_level_element.text)
  // Data Info
  dataTextUpdate();
}

// Execution on start
prgs.sweepAngle = missionProgress();
prgsText.text = `${prgs.sweepAngle}%`;
// Update data text
dataTextUpdate();
// Run animation once
earth.animate("enable");
moon.animate("enable");
