var express=require('express')
var app=express();
var mongoose=require('mongoose')
var bodyParser=require('body-parser')
var path=require('path')
var bcrypt=require('bcryptjs')

app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, '/public/dist/public')))

var NUM_SALTS=10

mongoose.connect('mongodb://localhost/OpenForum')

var UserSchema = new mongoose.Schema({
    user_name:{type:String, required:[true,"Username is required"],minlength:[3,"Username must be 3 characters"]},
    first_name:{type:String, required:[true, "First name is required"]},
    last_name:{type:String, required:[true, "Last name is required"]},
    email:{type:String, required:[true, "Email is required"]},
    password:{type:String, required:[true, "Password is required"], minlength:[8, "Password must be 8 characters"]}
}, {timestamps:true})
mongoose.model('User', UserSchema)
var User=mongoose.model('User')

var CommentSchema = new mongoose.Schema({
    userID:{type:String, required:[true, "UserID is required"]},
    questionID:{type:String, required:[true, "QuestionID is required"]},
    comment:{type:String, required:[true, "Comment is required"]},
    username:{type:String, required:[true, "Username is required"]}
}, {timestamps:true})
mongoose.model('Comment', CommentSchema)
var Comment=mongoose.model('Comment')

var QuestionSchema = new mongoose.Schema({
    userID:{type:String, required:[true, "UserID is required"]},
    subject:{type:String, required:[true, "Subject is required"]},
    question:{type:String, required:[true, "A question is required"]},
    username:{type:String, required:[true, "Username of poster is required"]},
    comments:[CommentSchema] 
}, {timestamps:true})
mongoose.model('Question', QuestionSchema)
var Question=mongoose.model('Question')

app.post('/processRegister', function(request, response){
    var user_name=request.body['user_name'];
    var first_name=request.body['first_name'];
    var last_name=request.body['last_name'];
    var password=request.body['password'];
    var email=request.body['email'];

    User.findOne({email:email}, function(error,user){
        if(error){
            return response.json({success:500,message:'Server error',error:error});
        }else{
            if(user!=null){
                return response.json({success:400,message:'A user already exists with this email'});
            }else{
                var hashed_Password=bcrypt.hashSync(password, NUM_SALTS);
                var newUser=new User({user_name:user_name,first_name:first_name,last_name:last_name,email:email,password:hashed_Password});
                newUser.save(function(error){
                    if(error){
                        return response.json({success:400,message:'There was an error registering. Check your input',error:error});
                    }else{
                        return response.json({success:201,message:"User Created"});
                    }
                })
            }
        }
    })
    
})
app.post('/processLogin', function(request, response){

})

app.all("*", function(request, response){
    return response.sendFile(path.resolve('./public/dist/public/index.html'))
})
app.listen(8000, function(){
    console.log("Listening on port 8000")
})