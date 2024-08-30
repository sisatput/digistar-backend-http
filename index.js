const express = require("express");
const bodyParser = require("body-parser");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

let users = [];

// Start the server and listen on the specified port
app.listen(port, () => {
  console.log(`Server running at http://127.0.0.1:${port}/`);
});

// Middleware
app.use(bodyParser.json());
app.use(cookieParser());

// Load users from cookie if available
app.use((req, res, next) => {
  if (req.cookies.users) {
    try {
      users = JSON.parse(req.cookies.users);
    } catch (err) {
      console.error("Failed to parse users from cookie:", err);
    }
  }
  next();
});

// Handler for the root route, sending a welcome message
app.get("/", (req, res) => {
  res.send("Welcome to the Users API!");
});

// Handler to get the list of all users
app.get("/users", (req, res) => {
  res.json({ allUsers: users });
});

// Handler to get a user by ID
app.get("/users/:id", (req, res) => {
  const id = req.params.id;
  const user = users.find((u) => u.id === id);

  if (!user) {
    return res.status(404).json({ error: "User not found" });
  }

  res.json({ user });
});

// Handler to add a new user
app.post("/users", (req, res) => {
  const user = req.body;

  // Check if ID already exists
  const existingUser = users.find((u) => u.id === user.id);
  if (existingUser) {
    return res.status(400).json({ error: "User with this ID already exists" });
  }

  // Check if user has an ID and a name
  if (!user.id || !user.name) {
    return res.status(400).json({ error: "User must have an id and a name" });
  }

  // Add the new user to the array
  users.push(user);
  res.cookie("users", JSON.stringify(users), { maxAge: 600000, httpOnly: true });
  res.status(201).json({
    message: "User has been added",
    newuser: user,
  });
});

// Handler to update an existing user by ID
app.put("/users/:id", (req, res) => {
  const id = req.params.id;
  const updatedUser = req.body;

  // Find the index of the user to be updated
  const index = users.findIndex((user) => user.id === id);
  if (index === -1) {
    return res.status(404).json({ error: "User not found" });
  }

  users[index] = updatedUser;
  res.cookie("users", JSON.stringify(users), { maxAge: 600000, httpOnly: true });
  res.json({
    message: "User has been updated",
    updateduser: updatedUser,
  });
});

// Handler to delete a user by ID
app.delete("/users/:id", (req, res) => {
  const id = req.params.id;

  const initialLength = users.length;
  users = users.filter((user) => user.id !== id);

  if (users.length === initialLength) {
    return res.status(404).json({ error: "User not found" });
  }

  res.cookie("users", JSON.stringify(users), { maxAge: 600000, httpOnly: true });
  res.status(200).json({ message: "User has been deleted" });
});
