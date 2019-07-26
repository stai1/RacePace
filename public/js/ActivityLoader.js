const PER_PAGE = 200;
const WORKOUT_TYPES = {null: "Run", 0: "Run", 1: "Race", 2: "Long Run", 3: "Workout"};
const CONVERSIONS = {"m":1, "km": 1000, "mi":1609.344};
var url = "https://www.strava.com/api/v3/athlete/activities";

var activities = [];

function getPace(speed, unit) {
  return CONVERSIONS[unit]/speed;
}
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
              $("#activityList").find("tbody").append($("<tr>")
                .append($("<td>").text(result[i]["name"]))
                .append($("<td>").text(result[i]["start_date"]))
                .append($("<td>").text(WORKOUT_TYPES[result[i]["workout_type"]]))
                .append($("<td>").text(result[i]["distance"]))
                .append($("<td>").text(result[i]["elapsed_time"]))
                .append($("<td>").text(getPace(result[i]["distance"]/result[i]["elapsed_time"],"mi")))
              )
            }
          }
          //result.forEach(item => $("#activityList").append($("<li></li>").text(JSON.stringify(item))));
          getMoreActivities();
        }
      },
      dataType: "json"
    });
  }
  
  getMoreActivities();
}

getActivities();