const fetch = require("node-fetch");

// In-memory store for the last known location of a user (by email)
const userLocationHistory = {};
const DISTANCE_THRESHOLD_KM = 20; // Using your requested 20km threshold
const IPINFO_TOKEN = "c109c54d49aa0d"; // Your provided token

// Get geo coordinates from IP using ipinfo.io
async function getGeoCoordinates(ipAddress) {
  // For local development, req.ip can be '::1'. We'll use a public IP for testing.
  const ipToTest =
    ipAddress === "::1" || ipAddress === "127.0.0.1" ? "8.8.8.8" : ipAddress;
  try {
    const response = await fetch(
      `https://ipinfo.io/${ipToTest}/json?token=${IPINFO_TOKEN}`
    );
    const data = await response.json();
    if (data.loc) {
      const [latitude, longitude] = data.loc.split(",").map(parseFloat);
      console.log(latitude, longitude);
      return { latitude, longitude };
    }
    console.warn(`Could not find location for IP: ${ipToTest}`);
    return null;
  } catch (err) {
    console.error("Error fetching geo coordinates:", err);
    return null;
  }
}

// Haversine formula for distance calculation
function calculateDistance(lat1, lon1, lat2, lon2) {
  const toRad = (angle) => (angle * Math.PI) / 180;
  const R = 6371; // Radius of Earth in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Check if current IP is consistent with the last known IP of the user
async function isIpConsistent(userEmail, currentIp) {
  const currentLocation = await getGeoCoordinates(currentIp);
  if (!currentLocation) {
    return { isInconsistent: true, reason: "Unable to verify IP location." };
  }

  const lastLocation = userLocationHistory[userEmail];

  // If this is the user's first time, set their baseline location.
  if (!lastLocation) {
    userLocationHistory[userEmail] = currentLocation;
    return {
      isInconsistent: false,
      reason: "First-time login, location baseline established.",
    };
  }

  const distance = calculateDistance(
    currentLocation.latitude,
    currentLocation.longitude,
    lastLocation.latitude,
    lastLocation.longitude
  );

  // If the distance is too great, it's inconsistent.
  if (distance > DISTANCE_THRESHOLD_KM) {
    userLocationHistory[userEmail] = currentLocation; // Update to the new location anyway for the next check
    return {
      isInconsistent: true,
      reason: `Inconsistent Location: New login is ${distance.toFixed(
        0
      )} km away from the last known location.`,
    };
  }

  // If consistent, update the user's last known location to this new point (the "moving baseline").
  userLocationHistory[userEmail] = currentLocation;
  return {
    isInconsistent: false,
    reason: `Consistent Location (within ${DISTANCE_THRESHOLD_KM} km)`,
  };
}

module.exports = { isIpConsistent };
