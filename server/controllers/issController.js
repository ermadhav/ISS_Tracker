// server/controllers/issController.js
import fetch from 'node-fetch'; // ✅ Only this, no require
import User from '../models/User.js'; // ✅ Must include .js extension
import { sendEmail } from '../utils/emailService.js'; // ✅ Include extension

// Fetch current ISS position
export async function getCurrentIssPosition(req, res) {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json();

    if (data.message === 'success') {
      res.json({
        latitude: parseFloat(data.iss_position.latitude),
        longitude: parseFloat(data.iss_position.longitude),
        velocity: 27571.37, // Example placeholder
        altitude: 420.01,   // Example placeholder
        country: 'Not available',
        state: 'Not available'
      });
    } else {
      res.status(500).json({ message: 'Failed to fetch ISS data from external API' });
    }
  } catch (error) {
    console.error('Error fetching ISS position:', error);
    res.status(500).json({ message: 'Server error fetching ISS position', error: error.message });
  }
}

// Register or update user location for alerts
export async function setUserLocation(req, res) {
  const { email, latitude, longitude } = req.body;

  if (!email || !latitude || !longitude) {
    return res.status(400).json({ message: 'Please provide email, latitude, and longitude.' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.latitude = latitude;
      user.longitude = longitude;
      user.alertEnabled = true;
      await user.save();
      res.status(200).json({ message: 'Your alert preferences have been updated successfully!', user });
    } else {
      user = new User({ email, latitude, longitude });
      await user.save();
      res.status(201).json({ message: 'Alerts enabled for your location!', user });
    }
  } catch (error) {
    console.error('Error setting user location:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }
    res.status(500).json({ message: 'Server error setting user location', error: error.message });
  }
}

// Function to check for ISS passes and send alerts
export async function checkAndSendAlerts() {
  console.log('Running ISS alert check...');
  try {
    const users = await User.find({ alertEnabled: true });

    for (const user of users) {
      const { email, latitude, longitude, lastAlertSent } = user;

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
          const passTime = new Date(nextPass.risetime * 1000);
          const duration = nextPass.duration;

          const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

          if (passTime > new Date() && passTime < twoHoursFromNow) {
            const subject = 'ISS Sighting Alert!';
            const text = `The ISS will be visible from your location (${latitude}, ${longitude}) at ${passTime.toLocaleString()} for approximately ${Math.round(duration / 60)} minutes.`;

            await sendEmail(email, subject, text);
            console.log(`Alert sent to ${email} for ISS sighting at ${passTime.toLocaleString()}`);

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
}
