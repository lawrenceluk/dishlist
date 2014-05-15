var dishlist, parseuser;
var $c = $("#content");
Parse.initialize("dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af", "wHkRLFgELqtUWCAnoXKPdJi7pWfYMJnNisEhuNS2"); 
var User = Parse.Object.extend("User");
var Dish = Parse.Object.extend("Dish");

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
  for (var i=0;i<dishlist.length;i++) {
    $c.append(dishlist[i].get("name")+"<br/>");
  }
}