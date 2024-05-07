const mongoose= require('mongoose');
mongoose.Promise=global.Promise;
mongoose.connect('mongodb://localhost:27017/TaskManager',{
    useNewUrlParser: true, 
    useUnifiedTopology: true
 }).then(()=>{
    console.log("Connected to Mongpdb successfully");
}).catch((e)=>{
    console.log("error while trying to connect");
    console.log(e);
});

module.exports={
    mongoose
};