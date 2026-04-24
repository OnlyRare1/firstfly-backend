const express = require('express');
const cors = require('cors');
const axios = require('axios');

const app = express();

// This completely fixes the 403 Forbidden CORS errors!
app.use(cors()); 
app.use(express.json());

// Your SerpApi Key
const SERPAPI_KEY = '5e3e6ebd5f3374b31b61bca9b25f71c636d47b4a89d0578b24dd2d5a5c74c8ab';

app.get('/api/search', async (req, res) => {
    try {
        const { origin, destination, date, returnDate, type } = req.query;
        
        console.log(`✈️ Searching flights: ${origin} to ${destination} on ${date}...`);

        // SerpApi expects '2' for One-Way and '1' for Round-Trip
        const serpApiType = (type === 'roundtrip') ? '1' : '2';

        // Build the URL for SerpApi with the correct 'type' parameter
        let url = `https://serpapi.com/search.json?engine=google_flights&departure_id=${origin}&arrival_id=${destination}&outbound_date=${date}&currency=PKR&hl=en&type=${serpApiType}&api_key=${SERPAPI_KEY}`;

        // Add return date if it's a round trip
        if (type === 'roundtrip' && returnDate) {
            url += `&return_date=${returnDate}`;
        }

        const response = await axios.get(url);
        
        // Google Flights returns data split into "Best Flights" and "Other Flights"
        let allFlights = [];
        if (response.data.best_flights) allFlights = [...allFlights, ...response.data.best_flights];
        if (response.data.other_flights) allFlights = [...allFlights, ...response.data.other_flights];

        // Send all combined flights back to your website
        res.json(allFlights);

    } catch (error) {
        // This will print the EXACT error from Google to your terminal to help with debugging
        console.error("Flight search failed:", error.response ? error.response.data : error.message);
        res.status(500).json({ error: "Failed to fetch flights from Google Flights" });
    }
});

// Use the environment port if available (for cloud hosting), otherwise use 3000 (for local testing)
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`\n✅ First Fly Backend Server is LIVE!`);
    console.log(`📡 Listening for flight searches on port ${PORT}`);
});