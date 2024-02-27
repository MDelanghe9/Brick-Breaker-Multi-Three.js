const express = require('express');
const path = require('path');

const app = express();

// Middleware to serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));
app.use('/node_modules', express.static(path.join(__dirname, 'node_modules')));
app.use('/vendor_mods', express.static(path.join(__dirname, 'vendor_mods')));
app.use('/methodes', express.static(path.join(__dirname, 'methodes')));
// Route handler for the root URL
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
});