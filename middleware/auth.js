const jwt = require('jsonwebtoken')
const Register = require('../modules/userschema')
const cookie = require('cookie');

const auth = async (req,res,next)=>{
    try{
        const token = req.cookies.jwt;
        const verifyUser = jwt.verify(token ,process.env.SECRETKEY);

    }
    catch(error){
        res.status(401).send(error)
    }
}