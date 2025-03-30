const express = require('express');
const cors = require('cors');
const mongoose = require("mongoose");
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('./models/User.js');
const Place = require('./models/Place.js');
const Booking = require('./models/Booking.js');
const Image = require('./models/Image.js');
const Review = require('./models/Review.js');
const cookieParser = require('cookie-parser');
const imageDownloader = require('image-downloader');
// const {S3Client, PutObjectCommand} = require('@aws-sdk/client-s3');
const multer = require('multer');
const fs = require('fs');
const mime = require('mime-types');
const axios = require('axios');
const path = require('path');

require('dotenv').config();
const app = express();

const bcryptSalt = bcrypt.genSaltSync(10);
const jwtSecret = 'fasefraw4r5r3wq45wdfgw34twdfg';
const bucket = 'dawid-booking-app';

app.use(express.json());
app.use(cookieParser());

// Ensure uploads directory exists
if (!fs.existsSync(path.join(__dirname, 'uploads'))) {
  fs.mkdirSync(path.join(__dirname, 'uploads'), { recursive: true });
  console.log('Created uploads directory');
}

// Log the uploads directory path for debugging
console.log('Uploads directory path:', path.join(__dirname, 'uploads'));

// Serve static files from uploads directory
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.use(cors({
  credentials: true,
  origin: ['http://127.0.0.1:5173', 'http://localhost:5173', 'http://localhost:3000', 'http://127.0.0.1:3000', 'http://localhost:5000', 'http://127.0.0.1:5000'],
}));

// async function uploadToS3(path, originalFilename, mimetype) {
//   const client = new S3Client({
//     region: 'us-east-1',
//     credentials: {
//       accessKeyId: process.env.S3_ACCESS_KEY,
//       secretAccessKey: process.env.S3_SECRET_ACCESS_KEY,
//     },
//   });
//   const parts = originalFilename.split('.');
//   const ext = parts[parts.length - 1];
//   const newFilename = Date.now() + '.' + ext;
//   await client.send(new PutObjectCommand({
//     Bucket: bucket,
//     Body: fs.readFileSync(path),
//     Key: newFilename,
//     ContentType: mimetype,
//     ACL: 'public-read',
//   }));
//   return `https://${bucket}.s3.amazonaws.com/${newFilename}`;
// }


function getUserDataFromReq(req) {
  return new Promise((resolve, reject) => {
    jwt.verify(req.cookies.token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      resolve(userData);
    });
  });
}

app.get('/api/test', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json('test ok');
});

app.post('/api/register', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {name,email,password} = req.body;

  try {
    const userDoc = await User.create({
      name,
      email,
      password:bcrypt.hashSync(password, bcryptSalt),
    });
    res.json(userDoc);
  } catch (e) {
    res.status(422).json(e);
  }

});

app.post('/api/login', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {email,password} = req.body;
  const userDoc = await User.findOne({email});
  if (userDoc) {
    const passOk = bcrypt.compareSync(password, userDoc.password);
    if (passOk) {
      jwt.sign({
        email:userDoc.email,
        id:userDoc._id
      }, jwtSecret, {}, (err,token) => {
        if (err) throw err;
        res.cookie('token', token).json(userDoc);
      });
    } else {
      res.status(422).json('pass not ok');
    }
  } else {
    res.json('not found');
  }
});

app.get('/api/profile', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  if (token) {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      const {name,email,_id} = await User.findById(userData.id);
      res.json({name,email,_id});
    });
  } else {
    res.json(null);
  }
});

app.post('/api/logout', (req, res) => {
  res.cookie('token', '', { 
    httpOnly: true, 
    expires: new Date(0), // Expire the cookie immediately
    sameSite: 'strict', // Optional: To prevent CSRF attacks
    secure: process.env.NODE_ENV === 'production' // Use secure flag in production
  }).json({ success: true });
});


// app.post('/api/upload-by-link', async (req, res) => {
//   const { link } = req.body;
//   const newName = 'photo' + Date.now() + '.jpg'; // Generate a unique file name
//   const filePath = path.join(__dirname, 'tmp', newName); // Save the file in the 'tmp' folder

//   try {
//     // Fetch the image data from the link using Axios
//     const response = await axios({
//       url: link,
//       responseType: 'stream',
//     });

