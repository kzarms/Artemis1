import clock from 'clock';
import * as document from 'document';
import { battery } from 'power';
import { display } from 'display';
import { HeartRateSensor } from 'heart-rate';
import { today } from 'user-activity';
import { user } from 'user-profile';
import { vibration } from "haptics";
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

// Set days array
const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
// Set data icons array
const data_icons_array = ['steps_36px.png', 'floors_36px.png', 'distance_36px.png'];

// Set global display value:
let data_info_current_index = 0;
let settings_animation = true;
// Set UTC time to start
let mission_start = '';
let mission_end = '';

function missionProgress() {
  if (mission_start === '' || mission_end === '') {
    // No proper date. Turn off
    console.log('One of the value is empty');
    prgsText.text = '';
    prgs.sweepAngle = 0;
    return;
  }
  // Calculate mission time in minutes
  const mission_minutes = Math.floor((mission_end - mission_start) / 60000);
  if (mission_minutes < 0) {
    // Negative value. Remove everything.
    prgsText.text = '';
    prgs.sweepAngle = 0;
    return;
  }

  // Enable visibility
  const nowTime = Date.now();
  if (nowTime < mission_start) {
    console.log('Mission is not started yet');
    prgsText.text = '0%';
    prgs.sweepAngle = 0;
    return;
  }
  if (nowTime > mission_end) {
    console.log('Mission has been completed');
    prgsText.text = 'Done!';
    prgs.sweepAngle = 100;
    return;
  }
  // Calculate progress and update values
  console.log(`Mission time T: ${String(mission_minutes)} minutes`);
  const now_minutes = Math.floor((nowTime - mission_start) / 60000);
  console.log(`Mission time C: ${String(now_minutes)} minutes`);
  // Set map between minutes and progress
  const progress = Math.floor((now_minutes / mission_minutes) * 100);
  console.log(`Progress: ${String(progress)}`);
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
  if (settings_animation) {
    earth.animate('enable');
    moon.animate('enable');
  }
}

messaging.peerSocket.addEventListener('message', (evt) => {
  // console.log(evt.data.value);
  if (evt && evt.data && evt.data.key === 'moon_color') {
    moon.style.fill = JSON.parse(evt.data.value);
  }
  if (evt && evt.data && evt.data.key === 'animation') {
    settings_animation = JSON.parse(evt.data.value);
  }
  if (evt && evt.data && evt.data.key === 'start_time') {
    if (evt.data.value !== '') {
      // Set if we see not empty value
      mission_start = new Date(evt.data.value);
    } else {
      mission_start = '';
    }
    missionProgress();
  }
  if (evt && evt.data && evt.data.key === 'end_time') {
    if (evt.data.value !== '') {
      // Set if we see not empty value
      mission_end = new Date(evt.data.value);
    } else {
      mission_end = '';
    }
    missionProgress();
  }
});

data_text.addEventListener('click', () => {
  if (data_info_current_index < 2) {
    data_info_current_index += 1;
  } else {
    data_info_current_index = 0;
  }
  dataInfoUpdate();
  vibration.start("bump");
});

// Hart rate sensor even handling
if (HeartRateSensor) {
  console.log('This device has a HeartRateSensor!');
  const hrm = new HeartRateSensor();
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
  // Automatically stop the sensor when the screen is off to conserve battery
  display.addEventListener('change', () => {
    if (display.on) {
      hrm.start();
    } else {
      hrm.stop();
    }
  });
  // First start
  hrm.start();
} else {
  console.log('This device does NOT have a HeartRateSensor!');
}

// Set automation for display on and off
display.addEventListener('change', () => {
  if (display.on) {
    animation();
    missionProgress();
  }
});

// Update the clock every second
clock.granularity = 'seconds';

clock.ontick = (evt) => {
  const today_time = evt.date;
  // Set time
  let hours = today_time.getHours();
  hours = util.zeroPad(hours);
  const mins = util.zeroPad(today_time.getMinutes());
  app_time.text = `${hours}:${mins}`;

  // Set day and date
  week_day.text = days[today_time.getDay()];
  date_day.text = util.zeroPad(today_time.getDate());

  // Battery
  battery_level_element.text = `${Math.floor(battery.chargeLevel)}%`;
  if (battery.chargeLevel < 10) {
    battery_level_element.style.fill = 'fb-red';
  } else if (battery.chargeLevel < 20) {
    battery_level_element.style.fill = 'fb-orange';
  } else {
    battery_level_element.style.fill = 'white';
  }
  // console.log(battery_level_element.text)
  // Data Info
  dataInfoUpdate();
};

// Execution on start
missionProgress();
// Update data text
dataInfoUpdate();
// Run animation once
animation();
