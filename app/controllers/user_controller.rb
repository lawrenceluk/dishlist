class UserController < ApplicationController
	before_filter :initparse

	def new
		@user = ParseUser.new
	end

	def create
		@user = ParseUser.new(allowparams)
		use = params[:parse_user]
		if @user[:password] != use[:password_confirmation]
			# password doesn't match confirmation
			@user.errors.add(:password_confirmation, "doesn't match")
		end
		if @user[:username].length < 4
			@user.errors.add(:username, "too short")
		end
		if @user[:username].length > 20
			@user.errors.add(:username, "too long")
		end
		if @user[:password].length < 4
			@user.errors.add(:password, "too short")
		end
		if @user[:password].length > 20
			@user.errors.add(:password, "too long")
		end
		user = Parse::Query.new("_User").eq("username", @user[:username]).get.first
		if !user.nil? && user.length > 0 && user["username"] == @user[:username]
			@user.errors.add(:username, "is already taken")
		end
		user = Parse::Query.new("_User").eq("email", @user[:email]).get.first
		if !user.nil? && user.length > 0 && user["email"] == @user[:email]
			@user.errors.add(:email, "is already taken")
		end
		if @user.errors.any?
			render 'new'
		else
			@user.save
			newuser = Parse::User.new({
				username: @user[:username],
				password: @user[:password],
				email: @user[:email]
			})
			newuser.save
			sign_in @user
			redirect_to root_path
		end
	end

	def login
		@user = ParseUser.new
	end

	def loginattempt
		@user = ParseUser.find_by_username(params[:parse_user][:username])
		flag = false
		if !@user
			@user = ParseUser.new(allowparams)
			flag = true
		end
		if @user[:username].length < 4
			@user.errors.add(:username, "too short")
		end
		if @user[:username].length > 20
			@user.errors.add(:username, "too long")
		end	
		if @user[:password].length < 4
			@user.errors.add(:password, "too short")
		end
		if @user[:password].length > 20
			@user.errors.add(:password, "too long")
		end	
		user = Parse::User.authenticate(@user[:username], params[:parse_user][:password]) rescue @user.errors[:base] << "inv"
		if @user.errors.any?
			render 'login'
		else
			if flag
				@user.email = user["email"]
				@user.save
			end
			sign_in @user
			redirect_to root_path
		end
	end

	def logout
		sign_out
		redirect_to root_path
	end

	private
	def initparse
		Parse.init :application_id => "dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af",
         :api_key        => "KHIAcSibHS9RHVWpiktRdqqZbSnD9qYN4qu0cYV7"
	end

	def allowparams
		params.require(:parse_user).permit(:username, :email, :password)
	end

end
