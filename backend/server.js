const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();
mongoose.set('bufferCommands', false); // Global disable

const app = express();
app.use(cors());
app.use(express.json());

const PORT = process.env.PORT || 5000;

// Routes
const apiRoutes = require('./routes/api');
app.use('/api', apiRoutes);

mongoose.connect(process.env.MONGO_URI, { serverSelectionTimeoutMS: 5000 })
  .then(() => {
    console.log('Connected to MongoDB');
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  })
  .catch(err => {
    console.warn('Could not connect to MongoDB. Starting in MOCK mode.');
    console.error('Error:', err.message);
    app.listen(PORT, () => console.log(`Server running on port ${PORT} (MOCK MODE)`));
  });
