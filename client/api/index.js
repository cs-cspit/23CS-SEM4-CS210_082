// const express=require('express');
// const app=express();
// const cors=require('cors');
// const mongoose=require("mongoose");
// const User=require('./models/User.js');
// const bcryptSalt = bcrypt.genSaltSync(10);


// require('dotenv').config();
// app.use(express.json());
// app.use(cors({
//     credentials:true,
//     origin:'http://localhost:5173/',
// }));


// mongoose.connect(process.env.MONGO_URL);
// app.get('/test',(req , res)=>{
//     res.json('test ok');
// });
// app.post('/register',async(req,res)=>{
// try{
//     const {name,email,password}=req.body;
//     const userDoc=await User.create({
//         name,
//         email,
//         password:bycrpt.hashSync(password,bycrptSalt),
//     })
//     res.json(userDoc);
// }
// catch(e){
//     res.status(422).json(e);
// }

// })




// app.post('/login',async (req,res)=>{
//     const{email,password}=req.body;
//     const UserDoc =await User.findOne({email:email});
//     if(userDoc)
//     {
//         res.json('found');
//     }
//     else{
//         res.json('not found');
//     }
// })

// app.listen(4000);
// //4rnSjU3xjQOjyNld






const express = require('express');
const app = express();
const cors = require('cors');
const jwt=require('jsonwebtoken');
const mongoose = require("mongoose");
const bcrypt = require('bcrypt');  // Import bcrypt
const User = require('./models/User.js');
require('dotenv').config();

mongoose.set('strictQuery', true); //added by chatgpt

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret='mnbvcxzasdfghjklpoiuytrewq'

app.use(express.json());
app.use(cors({
    credentials: true,
    origin: 'http://localhost:5173',
}));

// mongoose.connect(process.env.MONGO_URL);
mongoose.connect(process.env.MONGO_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true
})
    .then(() => console.log('Connected to MongoDB'))
    .catch((err) => console.error('MongoDB connection error:', err));
//new added

app.get('/test', (req, res) => {
    res.json('test ok');
});

//register modified
app.post('/register', async (req, res) => {
    try {
        const { name, email, password } = req.body;

  
        if (!name || !email || !password) {
            console.log("Missing required fields");
            return res.status(400).json('All fields are required');
        }

      
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            console.log("User already exists");
            return res.status(409).json('User already exists');
        }

    
        const userDoc = await User.create({
            name,
            email,
            password: bcrypt.hashSync(password, bcryptSalt),
        });

        console.log("User registered successfully:", userDoc);
        res.json(userDoc);

    } catch (e) {
       
        console.error('Error during registration:', e);

        
        res.status(500).json('Registration failed. Please try again later');
    }
});


app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const userDoc = await User.findOne({ email: email });  // Correct variable spelling
    if (userDoc) {
        const passOK=bcrypt.compareSync(password,userDoc.password);
        if(passOK)
        {
            jwt.sign({email:userDoc.email,id:userDoc._id},jwtSecret, {} ,(err,token)=>{
                if(err)throw err;
                req.cookie('token',token).json('pass ok');
            });
           
        }
        else
        {
            res.status(422).json('pass not ok');
            
        }

    } else {
        res.json('not found');
    }
});

app.listen(4000, () => {
    console.log('Server running on port 4000');
});
//4rnSjU3xjQOjyNld
