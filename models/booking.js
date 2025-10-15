const mongoose = require('mongoose');
const Schema = mongoose.Schema;


// Define the schema for the booking
const bookingSchema = new mongoose.Schema({
    name: { 
        type: String, 
        required: true 
    },
    userId: { 
        type: String, 
        required: true, 
        minlength: 10, 
        maxlength: 10 
    },
    dateTime: { 
        type: Date, 
        required: true,
        default: Date.now 
    },
    cardDetails: {
        cardNumber: { 
            type: String, 
            required: true,
          
        },
        expiry: { 
            type: String, 
            required: true
        },
        securityCode: { 
            type: String, 
            required: true,
            minlength: 3, 
            maxlength: 3  
        }
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    }  // Default to the current date
});


// Create the model using the schema
const Booking = mongoose.model('Booking', bookingSchema); // Booking model created using the schema
// const newBooking = mongoose.model('Booking', bookingSchema); // Booking model created using the schema
//gets information from the database and displays it

// the Function to submit multiple user bookings
async function submitBookings(booking) {
    const bookings = await Booking.insertMany(booking);
    console.log('Bookings saved successfully:', booking);
}

// Function to fetch and display all bookings
async function fetchBookings() {
    const bookings = await Booking.find();
    console.log('List of all bookings:', bookings);
}

// Main function to connect to DB, submit and fetch bookings
async function main() {
    await connectToDatabase();  // Connect to MongoDB
    
    // Submit multiple bookings
    await submitBookings(booking);
    
    // Fetch and display all bookings
    await fetchBookings();
}

// Export the Booking model so it can be used in other files
module.exports = Booking;
