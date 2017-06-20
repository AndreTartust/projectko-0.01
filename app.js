var express = require("express");
var app = express();
var serv = require("http").Server(app);

app.use(express.static('client'));
app.get("/", function(req, res)	{
	res.sendFile(__dirname + "/client/index.html");
});
app.use("/client", express.static(__dirname + "/client"));

serv.listen(2000);
console.log("Server started...");

var SOCKET_LIST = {}
readyCount = 0;

var io = require("socket.io")(serv,{});
io.sockets.on("connection", function(socket){

	socket.id = Math.random();
	SOCKET_LIST[socket.id] = socket;
	var playerName = ("" + socket.id).slice(2,7);
	var imageURLs = ["img/audi1.jpg", "img/lotus1.jpg", "img/mercedes1.jpg", "img/porche1.jpg", "img/rangerover1.jpg"];

	socket.on("disconnect", function() {
		delete SOCKET_LIST[socket.id];
	});

    	socket.on('sendMsgToServer',function(data){
		console.log(socket.id + ": " + data)
        	for(var i in SOCKET_LIST){
            		SOCKET_LIST[i].emit('addToChat',playerName + ': ' + data);
        	}
    	});

	console.log("New connection: " + socket.id);

	socket.on("happy",function(data) {
		console.log("I'm happy, because " + data.reason + "(" + playerName + ")");
        	for(var i in SOCKET_LIST){
            		SOCKET_LIST[i].emit("happyMessage",playerName + ' is happy!');
        	}
	});

	socket.on("gameStart", function(){
		console.log("game request")
		readyCount++;
		if (readyCount >= 2) {
			var randomIndex = Math.floor(Math.random() * imageURLs.length);
			console.log("Game started")
			for(var i in SOCKET_LIST){
				SOCKET_LIST[i].emit("imageURL", imageURLs[randomIndex]);
			}
			readyCount = 0;
		}
	});
});