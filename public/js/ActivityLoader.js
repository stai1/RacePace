const PER_PAGE = 200;
const WORKOUT_TYPES = {null: "Run", 0: "Run", 1: "Race", 2: "Long Run", 3: "Workout"};
const CONVERSIONS = {m:1, km: 1000, mi:1609.344};
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

function addActivityToTableBody(tableBody, activity) {
  tableBody.append($("<tr>")
    .append($("<td>").text(activity.name))
    .append($("<td>").text(activity.start_date))
    .append($("<td>").text(WORKOUT_TYPES[activity.workout_type]))
    .append($("<td>").text(activity.distance))
    .append($("<td>").text(activity.elapsed_time))
    .append($("<td>").text(getPace(activity.distance/activity.elapsed_time,CONVERSIONS.mi)))
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