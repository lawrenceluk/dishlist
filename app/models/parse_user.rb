include UserHelper
class ParseUser < ActiveRecord::Base
	before_create :create_remember_token

	def ParseUser.new_remember_token
	    SecureRandom.urlsafe_base64
	end

  def ParseUser.digest(token)
    Digest::SHA1.hexdigest(token.to_s)
  end

  private

    def create_remember_token
      self.remember_token = ParseUser.digest(ParseUser.new_remember_token)
    end
end
