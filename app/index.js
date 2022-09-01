import clock from "clock";
import * as document from "document";
import { battery } from 'power';
import { display } from "display";
import { HeartRateSensor } from 'heart-rate';
import { preferences } from "user-settings";
import * as util from "../common/utils";

const appTime = document.getElementById("appTime");

const battery_level_element = document.getElementById("bat_level");
const heart_rate_element = document.getElementById("heart_rate");
const earth = document.getElementById("earth");
const moon = document.getElementById("moon");
const prgs = document.getElementById("prgs");
const prgsText = document.getElementById("prgsText");

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
// Execution on start
prgs.sweepAngle = missionProgress();
prgsText.text = `${missionProgress()}%`;

// Hart rate sensor even handling
if (HeartRateSensor) {
  console.log("This device has a HeartRateSensor!");
  const hrm = new HeartRateSensor();
  hrm.addEventListener("reading", () => {
    //console.log(`Current heart rate: ${hrm.heartRate}`);
    if (hrm.heartRate === null) {
      heart_rate_element.text = "--❤️";
    } else if (hrm.heartRate < 100) {
      heart_rate_element.text = hrm.heartRate + "❤️";
      heart_rate_element.style.fill = "white";
    } else if (hrm.heartRate < 150) {
      heart_rate_element.text = hrm.heartRate + "❤️";
      heart_rate_element.style.fill = "yellow";
    }
    else {
      heart_rate_element.text = hrm.heartRate + "❤️";
      heart_rate_element.style.fill = "red";
    }
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
clock.granularity = "minutes";
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  hours = util.zeroPad(hours);
  let mins = util.zeroPad(today.getMinutes());
  appTime.text = `${hours}:${mins}`;

  // Battery
  battery_level_element.text = Math.floor(battery.chargeLevel) + "%";
  if (battery.chargeLevel < 10) {
		battery_level_element.style.fill = "red";
	} else {
    battery_level_element.style.fill = "white";
  }
  //console.log(battery_level_element.text)

}
