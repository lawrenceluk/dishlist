var dishlist, parseuser;
var $c = $("#content");
Parse.initialize("dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af", "wHkRLFgELqtUWCAnoXKPdJi7pWfYMJnNisEhuNS2"); 
var User = Parse.Object.extend("User");
var Dish = Parse.Object.extend("Dish");
var Restaurant = Parse.Object.extend("Restaurant");

var getuser = new Parse.Query(User);
getuser.get($("#username").html(), {
  success: function(user) {
    parseuser = user;
    getDishlist();
  },
  error: function(object, error) {
    console.log("Parse Error: "+error)
  }
});

function getDishlist() {
  var relation = parseuser.relation("dishlist");
  relation.query().find({
    success: function(list) {
        dishlist = list;
        drawList();
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
}

function drawRestaurant(rid, dishes) {
  var getr = new Parse.Query(Restaurant);
  getr.get(rid, {
  success: function(restaurant) {
    var str = "<div id=r"+restaurant.id+" class='restaurant-listing'>";
    str += "<a href='/restaurant/"+restaurant.get("name").replace(/[^a-z0-9\s]/gi, '')+"/"+restaurant.id+"'><img src="+restaurant.get("yelp_image_url")+" class='img-thumbnail'/><div><div class='listing-title'>"+restaurant.get("name")+"</div><br/><div class='listing-descrip'>"+restaurant.get("display_yelp_categories")+"<br/>"+restaurant.get("short_address")+"</div></div>";
    $c.append(str + "</div>");
    drawDishes(dishes);
  },
  error: function(object, error) {
    console.log("Parse Error: "+error)
  }
  });
}

function drawDishes(dishes) {
  
}