//     // Create a write stream to save the file locally in the '/tmp' directory
//     const writer = fs.createWriteStream(filePath);

//     // Pipe the image data into the file
//     response.data.pipe(writer);

//     // Wait for the file to finish writing
//     writer.on('finish', () => {
//       // Respond with the file path of the saved image
//       res.json({ message: 'Image saved successfully', path: filePath });
//     });

//     writer.on('error', (error) => {
//       throw error;
//     });
//   } catch (error) {
//     console.error(error);
//     res.status(422).json({ message: 'Failed to download and save image', error: error.message });
//   }
// });
app.post('/api/upload-by-link', async (req, res) => {
  const { link } = req.body;
  const newName = 'photo' + Date.now() + '.jpg'; // Generate a unique file name
  const filePath = path.join(__dirname, 'uploads', newName); // Save the file in the 'uploads' folder

  try {
    console.log('Attempting to download image from:', link);
    
    // Create a placeholder image if the download fails or link is invalid
    if (!link || !link.startsWith('http')) {
      console.log('Invalid link, creating placeholder');
      
      // Create a basic text file as placeholder (could be a 1x1 pixel image in production)
      fs.writeFileSync(filePath, 'Test placeholder image');
      console.log('Created placeholder at:', filePath);
      
      res.json(newName);
      return;
    }
    
    const response = await axios({
      url: link,
      responseType: 'stream',
      timeout: 5000 // 5 second timeout
    });

    // Save the image locally in the 'uploads' folder
    const writer = fs.createWriteStream(filePath);
    response.data.pipe(writer);

    writer.on('finish', () => {
      console.log('Image saved successfully at:', filePath);
      res.json(newName);
    });

    writer.on('error', (error) => {
      console.error('Error writing file:', error);
      // Create a placeholder image
      fs.writeFileSync(filePath, 'Test placeholder image');
      res.json(newName);
    });
  } catch (error) {
    console.error('Error downloading image:', error.message);
    
    // Create a placeholder image
    fs.writeFileSync(filePath, 'Test placeholder image');
    console.log('Created placeholder at:', filePath);
    
    res.json(newName);
  }
});


// const photosMiddleware = multer({dest:'/tmp'});
// app.post('/api/upload', photosMiddleware.array('photos', 100), async (req,res) => {
//   const uploadedFiles = [];
//   for (let i = 0; i < req.files.length; i++) {
//     const {path,originalname,mimetype} = req.files[i];
//     const url = await uploadToS3(path, originalname, mimetype);
//     uploadedFiles.push(url);
//   }
//   res.json(uploadedFiles);
// });
const photosMiddleware = multer({dest: 'uploads/'});

app.post('/api/upload', photosMiddleware.array('photos', 100), async (req, res) => {
  console.log('Upload request received with', req.files?.length || 0, 'files');
  const uploadedFiles = [];
  
  try {
    if (!req.files || req.files.length === 0) {
      console.log('No files in request, creating placeholder');
      const newName = `placeholder-${Date.now()}.txt`;
      const newFilePath = path.join(__dirname, 'uploads', newName);
      
      fs.writeFileSync(newFilePath, 'Placeholder file');
      console.log('Created placeholder at:', newFilePath);
      
      uploadedFiles.push(newName);
      res.json(uploadedFiles);
      return;
    }
    
    for (let i = 0; i < req.files.length; i++) {
      const { path: filePath, originalname } = req.files[i];
      console.log(`Processing file ${i+1}/${req.files.length}: ${originalname}`);
      
      const ext = originalname.split('.').pop(); // Extract file extension
      const newName = `${Date.now()}-${i}.${ext}`; // Generate a new filename
      const newFilePath = path.join(__dirname, 'uploads', newName);

      try {
        fs.renameSync(filePath, newFilePath); // Move the file to 'uploads' folder
        console.log('File saved as:', newName);
      } catch (err) {
        console.error('Error moving file:', err);
        // Create a placeholder if rename fails
        fs.writeFileSync(newFilePath, 'Placeholder for failed file');
      }
      
      uploadedFiles.push(newName);
    }

    console.log('Upload complete, returning filenames:', uploadedFiles);
    res.json(uploadedFiles);
  } catch (error) {
    console.error('Error in upload handler:', error);
    // Return any files we processed successfully or a placeholder
    if (uploadedFiles.length === 0) {
      const newName = `error-${Date.now()}.txt`;
      const newFilePath = path.join(__dirname, 'uploads', newName);
      fs.writeFileSync(newFilePath, 'Error placeholder');
      uploadedFiles.push(newName);
    }
    res.json(uploadedFiles);
  }
});



