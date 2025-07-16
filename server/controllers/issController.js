import fetch from 'node-fetch';
import User from '../models/User.js';
import { sendEmail } from '../utils/emailService.js';
import dotenv from 'dotenv';
dotenv.config();

export const getCurrentIssPosition = async (req, res) => {
  try {
    const response = await fetch('http://api.open-notify.org/iss-now.json');
    const data = await response.json();

    if (data.message !== 'success') {
      return res.status(500).json({ message: 'Failed to fetch ISS data from external API' });
    }

    const latitude = parseFloat(data.iss_position.latitude);
    const longitude = parseFloat(data.iss_position.longitude);

    // Reverse Geocoding with OpenCage
    const geoResponse = await fetch(
      `https://api.opencagedata.com/geocode/v1/json?q=${latitude}+${longitude}&key=${process.env.OPENCAGE_API_KEY}`
    );
    const geoData = await geoResponse.json();

    let country = 'Not available';
    let state = 'Not available';

    if (
      geoData &&
      geoData.results &&
      geoData.results.length > 0 &&
      geoData.results[0].components
    ) {
      const components = geoData.results[0].components;
      country = components.country || 'Not available';
      state = components.state || components.region || 'Not available';
    }

    res.json({
      latitude,
      longitude,
      velocity: 27571.37, // still static
      altitude: 420.01,   // still static
      country,
      state
    });

  } catch (error) {
    console.error('Error fetching ISS position:', error);
    res.status(500).json({ message: 'Server error fetching ISS position', error: error.message });
  }
};

// Register or update user location for alerts
export const setUserLocation = async (req, res) => {
  const { email, latitude, longitude } = req.body;

  if (!email || latitude === undefined || longitude === undefined) {
    return res.status(400).json({ message: 'Please provide email, latitude, and longitude.' });
  }

  try {
    let user = await User.findOne({ email });

    if (user) {
      user.latitude = latitude;
      user.longitude = longitude;
      user.alertEnabled = true; // Re-enable if they submit again
      await user.save();
      return res.status(200).json({ message: 'Your alert preferences have been updated successfully!', user });
    } else {
      user = new User({ email, latitude, longitude });
      await user.save();
      return res.status(201).json({ message: 'Alerts enabled for your location!', user });
    }
  } catch (error) {
    console.error('Error setting user location:', error);
    if (error.code === 11000) {
      return res.status(409).json({ message: 'This email is already registered.' });
    }
    res.status(500).json({ message: 'Server error setting user location', error: error.message });
  }
};

// Function to check for ISS passes and send alerts using wheretheiss.at API
export const checkAndSendAlerts = async () => {
  console.log('Running ISS alert check...');
  try {
    const users = await User.find({ alertEnabled: true });

    for (const user of users) {
      const { email, latitude, longitude, lastAlertSent } = user;

      const sixHoursAgo = new Date(Date.now() - 6 * 60 * 60 * 1000);
      if (lastAlertSent && lastAlertSent.getTime() > sixHoursAgo.getTime()) {
        console.log(`Skipping alert for ${email}, alert sent recently.`);
        continue;
      }

      try {
        const passResponse = await fetch(`https://api.wheretheiss.at/v1/satellites/25544/passes?lat=${latitude}&lon=${longitude}&n=1`);
        
        if (!passResponse.ok) {
          const text = await passResponse.text();
          console.error(`API error for ${email}:`, text);
          continue;
        }

        const passData = await passResponse.json();

        if (Array.isArray(passData) && passData.length > 0) {
          const nextPass = passData[0];
          const passTime = new Date(nextPass.risetime * 1000);
          const duration = nextPass.duration;

          const twoHoursFromNow = new Date(Date.now() + 2 * 60 * 60 * 1000);

          if (passTime > new Date() && passTime < twoHoursFromNow) {
            const subject = 'ISS Sighting Alert!';
            const text = `The International Space Station will be visible from your location (${latitude}, ${longitude}) at ${passTime.toLocaleString()} for approximately ${Math.round(duration / 60)} minutes. Look up!`;

            await sendEmail(email, subject, text);
            console.log(`Alert sent to ${email} for ISS sighting at ${passTime.toLocaleString()}`);

            user.lastAlertSent = new Date();
            await user.save();
          } else {
            console.log(`No imminent ISS pass for ${email} within the next 2 hours.`);
          }
        } else {
          console.log(`No ISS pass data for ${email}.`);
        }
      } catch (passError) {
        console.error(`Error checking ISS pass for ${email}:`, passError);
      }
    }
  } catch (error) {
    console.error('Error in checkAndSendAlerts:', error);
  }
};
