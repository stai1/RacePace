class MainController < ApplicationController
  def index
    if request.query_parameters.empty?
      @url = "https://www.strava.com/oauth/authorize?client_id=36433&response_type=code&redirect_uri="+Rails.configuration.redirect_uri+"&approval_prompt=force"
      render "landing"
    end
  end
end
