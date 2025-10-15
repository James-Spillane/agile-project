const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const bodyParser = require('body-parser'); // middleware - useful for post, parse of incoming http requests
const indexRoutes = require('./routes/index');
const bookingRoutes = require('./routes/booking');
const booking = require('./models/booking'); 
const PORT = 3000;
const app = express(); 

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/trainingsessions')
    .then(() => console.log("Connected to MongoDB"))
    .catch(err => { 
        console.error("MongoDB connection error:", err);
    });

// Middleware setup
app.use(express.static('public'));  
app.set('view engine', 'ejs'); // Set the view engine to EJS
app.set('views', path.join(__dirname, 'views'));  // Set views folder
app.use(express.urlencoded({ extended: true }));  // Parse incoming request bodies

app.use('/', indexRoutes);  //homepage and about
app.use('/', bookingRoutes); //booking managing

const session = require('express-session');

app.use(session({
  secret: 'yourSecretKey',
  resave: false,
  saveUninitialized: true
}));



app.get('/', (req, res) => {
    res.render('book', { title: 'Create a New Booking' });
});
// this route handles form submission
app.post('/book', async (req, res) => {
    const { name, userId, dateTime, cardNumber, expiry, securityCode } = req.body;
    if (!dateTime) {
        return res.status(400).send('DateTime is required');
    }
    const newBooking = new booking({
        name,
        userId,
        dateTime,
        cardDetails: {
            cardNumber,
            expiry,
            securityCode
        },
        createdAt: new Date()
    });
    await newBooking.save();
    res.redirect('/view'); // Redirect to the bookings page after saving
});
// Delete Booking R
app.post('/delete/:id', async (req, res) => {
    const { id } = req.params; // route parameters w/ named url path
    booking.findByIdAndDelete(id)
        .then(() => res.redirect('/'))
        .catch((err) => {
            console.error('Error deleting booking:', err);
            res.status(500).send('Error deleting booking');
        });
});

// Modify Booking 
app.get('/modify/:id', async (req, res) => {
    const { id } = req.params;
    booking.findById(id)
        .then((booking) => {
            res.render('modify', { booking });
        })
        .catch((err) => {
            console.error('Error finding booking:', err);
            res.status(500).send('Error retrieving booking');
        });
});

// Update Booking 
app.post('/update/:id', (req, res) => {
    const { id } = req.params;
    const { name, userId, dateTime, cardNumber, expiry, expiryDate, securityCode } = req.body;

    // Prepare the updated data
    const updatedData = {
        name,
        userId,
        dateTime,
        cardDetails: {
            cardNumber,
            expiry: expiryDate, // assuming expiryDate corresponds to "expiry"
            securityCode
        }
    };

    // Update the booking in the database
    booking.findByIdAndUpdate(id, updatedData, { new: true })
        .then((updatedBooking) => {
            if (updatedBooking) {
                // Successfully updated, redirect to the homepage
                res.redirect('/');
            } else { //otherwise
                res.status(404).send('Booking not found.');
            }
        })
        .catch((err) => {
            console.error('Error updating booking:', err);
            res.status(500).send('Error updating booking');
        });
});

// app.get('/display', (req, res) => {
//     const bookings = [
//         {  name: booking.name, userId: booking.userId },
//         // Add more bookings as needed
//     ];
//     res.render('display', { title: 'All Bookings', bookings: bookings });
// });


// Report Route: Number of times a user attended sessions between two dates
app.get('/report', async (req, res) => {
    const { startDate, endDate, userId } = req.query; 

    // process parameters
    console.log('Start Date:', startDate);
    console.log('End Date:', endDate);
    console.log('User ID:', userId);

   //establish
    const start = new Date(startDate);
    const end = new Date(endDate);
    console.log('Start:', start);
    console.log('End:', end);

    // specified date range for the given user
    //.find - finds document for mongoose, withe bookingschema
    const bookings = await booking.find({
        userId,
        dateTime: { $gte: start, $lte: end } //
    });
//greater than or equal to , datetimne is in a specific range

    console.log('Bookings:', bookings);  // Log the found bookings

    // Render the report with the bookings data
    res.render('report', { bookings, userId, startDate, endDate});
});


app.get('/view', async (req, res) => {
    try {
        const bookings = await booking.find();
        res.render('index', { bookings }); // Render the bookings page
    } catch (error) {
        console.error('Error retrieving bookings:', error);
        res.status(500).send('Error retrieving bookings');
    }
});
app.use(express.json());

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
});
