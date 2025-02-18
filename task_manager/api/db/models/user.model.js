const mongoose=require('mongoose');
const _=require('lodash');
const jwt=require('jsonwebtoken');
const crypto=require('crypto');
const bcrypt=require('bcryptjs');
// jwt secrets
const jwtSecrets="51778657246321226641fsdklaf7148924065"
const UserSchema=new mongoose.Schema({
    email : {
        type : String,
        required: true,
        minlength: 1,
        trim : true,
        unique:true
    },
    password :{
        type: String,
        required: true,
        minlength: 8
    },
    sessions: [{
        token:{
            type: String,
            required:true
        },
        expiresAt:{
            type:Number,
            required:true
        }
    }]
})
//instance methods
UserSchema.methods.toJSON= function(){
    const user=this;
    const userObject=user.toObject();
    // return eevrything except sessions and passwords
    return _.omit(userObject,['password','sessions']);
}
UserSchema.methods.generateAccessAuthToken = function(){
    const user=this;
    return new Promise((resolve,reject)=>{
        //create json web token and return that
        jwt.sign({_id :user._id.toHexString()},jwtSecrets,{expiresIn: "15m"},(err,token)=>{
            if(!err){
                resolve(token);
            }
            else{
                reject();
            }
        });
    });
}
UserSchema.methods.generateRefreshAuthToken =function(){
    return new Promise((resolve,reject)=>{
        crypto.randomBytes(64,(err,buf)=>{
            if(!err){
                let token= buf.toString('hex');
                return resolve(token);
            }
        })
    })
}
UserSchema.methods.createSession=function(){
    const user=this;
    return user.generateRefreshAuthToken().then((refreshToken)=>{
        return   saveSessionToDatabase(user,refreshToken);
    }).then((refreshToken)=>{
        return refreshToken;
    }).catch((e)=>{
        return Promise.reject('Failed to save session to database \n'+e)
    });
}
//model methods static methods
UserSchema.statics.getJwtSecrets=()=>{
    return jwtSecrets;
}
UserSchema.statics.findByIdAndToken= function(_id,token){
    const User=this;
    return User.findOne({
        _id,
        "sessions.token": token
    });

}
UserSchema.statics.findByCredentials= function(email,password){
     let User=this;
     return User.findOne({email}).then((user)=>{
        if(!user) return Promise.reject()

        return new Promise((resolve,reject)=>{
            bcrypt.compare(password,user.password,(err,res)=>{
                if(res) resolve(user);
                else reject();
            });
        })
     })
}
UserSchema.statics.hasRefreshTokenExpired=(expiresAt)=>{
    let secondsSinceEpoch= Date.now()/1000;
    if(expiresAt>secondsSinceEpoch){
        return false;
    }
    else{
        return true;
    }
}
//MiDDleware
UserSchema.pre('save',function(next){
    let user=this;
    let costFactor=10;
    if(user.isModified('password')){
        //if password field has been edited or changed run this code
        //geneRATE Salt and hash password
        bcrypt.genSalt(costFactor,(err,salt)=>{
            bcrypt.hash(user.password,salt,(err,hash)=>{
                user.password=hash;
                next();
            })
        })
    }
    else{
        next();
    }
})

//helper methods
// session= refresh+expiry
let saveSessionToDatabase=(user,refreshToken)=>{
    return new Promise((resolve,reject)=>{
        let expiresAt= generateRefreshTokenExpiryTime();
        user.sessions.push({'token': refreshToken,expiresAt});
        user.save().then(()=>{
            return resolve(refreshToken);
        }).catch((e)=>{
            reject(e);
        });
    });

}
let generateRefreshTokenExpiryTime=()=>{
    let daysUntilExpire= "10";
    let secondUntilExpire= ((daysUntilExpire*24)*60)*60;
    return ((Date.now()/1000)+secondUntilExpire);
}

const User= mongoose.model('User',UserSchema);
module.exports= {User};