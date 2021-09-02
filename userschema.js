const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema({

    name:{
        type: String,
        required: true
    },
    email:{
        type: String,
        required: true
    },
    phone:{
        type: String,
        required: true
    },
    password:{
        type: String,
        required:true
    },
    location :  { type: {type:String}, coordinates: [Number]},
    age:{
        type: String,
        required: true
    },
    gender:{
        type: String,
        required: true 
    },
    isVerified:{
        type: Boolean,
        default: false
    },
    tokens:[
        {  token:{
              type: String,
              required:true,
          }
        }],

    image:{
        type: String,
        data: Buffer
    },
    workinglocation:[{
        workingloc:{
            type: {type:String}, coordinates: [Number]
        },
        price:{
            type: String, 
        }

    }],
    Edd:[{
        edd:{ type: String}
    }],
    Availablity:[{
        available_date:{
        type:Date
        },
        available_timefrom:{
            type: Date
            },
        available_timetill:{
            type:Date
            },
        location:{type: {type:String}, coordinates: [Number],

        }
    }]

    

});

userSchema.pre('save', async function(next){
    if(this.isModified('password')){
        this.password= await bcrypt.hash(this.password,12);
        }
    next();
    });

    userSchema.methods.generateAuthToken = async function(){
        try{
                let webtoken = jwt.sign({_id: this._id}, process.env.SECRETKEY);
                this.tokens = this.tokens.concat({token: webtoken});
                await this.save();
                return webtoken;
        
        }
        catch(err){
            console.log(err);
        }
    }    



const User = mongoose.model('USER', userSchema);
module.exports = User