app.post('/api/places', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    title,address,addedPhotos,description,price,
    perks,extraInfo,checkIn,checkOut,maxGuests,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.create({
      owner:userData.id,price,
      title,address,photos:addedPhotos,description,
      perks,extraInfo,checkIn,checkOut,maxGuests,
    });
    res.json(placeDoc);
  });
});

app.get('/api/user-places', (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    const {id} = userData;
    res.json( await Place.find({owner:id}) );
  });
});

app.get('/api/places/:id', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {id} = req.params;
  res.json(await Place.findById(id));
});

app.put('/api/places', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {
    id, title,address,addedPhotos,description,
    perks,extraInfo,checkIn,checkOut,maxGuests,price,
  } = req.body;
  jwt.verify(token, jwtSecret, {}, async (err, userData) => {
    if (err) throw err;
    const placeDoc = await Place.findById(id);
    if (userData.id === placeDoc.owner.toString()) {
      placeDoc.set({
        title,address,photos:addedPhotos,description,
        perks,extraInfo,checkIn,checkOut,maxGuests,price,
      });
      await placeDoc.save();
      res.json('ok');
    }
  });
});

app.delete('/api/places/:id', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const {token} = req.cookies;
  const {id} = req.params;
  
  try {
    jwt.verify(token, jwtSecret, {}, async (err, userData) => {
      if (err) throw err;
      
      const placeDoc = await Place.findById(id);
      if (!placeDoc) {
        return res.status(404).json({ error: 'Listing not found' });
      }
      
      // Check if the user is the owner of the place
      if (userData.id === placeDoc.owner.toString()) {
        await Place.findByIdAndDelete(id);
        return res.json({ message: 'Listing deleted successfully' });
      } else {
        return res.status(403).json({ error: 'Not authorized to delete this listing' });
      }
    });
  } catch (error) {
    console.error('Error deleting place:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.get('/api/places', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  res.json( await Place.find() );
});

app.post('/api/bookings', async (req, res) => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    const userData = await getUserDataFromReq(req);
    const {
      place, checkIn, checkOut, numberOfGuests, name, phone, price,
    } = req.body;

    // Validate required fields
    if (!place || !checkIn || !checkOut || !phone) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        details: {
          place: !place ? 'Place is required' : null,
          checkIn: !checkIn ? 'Check-in date is required' : null,
          checkOut: !checkOut ? 'Check-out date is required' : null,
          phone: !phone ? 'Phone number is required' : null
        }
      });
    }

    // Create the booking with payment status
    const bookingDoc = await Booking.create({
      place,
      checkIn,
      checkOut,
      numberOfGuests,
      name,
      phone,
      price,
      user: userData.id,
      paymentStatus: 'completed', // We're assuming payment was successful 
      paymentDate: new Date(),
    });
    
    res.json(bookingDoc);
  } catch (err) {
    console.error('Error creating booking:', err);
    res.status(500).json({ 
      error: 'Failed to create booking', 
      message: err.message 
    });
  }
});

// Update payment status for a booking
app.put('/api/bookings/:id/payment', async (req, res) => {
  try {
    mongoose.connect(process.env.MONGO_URL);
    const { id } = req.params;
    const { paymentStatus, paymentMethod } = req.body;
    const userData = await getUserDataFromReq(req);
    
    // Find the booking
    const booking = await Booking.findById(id);
    
    // Check if booking exists and belongs to the user
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    
    if (booking.user.toString() !== userData.id) {
      return res.status(403).json({ error: 'Not authorized to update this booking' });
    }
    
    // Update payment information
    booking.paymentStatus = paymentStatus || booking.paymentStatus;
    booking.paymentMethod = paymentMethod || booking.paymentMethod;
    
    if (paymentStatus === 'completed') {
      booking.paymentDate = new Date();
    }
    
    await booking.save();
    
    res.json(booking);
  } catch (err) {
    console.error('Error updating payment status:', err);
    res.status(500).json({ error: 'Failed to update payment status' });
  }
});

