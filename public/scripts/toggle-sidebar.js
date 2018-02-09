var mySidebar = $("#mySidebar");
function open_sidebar(){
	if(mySidebar.is(':hidden')){
		mySidebar
		.removeClass("w3-animate-left-hide")
		.addClass("w3-animate-left")
		.show();}
	else close_sidebar();}
function close_sidebar(){
	mySidebar
	.removeClass("w3-animate-left")
	.addClass("w3-animate-left-hide");
	setTimeout(() => mySidebar.hide(),400);
}

//sidebar close hiccups on route change, ugh.