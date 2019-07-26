const PER_PAGE = 200;
const WORKOUT_TYPES = {null: "Run", 0: "Run", 1: "Race", 2: "Long Run", 3: "Workout"};
const CONVERSIONS = {m:1, km: 1000, mi:1609.344};

var unit;
$().ready(()=>{setUnit("mi")});
var url = "https://www.strava.com/api/v3/athlete/activities";

var activities = [];

/**
 * Returns the time in seconds per unit for a given speed
 *
 * @param {number} speed - In m/s
 * @param {number} unit - As converted to meters
 */
function getPace(speed, unit) {
  return unit/speed;
}

function setUnit(newUnit) {
  unit = newUnit;
  $(".unit").text(newUnit);
}

/**
 * Converts time to clock format
 *
 * @param {number} time - In seconds
 * @param {number} place - clock format sections: 2 for HH:MM:SS, 1 for MM:SS, 0 for SS
 */
function prettyTime(time, place) {
  if(place == null)
    place = 2;
  var timeString = "";
  var preceded = false;
  if(place >= 2) {
    timeString += String(Math.floor(time/3600)) + ":";
    preceded = true;
    time %= 3600;
  }
  if(place >= 1) {
    var m = Math.floor(time/60);
    m = preceded ? (m < 10 ? "0" : "") + String(m) : String(m);
    timeString += m + ":";
    preceded = true
    time %= 60;
  }
  s = Math.floor(time);
  s = preceded ? (s < 10 ? "0" : "") + String(s) : String(s);
  hh = Math.floor((time % 1)*100);
  hh = (hh < 10 ? "0" : "") + String(hh);
  timeString += s + (hh == 0 ? "" : "." + hh);
  return timeString;
}

function addActivityToTableBody(tableBody, activity) {
  tableBody.append($("<tr>")
    .append($("<td>").text(activity.name))
    .append($("<td>").text(activity.start_date))
    .append($("<td>").text(WORKOUT_TYPES[activity.workout_type]))
    .append($("<td>").text((activity.distance/CONVERSIONS[unit]).toFixed(2)))
    .append($("<td>").text(prettyTime(activity.elapsed_time,2)))
    .append($("<td>").text(prettyTime(getPace(activity.distance/activity.elapsed_time,CONVERSIONS[unit]),1)))
  )
}

/**
 * Retrieves activities from Strava and adds them to activity list display
 */
function getActivities() {
  var page = 1
  function getMoreActivities() {
    $.get({
      url:url,
      data:{access_token: access_token,page: page,per_page: PER_PAGE},
      success: function(result, textstatus){
        page += 1;
        if(textstatus == "success" && result.length != 0) {
          activities.push(...result);
          for(let i = 0; i < result.length; ++i) {
            if(result[i].type == "Run" && !result[i].manual) {
              addActivityToTableBody($("#activityList").find("tbody"), result[i]);
            }
          }
          getMoreActivities();
        }
      },
      dataType: "json"
    });
  }
  
  getMoreActivities();
}

getActivities();