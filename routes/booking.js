const express = require('express');
const Booking = require('../models/booking');
const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const bookings = await Booking.find();
    res.render('book', {
      title: 'Create a New Booking',
      bookings
    });
  } catch (err) {
    console.error('Error retrieving bookings:', err);
    res.render('book', {
      title: 'Create a New Booking',
      bookings: []
    });
  }
});




router.get('/screen-time', (req, res) => {
  if (!req.session.startTime) {
    req.session.startTime = Date.now();
  }

  const now = Date.now();
  const totalTime = Math.floor((now - req.session.startTime) / 1000);

  res.render('section-dashboard/screen-time', {
    title: 'Screen Time Insights',
    stats: {
      ageGroup: '18–24',
      averageHours: 9,
      topApps: ['TikTok', 'Instagram', 'YouTube']
    },
    totalTime,
    recommendations: [
      'Go for a walk without your phone',
      'Try a 30-minute journaling challenge',
      'Read a chapter of a physical book',
      'Host a no-phone dinner with friends'
    ]
  });
});


// router.get('/screen-time', (req, res) => {
  // res.render('screen-time', {
   // title: 'Screen Time Insights',
    // stats: {
     // ageGroup: '18–24',
     // averageHours: 9,
     // topApps: ['TikTok', 'Instagram', 'YouTube'],
    //},
    //recommendations: [
      //'Go for a walk without your phone',
     // 'Try a 30-minute journaling challenge',
     // 'Read one chapter of a physical book',
     // 'Host a no-phone dinner with friends',
   // ]
 // });
//});


// About Page
router.get('/about', (req, res) => {
    res.render('about');
});
router.get('/dashboard', (req, res) => {
  if (!req.session.userId) {
    return res.redirect('/login');
  }

  res.render('dashboard', { email: req.session.email });
});
router.get('/logout', (req, res) => {
  req.session.destroy(() => {
    res.redirect('/login');
  });
});

// Help Page
router.get('/help', (req, res) => {
    res.render('help');
});
router.post('/book', async (req, res) => {
  // form submission logic
});

router.post('/update/:id', (req, res) => {
    const { id } = req.params; //take out id  from route parameter - for url (modify)
    const { name, userId, dateTime, cardNumber, expiryDate, securityCode } = req.body;

    // Prepare the updated data (Outlay)
    const updatedData = {
        name,
        userId,
        dateTime,
        cardDetails: {
            cardNumber,
            expiryDate, 
            securityCode,
        }
    };

    // Update the booking in the database
    Booking.findByIdAndUpdate(id, updatedData, { new: true })
        .then((updatedBooking) => {
            if (updatedBooking) {
                //once updated redirected to the homepage
                res.redirect('/');
            } else {
                res.status(404).send('Booking not found.');
            }
        })
        .catch((err) => {
            console.error('Error updating booking:', err);
            res.status(500).send('Error updating booking');
        });
});


// delete a booking
router.post('/delete/:id', async (req, res) => {
    const { id } = req.params;
    await Booking.findByIdAndDelete(id)
    .catch(err => {
        return res.status(500).send('Error deleting booking');
    });
    res.redirect('/'); // redirects to the booking with all the listing
});
router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  // Replace this with real user lookup logic
  if (email === "test@example.com" && password === "1234") {
    req.session.userId = "testUser";
    return res.redirect("/dashboard");
  }

  res.status(401).send("Invalid credentials");
});
res.render("bookings/book", {
    error: "Invalid credentials",
    session: req.session
  });


// Modify Booking 
router.get('/modify/:id', async (req, res) => {
    const { id } = req.params;
    const booking = await Booking.findById(id)
    .catch(err => {
        return res.status(500).send('Error retrieving booking');
    });
    res.render('modify', { booking });
});

module.exports = router;
