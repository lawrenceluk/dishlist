var interval = new Date().getTime();
var loaded = 10;

$(window).scroll(function () {
  if ($(window).scrollTop() + $(window).height() > $(document).height() - 100 ) {
    if (interval+2000 < new Date().getTime()) {
    	interval = new Date().getTime() + 2000;
    	loadMore();
    }
  }
});

Parse.initialize("dmq07tEG39xubkof59l2UyXnZJcojifl3jlYQ0af", "wHkRLFgELqtUWCAnoXKPdJi7pWfYMJnNisEhuNS2");
var Restaurant = Parse.Object.extend("Restaurant");

function loadMore() {
	console.log("more");
	var query = new Parse.Query(Restaurant);
	query.descending("createdAt");
	query.limit(10);
	query.skip(loaded);
	query.find({
	  success: function(results) {
	    loaded += results.length;
	    for (var i=0;i<results.length;i++) {
	    	appendRestaurant(results[i]);
	    }
	  },
	  error: function(error) {
	  	console.error("Could not load more Restaurant entries.");
	  	interval = new Date().getTime() + 10000;
	  }
	});
}

var $body = $("#home-content");

function appendRestaurant(r) {
	var str = "<a href='/restaurant/"+r.get("name").replace(/[\*\^\'\!\.]/g, '').split(' ').join('')+"/"+r.id+"'><div class='restaurant row'>";
	str += '<div class="col-sm-3 col-xs-4">';
	str += "<img src="+r.get("yelp_image_url")+" class='img-thumbnail'></div>"
	str += '<div class="col-sm-9 col-xs-8">'
	str += "<h4>"+r.get("name")+"</h4>"
	str += '<span class="rating">'+r.get("rating")+'</span>/5 in '+r.get("review_count")+' reviews</h5><br /><div class="row"><div class="col-sm-5"><span class="text-warning">'+r.get("display_yelp_categories")+'</span></div><div class="col-sm-7">'+r.get("short_address")+'</div></div></div></div></a>'
	$body.append(str);
}