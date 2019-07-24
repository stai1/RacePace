require 'net/http'

class MainController < ApplicationController
  def index
    if !(request.query_parameters.include?("state") && request.query_parameters.include?("code"))
      @url = "https://www.strava.com/oauth/authorize?client_id=36433&response_type=code&redirect_uri="+Rails.configuration.redirect_uri+"&approval_prompt=force"
      render "landing"
    else
      postData = Net::HTTP.post_form(URI.parse("https://www.strava.com/oauth/token"), {"grant_type"=>"authorization_code", "code"=>request.query_parameters["code"],"redirect_uri"=>Rails.configuration.redirect_uri,"client_id"=>Rails.configuration.client_id,"client_secret"=>Rails.application.credentials.client_secret})
      parsed = JSON.parse(postData.body)
      @access_token = parsed["access_token"]
    end
  end
end
