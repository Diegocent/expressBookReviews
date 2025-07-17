const express = require("express");
let books = require("./booksdb.js");
let isValid = require("./auth_users.js").isValid;
let users = require("./auth_users.js").users;
const public_users = express.Router();
const axios = require("axios");

public_users.post("/register", (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res
      .status(400)
      .json({ message: "Se requiere nombre de usuario y contraseña." });
  }

  const userExists = users.some((user) => user.username === username);
  if (userExists) {
    return res
      .status(409)
      .json({ message: "El nombre de usuario ya está registrado." });
  }

  users.push({ username, password });
  return res.status(201).json({ message: "Usuario registrado exitosamente." });
});

// Get the book list available in the shop
public_users.get("/", function (req, res) {
  return res.status(200).send(JSON.stringify(books, null, 4));
});
public_users.get("/async-books", async (req, res) => {
  try {
    const response = await axios.get("http://localhost:5000/");
    return res.status(200).json(response.data);
  } catch (error) {
    return res.status(500).json({ message: "Error al obtener los libros." });
  }
});

// Get book details based on ISBN
public_users.get("/isbn/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book) {
    return res.status(200).json(book);
  } else {
    return res.status(404).json({ message: "Libro no encontrado por ISBN." });
  }
});
public_users.get("/async-isbn/:isbn", (req, res) => {
  const isbn = req.params.isbn;
  axios
    .get(`http://localhost:5000/isbn/${isbn}`)
    .then((response) => res.status(200).json(response.data))
    .catch((err) =>
      res.status(500).json({ message: "Error al obtener el libro por ISBN." })
    );
});

// Get book details based on author
public_users.get("/author/:author", function (req, res) {
  const author = req.params.author;
  const filteredBooks = Object.values(books).filter(
    (book) => book.author.toLowerCase() === author.toLowerCase()
  );

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res
      .status(404)
      .json({ message: "No se encontraron libros por ese autor." });
  }
});
public_users.get("/async-author/:author", async (req, res) => {
  const author = req.params.author;
  try {
    const response = await axios.get(`http://localhost:5000/author/${author}`);
    return res.status(200).json(response.data);
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Error al obtener libros por autor." });
  }
});

// Get all books based on title
public_users.get("/title/:title", function (req, res) {
  const title = req.params.title;
  const filteredBooks = Object.values(books).filter(
    (book) => book.title.toLowerCase() === title.toLowerCase()
  );

  if (filteredBooks.length > 0) {
    return res.status(200).json(filteredBooks);
  } else {
    return res
      .status(404)
      .json({ message: "No se encontraron libros por ese título." });
  }
});
public_users.get("/async-title/:title", (req, res) => {
  const title = req.params.title;
  axios
    .get(`http://localhost:5000/title/${title}`)
    .then((response) => res.status(200).json(response.data))
    .catch((err) =>
      res.status(500).json({ message: "Error al obtener libros por título." })
    );
});

//  Get book review
public_users.get("/review/:isbn", function (req, res) {
  const isbn = req.params.isbn;
  const book = books[isbn];

  if (book && book.reviews) {
    return res.status(200).json(book.reviews);
  } else {
    return res
      .status(404)
      .json({ message: "No se encontraron reseñas para este ISBN." });
  }
});

module.exports.general = public_users;
