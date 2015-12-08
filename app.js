var express = require("express");
var app = express();
var wechat_node = require("wechat-node");
var wechat = new wechat_node(app,"wx2d99e56a3326b348","d4624c36b6795d1d99dcf0547af5443d","northk");


wechat.use("postData");
wechat.use("active");

var openid = "";


wechat.retext(function(ok,req,res,result) {
	openid = result.fromusername;
	console.log(openid);
	res.sendText("ok");
});

wechat.reclick({
	"ser_book":
	function(req,res,result) {
		wechat.active(openid,"hello",function(ok,body) {
		console.log(body);
		});
		res.send("");
	}

	
	
},"");


app.listen(8080);
