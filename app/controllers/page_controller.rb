include Yelp::V2::Search::Request

class PageController < ApplicationController
	before_filter :parse

	def home
	  r_query = Parse::Query.new("Restaurant")
	  r_query.order_by = "createdAt"
	  r_query.order = :descending
	  r_query.limit = 10
	  @restaurants = r_query.get
	end

	def friends
		if active_user.nil?
			redirect_to root_path
		else
			user_q = Parse::Query.new("_User")
			user_q.eq("username", active_user.username)
			parseuser = user_q.get.first
			@requests = parseuser["friendrequests"]
			@friends = parseuser["friendnames"]
			@friendids = parseuser["friends"]
		end
	end

	def user
		if params[:username]
			user_q = Parse::Query.new("_User")
			user_q.eq("username", params[:username])
			parseuser = user_q.get.first
			if parseuser
				@user = parseuser
			else
				@user = nil
			end
			user_q = Parse::Query.new("_User")
			user_q.eq("username", active_user.username)
			@parseuser = user_q.get.first
		end
	end

	def list
		if active_user.nil?
			redirect_to root_path
		end
		user_q = Parse::Query.new("_User")
		user_q.eq("username", active_user.username)
		parseuser = user_q.get.first
		@userid = parseuser.id
		@show = params[:show]
	end

	def restaurant
	  r_query = Parse::Query.new("Restaurant")
	  r_query.eq("objectId", params[:id])
	  @r = r_query.get[0]
	  if @r
			dishes = Parse::Query.new("Dish").tap do |q|
				q.limit = 1000
			  q.eq("restaurant", Parse::Pointer.new({
			    "className" => "Restaurant",
			    "objectId"  => params[:id]
			  }))
			end
			@dishes = dishes.get
			@dishes = @dishes.sort_by { |a| [a["listed"] ? 1 : 0, a["listed"]] }.reverse!
			@id = @r.id
		end
	end

	def search
		@restaurants = []
		@term = params[:term]
		@loc = params[:location]
		if @term == "" || @loc == ""
			# invalid search
			@error = true;
		else
 			client = Yelp::Client.new
			request = Location.new(
			           :term => @term,
			           :city => @loc,
			           :limit => 10)
			response = client.search(request)
			r_a = response["businesses"]
			r_a.each do |r|
				r_query = Parse::Query.new("Restaurant")
				criteria = r["location"]["display_address"][0]+", "+r["location"]["city"]
				r_query.eq("short_address", criteria)
				p_r = r_query.get
				if p_r.empty?
					cats = ""
					disp_cats = ""
					cat = r["categories"]
					cat.each do |category|
						cats += category[1]+", "
						disp_cats += category[0]+", "
					end
					cats = cats.chop.chop
					disp_cats = disp_cats.chop.chop
					loc = r["location"]
					short_addr = loc["display_address"][0]+", "+loc["city"]
					long_addr = loc["display_address"].join(", ")
					neg = ""
					if loc["neighborhoods"]
						neg = loc["neighborhoods"][0]
					end
					newr = Parse::Object.new("Restaurant")
					newr["name"] = r["name"]
					newr["rating"] = r["rating"]
					newr["review_count"] = r["review_count"]
					newr["yelp_image_url"] = r["image_url"]
					newr["display_yelp_categories"] = disp_cats
					newr["yelp_categories"] = cats
					newr["display_phone_number"] = r["display_phone"]
					newr["phone_number"] = r["phone"]
					newr["closed"] = r["is_closed"]
					newr["neighborhood"] = neg
					newr["short_address"] = short_addr
					newr["full_address"] = long_addr
					attempt = newr.save
					@restaurants << attempt
				else
					@restaurants << p_r[0]
				end
			end
		end
	end

	private
	def parse
		Parse.init :application_id => "dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af",
	           :api_key        => "KHIAcSibHS9RHVWpiktRdqqZbSnD9qYN4qu0cYV7"
	end
end
