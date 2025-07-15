// server/controllers/issController.js
const fetch = require('node-fetch');
const User = require('../models/User');
const { sendEmail } = require('../utils/emailService');

// Fetch current ISS position
exports.getCurrentIssPosition = async (req, res) => {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json();
    if (data.message === 'success') {
      // In a real app, you might add reverse geocoding here
      // Example: const geoResponse = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${data.iss_position.latitude}&lon=${data.iss_position.longitude}`);
      // const geoData = await geoResponse.json();
      // const country = geoData.address.country || 'Not available';
      // const state = geoData.address.state || 'Not available';

      res.json({
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        // Placeholder for velocity and altitude as Open-Notify doesn't provide it directly
        // You'd need another API or calculation for these
        velocity: 27571.37, // Example value
        altitude: 420.01,   // Example value
        country: 'Not available', // Placeholder
        state: 'Not available'    // Placeholder
      });
    } else {
      res.status(500).json({ message: 'Failed to fetch ISS data from external API' });
    }
  } catch (error) {
    console.error('Error fetching ISS position:', error);
    res.status(500).json({ message: 'Server error fetching ISS position', error: error.message });
  }
};

// Register or update user location for alerts
exports.setUserLocation = async (req, res) => {
  const { email, latitude, longitude } = req.body;

  if (!email || !latitude || !longitude) {
    return res.status(400).json({ message: 'Please provide email, latitude, and longitude.' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      // Update existing user
      user.latitude = latitude;
      user.longitude = longitude;
      user.alertEnabled = true; // Re-enable if they submit again
      await user.save();
      res.status(200).json({ message: 'Your alert preferences have been updated successfully!', user });
    } else {
      // Create new user
      user = new User({ email, latitude, longitude });
      await user.save();
      res.status(201).json({ message: 'Alerts enabled for your location!', user });
    }
  } catch (error) {
    console.error('Error setting user location:', error);
    if (error.code === 11000) { // Duplicate key error (email unique constraint)
      return res.status(409).json({ message: 'This email is already registered.' });
    }
    res.status(500).json({ message: 'Server error setting user location', error: error.message });
  }
};

// Function to check for ISS passes and send alerts
exports.checkAndSendAlerts = async () => {
  console.log('Running ISS alert check...');
  try {
    const users = await User.find({ alertEnabled: true });

    for (const user of users) {
      const { email, latitude, longitude, lastAlertSent } = user;

      // Check if an alert was sent recently (e.g., within the last 6 hours)
      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      if (lastAlertSent && lastAlertSent > sixHoursAgo) {
        console.log(`Skipping alert for ${email}, recently sent.`);
        continue;
      }

      try {
        const passResponse = await fetch(`http://api.open-notify.org/iss-pass.json?lat=${latitude}&lon=${longitude}&n=1`);
        const passData = await passResponse.json();

        if (passData.message === 'success' && passData.response.length > 0) {
          const nextPass = passData.response[0];
          const passTime = new Date(nextPass.risetime * 1000); // Convert Unix timestamp to Date
          const duration = nextPass.duration; // Duration in seconds

          // Check if the pass is within the next 2 hours (e.g.)
          const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

          if (passTime > new Date() && passTime < twoHoursFromNow) {
            const subject = 'ISS Sighting Alert!';
            const text = `The International Space Station will be visible from your location (${latitude}, ${longitude}) at ${passTime.toLocaleString()} for approximately ${Math.round(duration / 60)} minutes. Look up!`;

            await sendEmail(email, subject, text);
            console.log(`Alert sent to ${email} for ISS sighting at ${passTime.toLocaleString()}`);

            // Update lastAlertSent timestamp
            user.lastAlertSent = new Date();
            await user.save();
          } else {
            console.log(`No imminent ISS pass for ${email} within the next 2 hours.`);
          }
        } else {
          console.log(`No ISS pass data found for ${email} or API error.`);
        }
      } catch (passError) {
        console.error(`Error checking ISS pass for ${email}:`, passError);
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendAlerts:', error);
  }
};