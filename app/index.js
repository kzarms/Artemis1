import clock from "clock";
import * as document from "document";
import { battery } from 'power';
import { display } from "display";
import { HeartRateSensor } from 'heart-rate';
import { preferences } from "user-settings";
import * as util from "../common/utils";



const myLabel = document.getElementById("appTime");
const battery_level_element = document.getElementById("bat_level");
const heart_rate_element = document.getElementById("heart_rate");

const prgs = document.getElementById("prgs");

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
    } else if (100 < hrm.heartRate < 150) {
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

// Update the clock every second
clock.granularity = "seconds";
clock.ontick = (evt) => {
  let today = evt.date;
  let hours = today.getHours();
  if (preferences.clockDisplay === "12h") {
    // 12h format
    hours = hours % 12 || 12;
  } else {
    // 24h format
    hours = util.zeroPad(hours);
  }
  let mins = util.zeroPad(today.getMinutes());
  myLabel.text = `${hours}:${mins}`;

  // Battery
  battery_level_element.text = Math.floor(battery.chargeLevel) + "%";
  if (battery.chargeLevel < 10) {
		battery_level_element.style.fill = "red";
	} else {
    battery_level_element.style.fill = "white";
  }
  //console.log(battery_level_element.text)
  prgs.sweepAngle = battery.chargeLevel;

}
