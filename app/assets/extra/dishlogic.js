var parseuser, restaurant;
// handle parse stuff
if ($("#username").html().length > 0) {
  Parse.initialize("dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af", "wHkRLFgELqtUWCAnoXKPdJi7pWfYMJnNisEhuNS2"); 
  var User = Parse.Object.extend("User");
  var Dish = Parse.Object.extend("Dish");
  var Restaurant = Parse.Object.extend("Restaurant");
  var getuser = new Parse.Query(User);
  getuser.equalTo("username", $("#username").html());
  getuser.find({
    success: function(user) {
      parseuser = user[0];
      syncDishlist();
    },
    error: function(object, error) {
      console.log("Parse Error: "+JSON.stringify(error));
    }
  });
  var getrestaurant = new Parse.Query(Restaurant);
  getrestaurant.get($("#r-id").html(), {
    success: function(rest) {
      restaurant = rest;
    },
    error: function(object, error) {
      console.log("Parse Error: "+JSON.stringify(error));
    }
  });
  // scans the page for things already on list
  function syncDishlist() {
    var relation = parseuser.relation("dishlist");
    relation.query().find({
      success: function(list) {
        var count = 0;
        for (var i=0;i<list.length;i++) {
          if ($("#p"+list[i].id).length > 0) {
            count++;
            $("#p"+list[i].id).removeClass("fa-plus");
            $("#p"+list[i].id).addClass("fa-check green");
            $("#"+list[i].id).addClass("subtlegreen");
          }
        }
        $("#yourlist").html(count);
      }
    });
  }

  $(document).on('click', ".dish", function() {
    var $icon = $("#p"+$(this).attr('id'));
    if ($icon.hasClass("fa-plus")) {
      $icon.removeClass("fa-plus");
      $icon.addClass("fa-check green");
      var dishid = $(this).attr('id');
      Parse.Cloud.run('addDishToUserDishlist', { userid: parseuser.id, dish: dishid }, {
        success: function(status) {
          $("#yourlist").html(parseInt($("#yourlist").html())+1);
          $("#"+dishid).addClass("subtlegreen");
        },
        error: function(error) {
          $icon.addClass("fa-plus");
          $icon.removeClass("fa-check green");        
          console.log("Error saving: "+JSON.stringify(error));
        }
      });
    } else {
      $icon.addClass("fa-plus");
      $icon.removeClass("fa-check green");
      var dishid = $(this).attr('id');
      Parse.Cloud.run('removeDishFromUserDishlist', { userid: parseuser.id, dish: dishid }, {
        success: function(status) {
          $("#yourlist").html(parseInt($("#yourlist").html())-1);
          $("#"+dishid).removeClass("subtlegreen");
        },
        error: function(error) {
          $icon.removeClass("fa-plus");
          $icon.addClass("fa-check green");        
          console.log("Error saving: "+JSON.stringify(error));
        }
      });     
    }
  });
  $("#d-add").submit(function() {
    var name = $("#d-name").val();
    var descrip = $("#d-descrip").val();
    var price = $("#d-price").val();
    if (name == "" || price == "") {
      showAdd("Dish name and price are required.");
    } else {
      $(this).hide();
      showAdd("Adding "+name+"...");
        var d = new Dish();
        d.save(
          {
            name: name,
            description: descrip,
            price: price,
            restaurant: restaurant
          }, 
          {
          success: function(object) {
            showAdd("Added dish: '"+object.attributes.name+"'. Refresh the page to see it.");
            $("#d-add").show();
            $("#d-add").trigger("reset");
          },
          error: function(model, error) {
            showAdd("Error - could not add the dish. Please try again later.");
            console.log("Error: "+JSON.stringify(error));
          }
        });
    }
    return false; // avoid to execute the actual submit of the form.
  });
  var $dshow = $("#d-message");
  function showAdd(str) {
    $dshow.removeClass("hiding");
    $dshow.html(str);
  }
}