import express from 'express';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Ticket from './models/Ticket.js';

// Load variables from the .env file [cite: 89]
dotenv.config();

const app = express();

// Middleware to parse form data and JSON [cite: 87, 88]
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

// Set the view engine to EJS so Express knows how to render our HTML templates [cite: 26, 88]
app.set('view engine', 'ejs');
app.set('views', './views');

// Connect to MongoDB using the URI from our .env file [cite: 23, 88]
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost/tickets')
  .then(() => console.log('Connected to MongoDB'))
  .catch(err => console.error('DB connection error:', err));

// --- Application Routes ---

// 1. Show the "Create Ticket" form [cite: 36]
app.get('/tickets/new', (req, res) => {
    res.render('new-ticket');
});

// 2. Handle form submission to create a new ticket [cite: 37]
app.post('/tickets', async (req, res) => {
  const { employeeName, title, description, priority } = req.body;
  const ticket = new Ticket({ employeeName, title, description, priority });
  await ticket.save(); // Save to database [cite: 38]
  res.redirect('/tickets'); // Redirect to the list page [cite: 38, 49]
});

// 3. Show the "View Tickets" page with all tickets [cite: 39]
app.get('/tickets', async (req, res) => {
  const tickets = await Ticket.find().sort({ createdAt: -1 }); // Fetch tickets [cite: 39, 101]
  res.render('tickets-list', { tickets }); // Render the table [cite: 39, 101]
});

// 4. Handle updating a ticket's status [cite: 40]
app.post('/tickets/:id/update', async (req, res) => {
  const id = req.params.id;
  const newStatus = req.body.status;
  await Ticket.findByIdAndUpdate(id, { status: newStatus }); // Update in DB [cite: 42, 105]
  res.redirect('/tickets'); // Refresh the list [cite: 42, 49]
});

// 5. Handle deleting a ticket [cite: 43]
app.post('/tickets/:id/delete', async (req, res) => {
  await Ticket.findByIdAndDelete(req.params.id); // Remove from DB [cite: 44, 109]
  res.redirect('/tickets'); // Refresh the list [cite: 44, 49]
});
// Default route - automatically redirect to the tickets dashboard
app.get('/', (req, res) => {
    res.redirect('/tickets');
});
// Start the Server [cite: 88]
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server listening on port ${PORT}`));