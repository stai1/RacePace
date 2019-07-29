const PER_PAGE = 200;
const WORKOUT_TYPES = {null: "Run", 0: "Run", 1: "Race", 2: "Long Run", 3: "Workout"};
const CONVERSIONS = {m:1, km: 1000, mi:1609.344};

var unit;
var coef = pwrReg([],[]);

// initialize stuff
$(function () {
  // inputFilter
  (function($) {
    $.fn.inputFilter = function(inputFilter) {
      return this.on("input keydown keyup mousedown mouseup select contextmenu drop", function() {
        if (inputFilter(this.value)) {
          this.oldValue = this.value;
          this.oldSelectionStart = this.selectionStart;
          this.oldSelectionEnd = this.selectionEnd;
        } else if (this.hasOwnProperty("oldValue")) {
          this.value = this.oldValue;
          this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
        }
      });
    };
  }($));

  // set distance textbox to accept floating point number formats only
  $("#distance").inputFilter(function(value) {
    return /^\d*\.?\d*$/.test(value);
  });
  
  setUnit("mi");
  
  // initialize button behaviors
  $("#activity-select").click(()=>selectAll("activityList"));
  $("#activity-deselect").click(()=>deselectAll("activityList"));
  $("#activity-move").click(()=>moveMultipleFromTable("activityList"));
  $("#calculate-move").click(()=>moveMultipleFromTable("calculateList"));
  $("#calculate-select").click(()=>selectAll("calculateList"));
  $("#calculate-deselect").click(()=>deselectAll("calculateList"));
  
  getCoef();
  }
);
  
var url = "https://www.strava.com/api/v3/athlete/activities";

/**
 * Returns the time in seconds per unit for a given speed
 *
 * @param {number} speed - In m/s
 * @param {String} unit - mi or km
 */
function getPace(speed, unit) {
  return CONVERSIONS[unit]/speed;
}

/**
 * Sets unit used for display and distance and pace calculations
 * @param {String} newUnit - mi or km
 */
function setUnit(newUnit) {
  unit = newUnit;
  $(".unit").text(newUnit);
  $distance = $(".distance");
  for(let i = 0; i < $distance.length; ++i) {
    $($distance[i]).text(prettyDistance($($distance[i]).data().data, unit));
  }
  $pace = $(".pace");
  for(let i = 0; i < $pace.length; ++i) {
    $($pace[i]).text(prettyTime($($pace[i]).data().data*CONVERSIONS[unit],1));
  }
}

/**
 * Converts distance in meters to hundredths precision in other unit
 * @param {number} distance - in meters
 * @param {unit} - mi or km
 */
function prettyDistance(distance, unit) {
  return (distance/CONVERSIONS[unit]).toFixed(2);
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

function selectAll(tableID) {
  $("#"+tableID).find("tbody").find("tr").addClass("selected");
}

function deselectAll(tableID) {
  $("#"+tableID).find("tbody").find("tr").removeClass("selected");
}

function clickRow($tr) {
  if(($tr).hasClass("selected"))
    $tr.removeClass("selected");
  else
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
  getCoef();
}

function getCoef() {
  let $rows = $("#calculateList").find("tbody").find("tr");
  let X = [...$rows.map((tr_i)=>$($rows[tr_i]).data().data.d)];
  let Y = [...$rows.map((tr_i)=>$($rows[tr_i]).data().data.pace)];
  coef = pwrReg(X,Y);
  $(".a-coef").attr("title",coef.a).text(coef.a.toFixed(3));
  $(".b-coef").attr("title",coef.b).text(coef.b.toFixed(4));
  $(".r-coef").attr("title",coef.r*coef.r).text((coef.r*coef.r).toFixed(4));
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
    speed: activity.distance/activity.elapsed_time,
    pace: activity.elapsed_time/activity.distance
  };
  $tr.data("data", data);
  $tr.attr("id", activity.id);
  // select/deselect row on click
  $tr.click(() => clickRow($tr));
  
  // set row entries
  $tr
    .append($("<td>").append($("<a>").attr("href", "https://www.strava.com/activities/"+data.id).attr("target","_blank").text(data.name).click((e)=>e.stopPropagation())))
    .append($("<td>").text(data.date))
    .append($("<td>").text(WORKOUT_TYPES[data.type]))
    .append($("<td>").text(prettyDistance(data.d, unit)).data("data",data.d).addClass("distance"))
    .append($("<td>").text(prettyTime(data.t,2)).data("data",data.t))
    .append($("<td>").text(prettyTime(data.pace*CONVERSIONS[unit],1)).data("data",data.pace).addClass("pace"));
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
              addActivityToTableBody($("#activityList").find("tbody"), result[i]);
            }
          }
          $('#activityList tr:contains("Race")').addClass("selected");
          moveMultipleFromTable("activityList");
          getMoreActivities();
        }
      },
      dataType: "json"
    });
  }
  
  getMoreActivities();
}

getActivities();