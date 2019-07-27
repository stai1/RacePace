const PER_PAGE = 200;
const WORKOUT_TYPES = {null: "Run", 0: "Run", 1: "Race", 2: "Long Run", 3: "Workout"};
const CONVERSIONS = {m:1, km: 1000, mi:1609.344};

var unit;
$(()=>{setUnit("mi")});
var url = "https://www.strava.com/api/v3/athlete/activities";

/**
 * Returns the time in seconds per unit for a given speed
 *
 * @param {number} speed - In m/s
 * @param {number} unit - As converted to meters
 */
function getPace(speed, unit) {
  return unit/speed;
}

/**
 * Sets unit used for display and distance and pace calculations
 * @param {String} newUnit - mi or km
 */
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

/**
 * Moves table row from current table to other table
 * @param {object} $tr - jQuery object for table row
 */
function moveToOtherTable($tr) {
  if($tr.parent().parent().attr("id") == "activityList") {
    $("#calculateList").find("tbody").append($tr);
  }
  else if($tr.parent().parent().attr("id") == "calculateList") {
    $("#activityList").find("tbody").append($tr);
  }
}

function selectRow($tr) {
  $tr.addClass("selected");
}

/**
 * Move all class="selected" table rows to other table
 * @param {String} tableID - id of table to move from
 */
function moveMultipleFromTable(tableID) {
  if(tableID == "activityList") {
    $("#calculateList").find("tbody").append($("#activityList").find("tbody").find(".selected").removeClass("selected"));
  }
  else if(tableID == "calculateList") {
    $("#activityList").find("tbody").append($("#calculateList").find("tbody").find(".selected").removeClass("selected"));
  }
}

/**
 * Add Strava activity to a table.
 * @param {object} $tableBody - jQuery object for tbody
 * @param {object} activity - Activity from Strava
 */
function addActivityToTableBody($tableBody, activity) {
  var $tr = $("<tr/>");
  var data = {
    id: activity.id,
    name: activity.name,
    type: activity.workout_type,
    date: activity.start_date,
    d: activity.distance,
    t: activity.elapsed_time,
    pace: activity.distance/activity.elapsed_time
  };
  $tr.data("data", data);
  $tr.click(() => selectRow($tr));
  
  $tr
    .append($("<td>").append($("<a>").attr("href", "https://www.strava.com/activities/"+data.id).attr("target","_blank").text(data.name).click((e)=>e.stopPropagation())))
    .append($("<td>").text(data.date))
    .append($("<td>").text(WORKOUT_TYPES[data.type]))
    .append($("<td>").text((data.d/CONVERSIONS[unit]).toFixed(2)).data("data",data.d))
    .append($("<td>").text(prettyTime(data.t,2)).data("data",data.t))
    .append($("<td>").text(prettyTime(getPace(data.pace,CONVERSIONS[unit]),1)).data("data",data.pace));
  $tableBody.append($tr);
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
          for(let i = 0; i < result.length; ++i) {
            if(result[i].type == "Run" && !result[i].manual) {
              let $table = result[i].workout_type == 1 ? $("#calculateList") : $("#activityList");
              addActivityToTableBody($table.find("tbody"), result[i]);
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