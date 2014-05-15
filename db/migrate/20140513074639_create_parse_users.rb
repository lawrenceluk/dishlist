class CreateParseUsers < ActiveRecord::Migration
  def change
    create_table :parse_users do |t|
    	t.string :email
    	t.string :username
    	t.string :password
    	t.string :extra
      t.timestamps
    end
  end
end
