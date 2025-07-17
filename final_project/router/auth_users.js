const express = require("express");
const jwt = require("jsonwebtoken");
let books = require("./booksdb.js");
const regd_users = express.Router();

let users = [];

const isValid = (username) => {
  return users.some((user) => user.username === username);
};

const authenticatedUser = (username, password) => {
  return users.some(
    (user) => user.username === username && user.password === password
  );
};

//only registered users can login
regd_users.post("/login", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Nombre de usuario y contraseña son requeridos." });
  }

  if (!authenticatedUser(username, password)) {
    return res.status(401).json({ message: "Credenciales inválidas." });
  }

  const accessToken = jwt.sign({ username }, "claveSecretaJWT", {
    expiresIn: "1h",
  });

  req.session.authorization = {
    accessToken,
    username,
  };

  return res
    .status(200)
    .json({ message: "Inicio de sesión exitoso", token: accessToken });
});

// Add a book review
regd_users.put("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const review = req.query.review;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "No autorizado" });
  }

  if (!review) {
    return res
      .status(400)
      .json({ message: "Debe incluir una reseña en la consulta." });
  }

  const book = books[isbn];
  if (!book) {
    return res.status(404).json({ message: "Libro no encontrado." });
  }

  if (!book.reviews) {
    book.reviews = {};
  }

  book.reviews[username] = review;

  return res
    .status(200)
    .json({ message: "Reseña agregada/modificada exitosamente." });
});
regd_users.delete("/auth/review/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  const username = req.session.authorization?.username;

  if (!username) {
    return res.status(401).json({ message: "No autorizado" });
  }

  const book = books[isbn];
  if (!book || !book.reviews || !book.reviews[username]) {
    return res
      .status(404)
      .json({ message: "Reseña no encontrada o ya eliminada." });
  }

  delete book.reviews[username];

  return res.status(200).json({ message: "Reseña eliminada exitosamente." });
});

module.exports.authenticated = regd_users;
module.exports.isValid = isValid;
module.exports.users = users;
