const express = require('express');
const bodyParser = require('body-parser');
const AfricasTalking = require('africastalking')(credentials);
const mongoose = require('mongoose');
const BusRoute = require('./models/busRoute');

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.post('/ussd', async (req, res) => {
    const { sessionId, serviceCode, phoneNumber, text } = req.body;
    const routesPerPage = 10;

    let response = '';

    if (text === '') {
        // First Request
        response = `CON What would you like to check?
        1. List all routes
        2. Search a route
        3. Exit`;

    } else if (text === '1') {
        // List all routes (from database)
        try {
            const currentPage = parseInt(text.split('*')[1]) || 1;
            const skipCount = (currentPage - 1) * routesPerPage;

            const allRoutes = await BusRoute.find().skip(skipCount).limit(routesPerPage);
            response = 'CON Here are some routes:\n';

            if (allRoutes.length === 0) {
                response += 'No routes found.';
            } else {
                allRoutes.forEach(route => response += `* ${route.route}\n`);

                // Pagination options
                if (currentPage > 1) response += '98. Next\n0. Previous\n';
                else response += '98. Next\n';
                response += '00. Home';
            }
        } catch (error) {
            console.error('Error fetching routes:', error);
            response = 'END An error occurred. Please try again later.';
        }

    } else if (text === '2') {
        // Search a route
        response = `CON Enter the route name or code: `;

    } else if (text.startsWith('2*')) {
        // Route search result
        const searchQuery = text.split('*')[1];
        try {
            const busRoute = await BusRoute.findOne({ $or: [{ code: searchQuery }, { route: searchQuery }] });

            if (busRoute) {
                response = 'CON Here\'s the route info:\n' +
                    `Route: ${busRoute.route}\n` +
                    `Station: ${busRoute.station}\n` +
                    // ...other details; adapt as needed

                    // Trigger SMS
                    sendMessage(phoneNumber, busRoute);
            } else {
                response = 'END Route not found.';
            }
        } catch (error) {
            console.error('Error searching route:', error);
            response = 'END An error occurred. Please try again later.';
        }

    } else {
        response = 'END Invalid input. Goodbye!';
    }

    res.set('Content-Type: text/plain');
    res.send(response);
});

app.post('/new', async (req, res) => {
    try {
        // Example assuming data comes in the request body
        const newRouteData = req.body;

        const newRoute = new BusRoute({
            code: newRouteData.code,
            route: newRouteData.route,
            station: newRouteData.station,
            avg_price: newRouteData.avg_price,
            peak_price: newRouteData.peak_price,
            time: newRouteData.time
        });

        await newRoute.save();
        res.status(201).json({ message: 'Route created successfully!' });
    } catch (error) {
        console.error('Error creating route:', error);
        res.status(500).json({ error: 'An error occurred creating the route.' });
    }
});

app.get('/routes', async (req, res) => {
    try {
        const allRoutes = await BusRoute.find();
        res.json(allRoutes);
    } catch (error) {
        console.error('Error fetching routes:', error);
        res.status(500).json({ error: 'An error occurred fetching routes.' });
    }
});
