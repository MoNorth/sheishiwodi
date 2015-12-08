var room = {};
var game = {};
var beginGame = {};
var wechat = require("wechat-node");
var words = require("./words");
var createRoom = function(req,res,result) {
	var name = result.fromusername;
	var roomname = hasRoom(name);
	var gamename = hasGame(name);
	if(roomname || gamename)
		res.sendText("您已经在房间 " + roomname || gamename);
	else
	{
		room[name] = [name];
		res.sendText("新建的房间名为: " + name);
	}
}

var hasRoom = function(name) {
	for(var i in room)
	{
		for(var j in room[i])
		{
			if(name === room[i][j])
				return i;
		}
	}
	return false;
}

var hasGame = function(name) {
	for(var i in game)
	{
		for(var j in game[i])
		{
			if(name === game[i][j])
				return i;
		}
	}
	return false;
}


var setinRoom = function(req,res,result) {
	var roomname = result.content;
	if(roomname in room)
	{
		res.sendText("加入成功");
		room[roomname].push(result.fromusername);
	}
	else
	{
		res.sendText("没有这个房间或房间已开始游戏");
	}
}


var joinRoom = function(req,res,result) {
	var name = result.fromusername;
	var roomname = hasRoom(name);
	var gamename = hasGame(name);
	if(roomname || gamename)
		res.sendText("您已经在房间 " + roomname || gamename);
	else
	{
		res.sendText("请输入房间号");
		wechat.createSession(result,setinRoom);
	}
}



var outRoom = function(req,res,result) {
	var name = result.fromusername;
	var roomname = hasRoom(name);
	if(roomname)
	{
		if(name === roomname)
		{
			res.sendText("你是房主,已解散该房间");
			delete room[roomname];
		}
		else
		{
			res.sendText("已退出房间");
			var i = 0;
			for(i = 0; i < room[roomname].length; i++)
				if(room[roomname][i] === name)
					break;
			room[roomname].splice(i,1);
		}
	}
	else {
		res.sendText("您还没有加入房间或房间已开始游戏");
	}
}

var hasrname = function(roomname,name) {
	for(var i in beginGame[roomname]["rname"])
		if(name === beginGame[roomname]["rname"][i])
			return false;
	beginGame[roomname]["rname"].push(name);
	return true;
}

var pwordsfun =  function(roomname,rom,pnum) {
	var num = beginGame[roomname]["now"];
	if(num >= game[roomname].length)
	{
		beginGame[roomname]["now"] = 0;
		//开始游戏下一步
	}
	else
	{
		var w = "";
		if(num === pnum)
			w = words[rom][1];
		else
			w = words[rom][0];
		wechat.active(ame[roomname][num],w,function(ok,result) {
			if(!ok)
			{
				console.log("特别大的error");
				return;
			}
			beginGame[roomname]["now"] = num + 1;
			pwordsfun(roomname,rom,pnum);
		})
	}
}

var pwords = function(roomname) {
	var rom  = Math.ceil(Math.random() * game[roomname].length) - 1;
	var pnum = Math.ceil(Math.random() * words.length) - 1;
	pwordsfun(roomname,rom,pnum);
}






var setrname = function(roomname) {
	var num = beginGame[roomname]["now"];
	if(num >= game[roomname].length)
	{
		beginGame[roomname]["now"] = 0;
		//	//发卡,标记卧底
	}
	else
	{
		wechat.active(game[roomname][num],"请输入你的花名",function(ok,result) {
			if(!ok)
			{
				console.log("特别大的error");
				return;
			}
			wechat.createSession({fromusername : game[roomname][num]},function(req,res,result) {
				if(hasrname(roomname,result.content))
				{
					res.sendText("设置成功");
					beginGame[roomname]["now"] = num + 1;
					setrname(roomname);
				}
				else
				{
					res.sendText("已有此姓名");
					setrname(roomname);
				}
			})

		})
	}
}



var beginGame = function(req,res,result) {
	var name = result.fromusername;
	var roomname = hasRoom(name);
	if(!roomname)
	{
		res.sendText("你还没有加入房间或房间已开始游戏");
		return;
	}
	res.sendText("开始游戏");
	game[roomname] = room[roomname];
	delete room[roomname];
	beginGame[roomname] = {};
	beginGame[roomname]["rname"] = [];
	beginGame[roomname]["now"] = 0;
	//轮流写出自己的花名
	setrname(roomname);
	//给这个人发该0号人了,创建session
	//一圈结束,开始指认
	//指认成功,游戏结束
	//之人失败,删除那个人,继续从0开始
	//只剩两人,游戏结束
}



exports.createRoom = createRoom;
exports.joinRoom = joinRoom;
exports.outRoom = outRoom;
exports.beginGame = beginGame;