app.get('/api/bookings', async (req,res) => {
  mongoose.connect(process.env.MONGO_URL);
  const userData = await getUserDataFromReq(req);
  res.json( await Booking.find({user:userData.id}).populate('place') );
});

app.get('/api/random-image', (req, res) => {
  const uploadsDir = path.join(__dirname, 'uploads');
  
  try {
    // Read all files in the uploads directory
    fs.readdir(uploadsDir, (err, files) => {
      if (err) {
        console.error('Error reading uploads directory:', err);
        return res.status(500).json({ error: 'Failed to read uploads directory' });
      }

      // Filter out non-image files (exclude text files and other non-image files)
      const imageFiles = files.filter(file => {
        const ext = path.extname(file).toLowerCase();
        return ['.jpg', '.jpeg', '.png', '.gif', '.webp', '.avif'].includes(ext);
      });

      if (imageFiles.length === 0) {
        return res.status(404).json({ error: 'No images found in uploads directory' });
      }

      // Select a random image
      const randomIndex = Math.floor(Math.random() * imageFiles.length);
      const randomImage = imageFiles[randomIndex];
      
      // Return the random image filename
      res.json({ image: randomImage });
    });
  } catch (error) {
    console.error('Error in random-image endpoint:', error);
    res.status(500).json({ error: 'Server error' });
  }
});

app.listen(4000, () => {
  console.log("Server running on port 4000");
});

// Review endpoints
app.post('/api/reviews', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  try {
    const userData = await getUserDataFromReq(req);
    const { place, rating, comment = '' } = req.body;
    
    // Create the review
    const reviewDoc = await Review.create({
      place,
      user: userData.id,
      rating,
      comment
    });
    
    // Return the review with user information
    res.json(await Review.findById(reviewDoc._id).populate('user'));
  } catch (error) {
    console.error('Error creating review:', error);
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Get reviews for a place
app.get('/api/places/:id/reviews', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  try {
    const { id } = req.params;
    const reviews = await Review.find({ place: id })
      .populate('user')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get average rating for a place
app.get('/api/places/:id/rating', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  try {
    const { id } = req.params;
    const reviews = await Review.find({ place: id });
    
    if (reviews.length === 0) {
      return res.json({ averageRating: 0, count: 0 });
    }
    
    const sum = reviews.reduce((total, review) => total + review.rating, 0);
    const averageRating = sum / reviews.length;
    
    res.json({ 
      averageRating: Math.round(averageRating * 10) / 10, // Round to 1 decimal place
      count: reviews.length 
    });
  } catch (error) {
    console.error('Error fetching average rating:', error);
    res.status(500).json({ error: 'Failed to fetch average rating' });
  }
});

// Create a default review for places with no reviews
app.post('/api/places/default-review', async (req, res) => {
  mongoose.connect(process.env.MONGO_URL);
  try {
    const { placeId } = req.body;
    
    // Check if the place exists
    const place = await Place.findById(placeId);
    if (!place) {
      return res.status(404).json({ error: 'Place not found' });
    }
    
    // Check if the place already has reviews
    const existingReviews = await Review.find({ place: placeId });
    if (existingReviews.length > 0) {
      return res.json({ message: 'Place already has reviews', count: existingReviews.length });
    }
    
    // Find or create a default reviewer
    let defaultReviewer = await User.findOne({ email: 'system@example.com' });
    if (!defaultReviewer) {
      defaultReviewer = await User.create({
        name: 'System Reviewer',
        email: 'system@example.com',
        password: bcrypt.hashSync('securePassword123', bcryptSalt),
      });
    }
    
    // Generate a random rating between 4 and 5
    const rating = Math.floor(Math.random() * 2) + 4;
    
    // Create a default review
    const review = await Review.create({
      place: placeId,
      user: defaultReviewer._id,
      rating,
      comment: '',
    });
    
    res.json({ success: true, review });
  } catch (error) {
    console.error('Error creating default review:', error);
    res.status(500).json({ error: 'Failed to create default review' });
  }
});

