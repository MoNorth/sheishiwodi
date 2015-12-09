var room = {};
var game = {};
var beginGame = {};
var roomName = {};
var roomHuName = {};
var wechat = require("wechat-node");
var words = require("./words");

var hasRoomName = function(name) {
	return name in roomName;
}



var createRoom = function(req,res,result) {
	var name = result.fromusername;
	var roomname = hasRoom(name);
	var gamename = hasGame(name);
	if(roomname || gamename)
		res.sendText("您已经在房间 " + roomname || gamename);
	else
	{
		res.sendText("房间新建成功,请给房间起个花名");
		room[name] = [name];
		wechat.createSession(result,function(req,res,body) {
			var roomHName = body.content;
			res.sendText("快把你的房间名 " + roomHName + ",推荐给朋友吧");
			roomName[roomHName] = body.fromusername;
			roomHuName[body.fromusername] = roomHName;
			console.log(body.fromusername + "成立了房间" + roomHName);
		})

		
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
	if(roomname in roomName)
	{
		res.sendText("加入成功");
		room[roomName[roomname]].push(result.fromusername);
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
		res.sendText("请输入房间花名");
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
			delete roomName[roomHuName[name]];
			delete roomHuName[name];
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


var speak = function(roomname) {
	var num = beginGame[roomname]["now"];
	if(num >= game[roomname].length)
	{
		beginGame[roomname]["now"] = 0;
		//开始游戏下一步
		toupiao(roomname,false);
	}
	else
	{
		wechat.active(game[roomname][num],"请描述你的卡片内容",function(ok,result) {
			if(!ok)
			{
				console.log("特别大的error");
				return;
			}
			wechat.createSession({fromusername : game[roomname][num]},function(req,res,body) {
				res.sendText("发送成功");
				wechat.active(game[roomname],beginGame[roomname]["rname"][num] + ": " + body.content,function() {
					beginGame[roomname]["now"] = num + 1;
					speak(roomname);
				},true);
				
			})
		})
	}
}

var hasH = function(roomname,name) {
	for(var i in beginGame[roomname]["rname"])
		if(beginGame[roomname]["rname"][i] === name)
			return true;
	return false;
}


var isEnd = function(roomname,toupiaoname) {
	var nameM = "";
	for(var i in toupiaoname)
	{
		if(!nameM)
			nameM = {name:i,piaoshu:toupiaoname[i]};
		else
		{
			if(nameM.piaoshu < toupiaoname[i])
				nameM = {name:i,piaoshu:toupiaoname[i]};
		}
	}
	if(nameM.name === beginGame[roomname]["wodi"])
	{
		wechat.active(game[roomname],"游戏结束,卧底是"+nameM.name,function() {});
		delete game[roomname];
		delete beginGame[roomname];
		console.log(roomname + "的游戏结束");
	}
	else
	{
		wechat.active(game[roomname],"游戏继续,"+nameM.name+"出局",function() {});
		var i = 0 ;
		for(i=0;i<beginGame[roomname]["rname"].length;i++)
			if(beginGame[roomname]["rname"][i] === nameM.name)
				break;
		game[roomname].splice(i,1);
		beginGame[roomname]["rname"].splice(i,1);
		if(game[roomname].length <= 2)
		{
			wechat.active(game[roomname],"游戏结束,卧底是"+beginGame[roomname]["wodi"],function() {});
			delete game[roomname];
			delete beginGame[roomname];
			console.log(roomname + "的游戏结束");
		}
		else
		{
			speak(roomname);
		}
	}
}




var toupiao = function(roomname,toupiaoname) {
	if(!toupiaoname)
		toupiaoname = {};
	var num = beginGame[roomname]["now"];
	if(num >= game[roomname].length)
	{
		beginGame[roomname]["now"] = 0;
		//开始游戏下一步
		isEnd(roomname,toupiaoname);
	}
	else
	{
		wechat.active(game[roomname][num],"请写出谁是卧底",function(ok,result) {
			if(!ok)
			{
				console.log("特别大的error");
				return;
			}
			wechat.createSession({fromusername : game[roomname][num]},function(req,res,body) {
				var younames = body.content;
				if(hasH(roomname,younames))
				{
					res.sendText("发送成功");
					if(toupiaoname[younames])
						toupiaoname[younames] ++;
					else
						toupiaoname[younames] = 1;
					beginGame[roomname]["now"] = num + 1;
					toupiao(roomname,toupiaoname);
				}
				else
				{
					res.sendText("没有这个人");
					toupiao(roomname,toupiaoname);
				}

				
			})
		})
	}
}



var pwordsfun =  function(roomname,rom,pnum) {
	var num = beginGame[roomname]["now"];
	if(num >= game[roomname].length)
	{
		beginGame[roomname]["now"] = 0;
		//开始游戏下一步
		speak(roomname);
	}
	else
	{
		var w = "";
		if(num === pnum)
			w = words[rom][1];
		else
			w = words[rom][0];
		wechat.active(game[roomname][num],w,function(ok,result) {
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



/**
 * 高校随机数
 */

var pwords = function(roomname) {
	var pnum  = Math.ceil(Math.random() * game[roomname].length) - 1;
	var rom = Math.ceil(Math.random() * words.length) - 1;
	beginGame[roomname]["wodi"] = beginGame[roomname]["rname"][pnum];
	pwordsfun(roomname,rom,pnum);
}






var setrname = function(roomname) {
	var num = beginGame[roomname]["now"];
	if(num >= game[roomname].length)
	{
		beginGame[roomname]["now"] = 0;
		pwords(roomname);
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
	if(name !== roomname)
	{
		res.sendText("您不是房主,不能开始游戏");
		return;
	}
	res.send("");
	delete roomName[roomHuName[name]];
	delete roomHuName[name];
	game[roomname] = room[roomname];
	delete room[roomname];
	beginGame[roomname] = {};
	beginGame[roomname]["rname"] = [];
	beginGame[roomname]["now"] = 0;
	console.log(roomname + "的游戏开始");
	//轮流写出自己的花名
	//
	wechat.active(game[roomname],"游戏开始",function() {
		setrname(roomname);
	},true);
	
	//给这个人发该0号人了,创建session
	//一圈结束,开始指认
	//指认成功,游戏结束
	//之人失败,删除那个人,继续从0开始
	//只剩两人,游戏结束
}

var writeRoom = function(req,res,result) {
	var str = "";
	for(var i in roomName)
		str += i + "\n";
	if(str)
		res.sendText(str);
	else
		res.sendText("没有房间,自己创建一个吧")
}


exports.createRoom = createRoom;
exports.joinRoom = joinRoom;
exports.outRoom = outRoom;
exports.beginGame = beginGame;
exports.writeRoom = writeRoom;