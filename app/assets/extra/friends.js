var parseuser;
Parse.initialize("dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af", "wHkRLFgELqtUWCAnoXKPdJi7pWfYMJnNisEhuNS2"); 
var User = Parse.Object.extend("User");
$body = $("#d-message");

var getuser = new Parse.Query(User);
getuser.equalTo("username", $("#current_user").html());
getuser.find({
	success: function(results) {
		parseuser = results[0];
	},
	error: function(error) {
	  console.log("Error: " + error.code + " " + error.message);
	  parseuser = false;
	}
});

$("#d-add").submit(function(e) {
	e.preventDefault();
	if (!parseuser) return;
	if ($("#d-name").val() == "")
		return;
	var query = new Parse.Query(User);
	query.notEqualTo("username", $("#current_user").html());
	if (parseuser.get("sentrequests"))
		query.notContainedIn("username", parseuser.get("sentrequests"));
	if (parseuser.get("friendrequests"))
		query.notContainedIn("username", parseuser.get("friendrequests"));
	if (parseuser.get("friendnames"))
		query.notContainedIn("username", parseuser.get("friendnames"));
	query.startsWith("username", $("#d-name").val());
	query.find({
	  success: function(results) {
	  	if (results.length == 0) {
	  		$body.html("<h2 class='gray'>No users found.</h2>");
	  	} else {
	  		$body.html("");
	  		for (var i=0; i<results.length; i++) {
	  			$body.append("<div class='user-card' id="+results[i].id+"><i class='fa fa-user'></i> "+results[i].get("username")+" <i class='fa fa-plus pull-right'></i></div>");
	  		}
	  	}
	  },
	  error: function(error) {
	    console.log("Error: " + error.code + " " + error.message);
	  }
	});
});

$(document).on('click', ".user-card", function(e) {
	if (!parseuser) return;
	var id = $(this).attr('id');
	var $card = $(this);
	if (id != "") {
		$card.html("Request sent!");
		$card.attr('id', '');
		Parse.Cloud.run('makeFriendRequest', { userid: parseuser.id, friendid: id }, {
      success: function(status) {
      },
      error: function(error) {
      	$card.html("Error! Click to try again.");
      	$card.attr('id', id);
      	console.log("Error: " + error.code + " " + error.message);
      }
    });
	}
});

var detect = new Date().getTime();
$(document).on('click', ".add-card .fa", function(e) {
	if (new Date().getTime() < detect + 200) return;
	detect = new Date().getTime(); // for weird async onclick problems
	var parent = $(this).parent('div').parent('div');
	if (!parseuser) return;
	var name = parent.find(".r-name").html();
	if ($(this).hasClass("fa-check")) {
		parent.hide(200);
		Parse.Cloud.run('acceptFriendRequest', { userid: parseuser.id, requestername: name }, {
      success: function(status) {
      	// append to friends
      	$("#nofriends").html("");
      	$("#content").append("<div class='friend-card' id='"+status+"'><i class='fa fa-user'></i> <a href='/user/"+name+"'>"+name+"</a><i class='fa fa-times pull-right'></i></div>");
      },
      error: function(error) {
      	console.log("Error: " + error.code + " " + error.message);
      }
    });		
	} else if ($(this).hasClass("fa-times")) {
		parent.hide(200);
		Parse.Cloud.run('denyFriendRequest', { userid: parseuser.id, requestername: parent.find(".r-name").html() }, {
      success: function(status) {
      },
      error: function(error) {
      	console.log("Error: " + error.code + " " + error.message);
      }
    });			
	}
});

$(document).on('click', ".friend-card .fa-times", function(e) {
	var id = $(this).parent('div').attr('id')
	if (!parseuser) return;
	$(this).parent('div').hide(200);
		Parse.Cloud.run('deleteFriend', { userid: parseuser.id, friendid: id }, {
      success: function(status) {
      },
      error: function(error) {
      	console.log("Error: " + error.code + " " + error.message);
      }
    });		
});