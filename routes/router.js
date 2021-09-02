const express = require('express');
const app = express();
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const User= require('../modules/userschema.js');
const Token= require('../modules/token.js');
const nodemailer = require('nodemailer');
const sendgridtransport = require('nodemailer-sendgrid-transport');
const bcrypt = require('bcrypt');
const cookie = require('cookie');
const multer = require('multer');
const fs =require('fs');



app.use(express.json()) 

const middleware = (req,res,next) =>{
    
    console.log('middle');

    next()

}
var upload = multer({ dest: "./uploads/",
    rename: function (fieldname, filename) {
      return filename;
    },
   });

app.get('/', function(req, res){
    res.send('Hello from the Server')
}),

app.post('/signup', async function(req, res){
    
    // console.log(req.body)
    //   res.json({message: req.body})
    const {name,email,phone,password,age,gender,longitude,latitude}=req.body;
    if(!name||!email||!phone||!password||!age||!gender||!longitude||!latitude)
     {
       res.status(400).json({error:"Required quantity can't be null"})
     }
    else
    {
        try{
            const found = await User.findOne({email:email});
            if(found){
                res.status(401).json({message: "User Exist"})
            }
            else{
                const adduser= new User({name : name, email: email, phone: phone, password: password, age: age, gender:gender, location : { type: "Point", coordinates: [longitude, latitude] }});
                const datasaved = await adduser.save();
                

                if(datasaved){
                
                var token = new Token({ _userId: adduser._id, token: crypto.randomBytes(16).toString('hex') });
                token.save(function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
         
                    // Send the email
                    var transporter = nodemailer.createTransport(sendgridtransport({
                        auth:{
                            api_key: process.env.APIKEY
                        },
                     }));
                    var mailOptions = { from: 'kushagradevgon@gmail.com', to: adduser.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + "localhost:3000" + '\/confirmation\/' + token.token + '.\n' };
                    transporter.sendMail(mailOptions, function (err) {
                        if (err) { return res.status(500).send({ msg: err.message }); }
                        res.status(200).send('User Created & A verification email has been sent to ' + adduser.email + '.');
                    });
                });
                
            }
            }
        }
        catch(err){
            res.status(500).json({error: err})
            console.log(err)

        }
    }

    

}),

app.post('/confirmation', function(req,res){
    Token.findOne({ token: req.body.token }, function (err, token) {
        if (!token) return res.status(400).send({ type: 'not-verified', msg: 'We were unable to find a valid token. Your token my have expired.' });
 
        // If we found a token, find a matching user
        User.findOne({ _id: token._userId,}, function (err, user) {
            if (!user) return res.status(400).send({ msg: 'We were unable to find a user for this token.' });
            if (user.isVerified) return res.status(400).send({ type: 'already-verified', msg: 'This user has already been verified.' });
 
            // Verify and save the user
            user.isVerified = true;
            user.save(function (err) {
                if (err) { return res.status(500).send({ msg: err.message }); }
                res.status(200).send("The account has been verified. Please log in.");
            });
        });
    });
});

app.post('/resend', function(req,res){
    User.findOne({ email: req.body.email }, function (err, user) {
        if (!user) return res.status(400).send({ msg: 'We were unable to find a user with that email.' });
        if (user.isVerified) return res.status(400).send({ msg: 'This account has already been verified. Please log in.' });
 
        // Create a verification token, save it, and send email
        var token = new Token({ _userId: user._id, token: crypto.randomBytes(16).toString('hex') });
                token.save(function (err) {
                    if (err) { return res.status(500).send({ msg: err.message }); }
         
                    // Send the email
                    var transporter = nodemailer.createTransport(sendgridtransport({
                        auth:{
                            api_key: process.env.APIKEY
                        },
                     }));
                    var mailOptions = { from: 'kushagradevgon@gmail.com', to: adduser.email, subject: 'Account Verification Token', text: 'Hello,\n\n' + 'Please verify your account by clicking the link: \nhttp:\/\/' + "localhost:3000" + '\/confirmation\/' + token.token + '.\n' };
                    transporter.sendMail(mailOptions, function (err) {
                        if (err) { return res.status(500).send({ msg: err.message }); }
                        res.status(200).send('User Created & A verification email has been sent to ' + adduser.email + '.');
                    });
                });
 
    });


});
app.post('/signin', async function(req, res){
    let token;
    const {email,password}=req.body;
      if(!email || !password)
      {
          res.status(400).json({error: "Required quantity can be null"})
      };
      try {
        
        
    
        const found = await User.findOne({email: email})
            if(found.isVerified===true){
           if(found)
            {
                const login = await bcrypt.compare(password, found.password);
                               
                if(login){
                    token = await found.generateAuthToken();
                    res.cookie('jwt',token)
                    res.status(201).json({message: "User LOGGED In"})   


                }
                else{
                    res.status(400).json({error:"Invalid credentials"})
                }
            }
            else{
                res.status(400).json({error:"Invalid credentials"})
                
        }
    }
        else{
            res.status(400).json({error:"Account is not verified"})
        }
        }
        catch(err){
            res.status(500).json(err),
            console.log(err)
        }
}),

app.get('/subscribe', function(req, res){
    res.send('Hello from the Subscribe')
}),

app.post('/profile' ,function(req, res){
    const {longitude,latitude,edd,available_date,available_timefrom,available_timetill}=req.body;
    var newItem = new User();
//  newItem.img.data = fs.readFileSync(req.body.path)
//  newItem.img.contentType = "image/png";
 newItem.workinglocation = { type: "Point", coordinates: [longitude, latitude] };
 newItem.Edd=edd;
 newItem.Availablity.available_date = available_date,
 newItem.Availablity.available_timefrom = available_timefrom,
 newItem.Availablity.available_timetill = available_timetill,
 newItem.Availablity.location = { type: "Point", coordinates: [longitude, latitude] };
 
console.log(newItem)
 newItem.save();
 res.status(201).send({message:"added"}) 
}),

app.get('/appointment', function(req, res){
    res.send('Hello from the Appointment')
}),

app.get('/chat', function(req, res){
    res.send('Hello from the chat')
}),

app.get('/feedback', function(req, res){
    res.send('Hello from the feedback')
}),

app.get('/my_account', function(req, res){
    res.send('Hello from the my account')
}),

app.get('/health_feed', function(req, res){
    res.send('Hello from the health feed')
}),

app.get('/logout', function(req, res){
    res.send('Hello from the logout')
})

module.exports = app