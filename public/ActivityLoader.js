const PER_PAGE = 200;
var url = "https://www.strava.com/api/v3/athlete/activities";

var activities = [];
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
          result.forEach(item => $("#activityList").append($("<li></li>").text(JSON.stringify(item))));
          getMoreActivities();
        }
      },
      dataType: "json"
    });
  }
  
  getMoreActivities();
}

getActivities();