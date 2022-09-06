import { settingsStorage } from 'settings';
import * as messaging from 'messaging';
import { me as companion } from 'companion';

const MOON_COLOR = 'moon_color';
const ANIMATION = 'animation';

function sendSettingData(data) {
  // If we have a MessageSocket, send the data to the device
  if (messaging.peerSocket.readyState === messaging.peerSocket.OPEN) {
    messaging.peerSocket.send(data);
  } else {
    console.log('No peerSocket connection');
  }
}
function sendValue(key, val) {
  if (val) {
    sendSettingData({
      key,
      value: val,
    });
  }
}
function parseData(evt) {
  const new_start_time = JSON.parse(evt.newValue).name;
  // console.log(`${new_start_time}`);
  if (new_start_time === '') {
    console.log('No data');
    return '';
  }
  // Parse value and validate
  const temp_datetime = new_start_time.split(' ');
  const temp_date = temp_datetime[0].split('.');
  const new_time = `${temp_date[2]}-${temp_date[1]}-${temp_date[0]}T${temp_datetime[1]}:00`;
  const date = new Date(new_time);
  // console.log(new_time);
  if (date.toString() !== 'Invalid Date') {
    // console.log(date.toString());
    return new_time;
  }
  // Exit wit nothing
  console.log('Wrong data format');
  return '';
}

// Settings have been changed
settingsStorage.addEventListener('change', (evt) => {
  if (evt.key === 'start_time' || evt.key === 'end_time') {
    sendValue(evt.key, parseData(evt));
  } else {
    console.log(evt.newValue);
    sendValue(evt.key, evt.newValue);
  }
});

// Settings were changed while the companion was not running
if (companion.launchReasons.settingsChanged) {
  // Send the value of the setting
  sendValue(MOON_COLOR, settingsStorage.getItem(MOON_COLOR));
  sendValue(ANIMATION, settingsStorage.getItem(ANIMATION));
}
// Set enable automation as true by default
settingsStorage.setItem(ANIMATION, true);
