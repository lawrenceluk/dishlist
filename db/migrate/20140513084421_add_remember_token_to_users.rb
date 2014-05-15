class AddRememberTokenToUsers < ActiveRecord::Migration
  def change
    add_column :parse_users, :remember_token, :string
    add_index  :parse_users, :remember_token
  end
end