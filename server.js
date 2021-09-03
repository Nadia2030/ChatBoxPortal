const app = require('express')();
const http = require('http').Server(app);
const io = require('socket.io')(http);

//Connect to DataBase
let obj = require("mongoose");
let url = "mongodb://localhost:27017/mern";
 
obj.connect(url).then(res=>console.log("connected to database")).catch(error=>console.log(error));
let db = obj.connection;

 
//http://localhost:9091
app.get("/",(req,res)=> {
    res.sendFile(__dirname+"/index.html");
})
 
  
io.on("connection",(socket)=> {
    console.log("Client connected");
    let chat= db.collection('chat');
    // get chat history and show to client
    chat.find().limit(100).sort({_id:1}).toArray(function(err, result){
        if(err){
            throw err;
        }
        console.log(result);
           // Emit the messages
           socket.emit("output",result);
        });
  
    // to get the message from a client 
    socket.on("obj",(data)=> {
        let name = data.name;
        let message = data.message;
 
        if(name == '' || message == ''){
            // Send error status
            console.log("Please enter a name and message");
            } else {
                // Insert message
            chat.insert({name: name, message: message}, function(){
            socket.emit('output', [data]);
            socket.broadcast.emit('output', [data]);
        });
    }
});
});

        


http.listen(9091,()=>console.log("Server running")); 