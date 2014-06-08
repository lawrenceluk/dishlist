var dishlist, currentlist, parseuser, currentuser;
var mode = "Dishlist";
var $c = $("#fl-content");
Parse.initialize("dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af", "wHkRLFgELqtUWCAnoXKPdJi7pWfYMJnNisEhuNS2"); 
var User = Parse.Object.extend("User");
var Dish = Parse.Object.extend("Dish");
var Restaurant = Parse.Object.extend("Restaurant");

var getuser = new Parse.Query(User);
getuser.get($("#username").html(), {
  success: function(user) {
    parseuser = user;
    var cuser = new Parse.Query(User);
    cuser.get($("#currentuser").html(), {
    	success: function(u) {
    		currentuser = u;
    		getDishlist();
    	},
    	error: function(object, error) {
    		console.log("Error saving: "+JSON.stringify(error));
    	}
    });
  },
  error: function(object, error) {
    console.log("Error saving: "+JSON.stringify(error));
  }
});

function getDishlist() {
  var relation = parseuser.relation("dishlist");
  var compare_relation = currentuser.relation("dishlist");
  relation.query().find({
    success: function(list) {
        if (list.length == 0) {
        	$("#spinnin").html("");
          $c.html("<h2 class='gray center'>The user's Dishlist is empty.</h2>");
        } else {
        	dishlist = list;
        	compare_relation.query().find({
        		success: function(clist) {
        			currentlist = [];
        			for (var i=0;i<clist.length;i++) {
        				currentlist.push(clist[i].id);
        			}
        			drawList();
        		}
        	});
        }
    }
  });
}

function drawList() {
  $c.html("");
  var list = {};
  for (var i=0;i<dishlist.length;i++) {
    var rid = dishlist[i].get("restaurant").id;
    if (!(rid in list))
      list[rid] = [];
    list[rid].push(dishlist[i]);
  }
  for (var r in list) {
    drawRestaurant(r, list[r])
  }
  $("#spinnin").html("");
}

function drawRestaurant(rid, dishes) {
  var getr = new Parse.Query(Restaurant);
  getr.get(rid, {
  success: function(restaurant) {
    var str = "<div id=r"+restaurant.id+" class='sm-rest-listing'>";
    str += "<a href='/restaurant/"+restaurant.get("name").replace(/[^a-z0-9\s]/gi, '')+"/"+restaurant.id+"'><div class='listing-title'>"+restaurant.get("name")+"</div><div class='inline'>("+restaurant.get("display_yelp_categories")+")</div><div>"+restaurant.get("short_address")+"</div></div>";
    $c.append(str + "</div>");
    drawDishes(dishes, "/restaurant/"+restaurant.get("name").replace(/[^a-z0-9\s]/gi, '')+"/"+restaurant.id);
  },
  error: function(object, error) {
    console.log("Parse Error: "+error)
  }
  });
}

function drawDishes(dishes, rooturl) {
	$c.append("<ul>")
  for (var i=0;i<dishes.length;i++) {
    var d = dishes[i];
    var str = "<li><div class='dish-listing' id="+d.id+">";
    var date = d.createdAt.toString().split(" ");
    str += "<div class='dish-title'><a href='"+rooturl+"#"+d.id+"'>"+d.get("name");
    if (d.get("price") != -1) str += " - $"+d.get("price");
    str += "</a></div>";
    str += "<div class='dish-descrip row'>";
    str += "<div class='col-xs-8 descrip-8'>";
    if (d.get("description"))
      str += d.get("description");
    str += "</div>";
    //
    if (currentlist.indexOf(d.id) > 0)
    	str += "<div class='col-xs-4 descrip-8 atn'><i class='fa fa-check-square-o'></i> Also on your Dishlist!</div>";
    //
    str += "</div>";
    str += "</div>"
    str += "</div></li>";
    // created at to see how long it's been on your list
    $c.append(str);
  }
  $c.append("</ul>");
}