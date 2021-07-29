//get the difference between current date and input date
const dateDifference = (date) => {
  let differnce = new Date(date).getTime() - new Date().getTime();
  var days = Math.floor(differnce / (1000 * 60 * 60 * 24));
  var hours = Math.floor(
    (differnce % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
  );
  var minutes = Math.floor((differnce % (1000 * 60 * 60)) / (1000 * 60));
  var seconds = Math.floor((differnce % (1000 * 60)) / 1000);
  return { days, hours, minutes, seconds };
};

//change the date to a usable date for datetime-local inputs value
const fortmatDate = (date) => {
  //retrieve the date from the Date
  const d = new Date(date)
    .toLocaleDateString("en-GB")
    .split("/")
    .reverse()
    .join("-");
  //retrieve the time (hh:mm) from the Date
  const time =
    new Date(date).toTimeString().split(":")[0] +
    ":" +
    new Date(date).toTimeString().split(":")[1];
  //return date and time
  return d + "T" + time;
};
