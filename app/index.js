import clock from 'clock';
import * as document from 'document';
import { battery } from 'power';
import { display } from 'display';
import { HeartRateSensor } from 'heart-rate';
import { today } from 'user-activity';
import { user } from 'user-profile';
import { vibration } from 'haptics';
import * as fs from 'fs';
import * as messaging from 'messaging';
import * as util from '../common/utils';

const app_time = document.getElementById('app_time');
const battery_level_element = document.getElementById('bat_level');
const heart_rate_element = document.getElementById('heart_rate');
const week_day = document.getElementById('week_day');
const date_day = document.getElementById('date_day');

const earth = document.getElementById('earth');
const moon = document.getElementById('moon');
const prgs = document.getElementById('prgs');
const prgsText = document.getElementById('prgsText');
const data_text = document.getElementById('data_text');
const data_icon = document.getElementById('data_icon');
// Set sensors
const hrm = new HeartRateSensor();
// Set days array
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Set data icons array
const data_icons_array = ['steps_36px.png', 'floors_36px.png', 'distance_36px.png'];

// Set global display value:
let data_info_current_index = 0;
// Set initial config
let config = {
  settings_animation: true,
  settings_mission_start: null,
  settings_mission_end: null,
};
// Set local file to store aconfigs
const DATA_TYPE = 'json';
const DATA_FILE = 'mysettings.cbor';

// Functions
function loadConfig() {
  try {
    // Return config form the local file
    return fs.readFileSync(DATA_FILE, DATA_TYPE);
  } catch (ex) {
    // Return default config if there is no file
    console.log('Return default config');
    return config;
  }
}
function saveConfig() {
  // Save config to the file
  fs.writeFileSync(DATA_FILE, config, DATA_TYPE);
}
function missionProgress() {
  if (config.settings_mission_start === null || config.settings_mission_end === null) {
    // Nulls in value
    console.log('One of the value is empty');
    prgsText.text = '';
    prgs.sweepAngle = 0;
    return;
  }
  console.log(String(config.settings_mission_start));
  console.log(String(config.settings_mission_end));
  // Try to calcutlate time
  const start_time = new Date(config.settings_mission_start);
  const end_time = new Date(config.settings_mission_end);
  // Calculate mission time in minutes
  const mission_minutes = Math.floor((end_time - start_time) / 60000);
  if (mission_minutes < 0) {
    // Negative value. Remove everything.
    console.log('Negative value.');
    prgsText.text = '';
    prgs.sweepAngle = 0;
    return;
  }
  // Enable visibility
  const now_time = Date.now();
  if (now_time < start_time) {
    console.log('Mission is not started yet');
    prgsText.text = '0%';
    prgs.sweepAngle = 0;
    return;
  }
  if (now_time > end_time) {
    console.log('Mission has been completed');
    prgsText.text = '100%';
    prgs.sweepAngle = 100;
    return;
  }
  // Calculate progress and update values
  console.log(`Mission time T: ${String(mission_minutes)} minutes`);
  const now_minutes = Math.floor((now_time - start_time) / 60000);
  console.log(`Mission time C: ${String(now_minutes)} minutes`);
  // Set map between minutes and progress
  const progress = Math.floor((now_minutes / mission_minutes) * 100);
  console.log(`Progress: ${String(progress)}`);
  // Update elements to show progress
  prgsText.text = `${String(progress)}%`;
  prgs.sweepAngle = progress;
}
function dataInfoUpdate() {
  if (data_info_current_index === 0) {
    // Steps
    data_text.text = today.adjusted.steps;
  } else if (data_info_current_index === 1) {
    // Floors on display switch to next
    data_text.text = today.adjusted.elevationGain;
  } else {
    // Distance
    data_text.text = today.adjusted.distance;
  }
  // Set proper icon
  data_icon.href = `icons/${data_icons_array[data_info_current_index]}`;
  // Set position as (30px + 2px) from the current text item.
  data_icon.x = data_text.getBBox().x - 32;
  // console.log(data_text.getBBox().x);
}
function animation() {
  if (config.settings_animation) {
    earth.animate('enable');
    moon.animate('enable');
  }
}
function batteryUpdate() {
  const currentCharge = battery.chargeLevel;
  if (battery.charging) {
    battery_level_element.text = `${Math.floor(currentCharge)}⚡`;
    battery_level_element.style.fill = 'fb-green';
  } else {
    battery_level_element.text = `${Math.floor(currentCharge)}%`;
    if (currentCharge < 10) {
      battery_level_element.style.fill = 'fb-red';
    } else if (battery.chargeLevel < 20) {
      battery_level_element.style.fill = 'fb-orange';
    } else {
      battery_level_element.style.fill = 'white';
    }
  }
}

