module UserHelper
	def sign_in(user)
    remember_token = ParseUser.new_remember_token
    cookies.permanent[:remember_token] = remember_token
    user.update_attribute(:remember_token, ParseUser.digest(remember_token))
    self.active_user = user
  end

	def active_user=(user)
    @active_user = user
  end

  def active_user
    remember_token = ParseUser.digest(cookies[:remember_token])
    @active_user ||= ParseUser.find_by(remember_token: remember_token)
  end

  def signed_in?
  	!active_user.nil?
  end

  def sign_out
    active_user.update_attribute(:remember_token,
                                  ParseUser.digest(ParseUser.new_remember_token))
    cookies.delete(:remember_token)
    self.active_user = nil
  end

end
