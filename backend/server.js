
// 1. Load environment variables from .env file
require("dotenv").config(); 

// 2. Import the configured app and the database connection function
const app = require('./app'); 
const connectDB = require('./config/db');

// 3. Connect to MongoDB
connectDB(); 

// 4. Define the port
const PORT = process.env.PORT || 5000;
 
// 5. Start the server and listen for requests on the defined port
app.listen(PORT, () => {
    console.log(`🚀 Server started on port ${PORT}`);
});