// Main function to run all logic
function main() {
  // Display on actions
  display.addEventListener('change', () => {
    if (display.on) {
      animation();
      missionProgress();
      hrm.start();
    } else {
      // Automatically stop the sensors when the screen is off to conserve battery
      hrm.stop();
    }
  });
  // Actions on info click
  data_text.addEventListener('click', () => {
    if (data_info_current_index < 2) {
      data_info_current_index += 1;
    } else {
      data_info_current_index = 0;
    }
    dataInfoUpdate();
    vibration.start('bump');
  });
  // Hart rate sensor even handling
  hrm.addEventListener('reading', () => {
    // Set color based on user profile
    const hrRate = hrm.heartRate;
    const hrZone = user.heartRateZone(hrRate);
    // Set HR value
    if (hrRate === null) {
      heart_rate_element.text = '--❤️';
    } else {
      heart_rate_element.text = `${hrRate}❤️`;
    }
    // Set HR color
    if (hrZone === 'fat-burn') {
      heart_rate_element.style.fill = 'fb-yellow';
    } else if (hrZone === 'cardio') {
      heart_rate_element.style.fill = 'fb-orange';
    } else if (hrZone === 'peak') {
      heart_rate_element.style.fill = 'fb-red';
    } else {
      heart_rate_element.style.fill = 'white';
    }
    // console.log(hrZone);
  });

  battery.addEventListener('change', () => {
    batteryUpdate();
  });
  // Update the clock every second
  clock.granularity = 'seconds';
  clock.ontick = (evt) => {
    const today_time = evt.date;
    // Set time
    const hours = util.zeroPad(today_time.getHours());
    const mins = util.zeroPad(today_time.getMinutes());
    app_time.text = `${hours}:${mins}`;
    // Set day and date
    week_day.text = days[today_time.getDay()];
    date_day.text = util.zeroPad(today_time.getDate());
    // Data Info
    dataInfoUpdate();
  };
  // Incomming data from settings
  messaging.peerSocket.addEventListener('message', (evt) => {
    // console.log(evt.data.value);
    if (evt && evt.data) {
      // Check if we have moon_color, animation or time
      if (evt.data.key === 'moon_color') {
        moon.style.fill = JSON.parse(evt.data.value);
      } else if (evt.data.key === 'animation') {
        config.settings_animation = JSON.parse(evt.data.value);
      } else if (evt.data.key === 'start_time') {
        if (evt.data.value !== '') {
          // Set if we see not empty value
          config.settings_mission_start = evt.data.value;
        } else {
          config.settings_mission_start = null;
        }
        // Mission update trigger
        missionProgress();
      } else if (evt.data.key === 'end_time') {
        if (evt.data.value !== '') {
          // Set if we see not empty value
          config.settings_mission_end = evt.data.value;
        } else {
          config.settings_mission_end = null;
        }
        missionProgress();
      }
      // Save config to file
      saveConfig();
    }
  });
  // One time execution on start
  hrm.start();
  animation();
  dataInfoUpdate();
  missionProgress();
  // Update config
  config = loadConfig();
}

main();
