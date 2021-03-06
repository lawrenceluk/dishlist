/*
  Live filter from http://stackoverflow.com/questions/18524554/live-search-filter-using-jquery
*/
function filter(element) {
    var $trs = $('.dish').hide();
    var regexp = new RegExp($(element).val(), 'i');

    var $valid = $trs.filter(function () {
        return regexp.test($(this).children(':first-child').text())
    }).show();

    $trs.not($valid).hide()
}

$('#menu-searcher').on('keyup change', function () {
    filter(this);
})

/* Begin locu logic */

Parse.initialize("dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af", "wHkRLFgELqtUWCAnoXKPdJi7pWfYMJnNisEhuNS2"); 
var Restaurant = Parse.Object.extend("Restaurant");
var Dish = Parse.Object.extend("Dish");

var totaldishes = 0;
var saveddishes = 0;
var loaded = false;

$(document).on('click', "#uselocu", function() {
  $("#usinglocu").removeClass("hiding");
  $(this).addClass("hiding");
  var query = new Parse.Query(Restaurant);
  query.get($("#r-id").html(), {
    success: function(r) {
      makeLocuSearch($("#r-name").html(), $("#mapsaddress").html().split(",")[0], r); 
    },
    error: function(object, error) {
      console.log("Error: "+JSON.stringify(error));
    }
  });
});

function makeLocuSearch(rname, address, parseobject) {
  var message = "https://api.locu.com/v1_0/venue/search/"
  var parameters = {
    name: rname,
    street_address: address,
    api_key: "30cea3a865def155ddf7c9d321c4d7c14855c3b0" // lluk
    //api_key: "4232cdc3ccb9ea2140dab81b36109d9532ae1bf0" // jenovaaqua
    // 7c23a8b8d7e1ec7e147e6e7a2cee9a55c3d24e07 // will
  };
  $.ajax({
    'url': message,
    'data': parameters,
    'cache': true,
    'dataType': 'jsonp',
    'success': function(data, textStats, XMLHttpRequest) {
      if ((data.objects.length == 0 || data.objects[0].has_menu == false) && !loaded) {
        show(rname+" does not have a menu listed online.");
      } else {
        loaded = true;
        show(rname+" has a menu listed with Locu. Downloading...");
        getMenuFromLocu(data.objects[0].id, parseobject);
      }
    }
  });
}

var getMenuFromLocu = function(id, parserestaurant) {
  var base = "https://api.locu.com/v1_0/venue/"+id+"/";
  var parameters = {
    api_key: "30cea3a865def155ddf7c9d321c4d7c14855c3b0" // lluk
    //api_key: "4232cdc3ccb9ea2140dab81b36109d9532ae1bf0" // jenovaaqua
    // 7c23a8b8d7e1ec7e147e6e7a2cee9a55c3d24e07 // will
  };
  $.ajax({
    'url': base,
    'data': parameters,
    'cache': true,
    'dataType': 'jsonp',
    'success': function(data, textStats, XMLHttpRequest) {
      //console.log(data.objects[0].menus);
      var menu = data.objects[0].menus;
      for (var section=0;section<1;section++) { // multiple sections? don't know
        var itemsonly = [];
        getItems(menu[section].sections, itemsonly);
        //console.log(itemsonly);
        totaldishes += itemsonly.length;
        show(parserestaurant.attributes.name+": Retrieved "+itemsonly.length+" dishes from Locu.");
        for (var dd=0;dd<itemsonly.length;dd++) {
          addDishToParse(itemsonly[dd], parserestaurant, new Dish);
        }
        show("Saving to Parse. Please wait, this might take a while...");
      }
    },
    'error': function(error) {
      console.log("Error: "+error);
    }
  });
}

function addDishToParse(dish, parserestaurant, createdish) {
  if (!dish.price)
    dish.price = -1;
  createdish.save(
    {
      name: dish.name,
      description: dish.description,
      price: dish.price.toString(),
      restaurant: parserestaurant
    }, 
    {
    success: function(object) {
      saveddishes++;
      show("Added dish: '"+object.attributes.name+"'");
      if (saveddishes == totaldishes) {
        show("Finished! Refresh the page to see the listed dishes.");
      }
    },
    error: function(model, error) {
      console.log("Error: " + error.code + " " + error.message);
    }
  });
}

// recursively gets the dishes from the stupid hierarchical menu
function getItems(section, results) {
    for (var i=0;i<section.length;i++) {
        var value = section[i];
        if (typeof value === 'array') {
            getItems(value, results);
        } else if (typeof value == 'object') {
          if (value.subsections) {
            getItems(value.subsections, results);
          } else if (value.contents) {
            getItems(value.contents, results);
          } else if (value.type && value.type=="ITEM") {
            results.push({
              name: value.name,
              description: value.description,
              price: value.price
            });
          }
        }
    }
    return results;
}

function show(str) {
  $("#usinglocu").html(str);
}