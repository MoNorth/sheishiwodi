var express = require("express");
var app = express();
var wechat_node = require("wechat-node");
var wechat = new wechat_node(app,"wx2d99e56a3326b348","d4624c36b6795d1d99dcf0547af5443d","northk");
var room = require("./route/room");

// wechat.use("setMenu",function(ok,result) {
// 	console.log(result);
// })


wechat.use("postData");
wechat.use("active");
wechat.use("session");

wechat.retext(function(ok,req,res,result) {
	res.sendText("没有开始游戏或没轮到您说话");
});

wechat.reclick({
	"create_room": room.createRoom,
	"setin_room" : room.joinRoom,
	"setout_room" : room.outRoom,
	"begin_game" : room.beginGame,
	"write_room" : room.writeRoom
},"");


app.listen(8080);
