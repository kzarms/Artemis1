// utils.js

// Add zero in front of numbers < 10
export function zeroPad(i) {
  let result = i;
  if (result < 10) {
    result = `0${result}`;
  }
  return result;
}

export default zeroPad;
