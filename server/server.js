const express = require("express");
const path = require("path");
const bodyParser = require("body-parser");
const session = require("express-session");
const bcrypt = require("bcrypt");

const config = require("./config.js");
const movieModel = require("./movie-model.js");
const userModel = require("./user-model.js");

const app = express();

app.use(bodyParser.json());

app.use(session({
  secret: config.sessionSecret,
  resave: false,
  saveUninitialized: true,
  cookie: {
    secure: false
  }
}));

app.use(express.static(path.join(__dirname, "files")));

function requireLogin(req, res, next) {
  if (!req.session || !req.session.user) {
    return res.sendStatus(401);
  }

  next();
}

function splitList(value) {
  if (!value || value === "N/A") {
    return [];
  }

  return value.split(",").map(item => item.trim());
}

function parseRuntime(value) {
  if (!value || value === "N/A") {
    return null;
  }

  const runtime = parseInt(value.replace(" min", ""), 10);

  if (Number.isNaN(runtime)) {
    return null;
  }

  return runtime;
}

function parseNumber(value) {
  if (!value || value === "N/A") {
    return null;
  }

  const number = Number(value);

  if (Number.isNaN(number)) {
    return null;
  }

  return number;
}

function convertReleasedDate(value) {
  if (!value || value === "N/A") {
    return null;
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return null;
  }

  return date.toISOString().substring(0, 10);
}

function convertOmdbMovie(response) {
  return {
    imdbID: response.imdbID,
    Title: response.Title,
    Released: convertReleasedDate(response.Released),
    Runtime: parseRuntime(response.Runtime),
    Genres: splitList(response.Genre),
    Directors: splitList(response.Director),
    Writers: splitList(response.Writer),
    Actors: splitList(response.Actors),
    Plot: response.Plot,
    Poster: response.Poster,
    Metascore: parseNumber(response.Metascore),
    imdbRating: parseNumber(response.imdbRating)
  };
}

async function fetchMovieFromOmdb(imdbID) {
  const url = `http://www.omdbapi.com/?i=${encodeURIComponent(imdbID)}&apikey=${config.omdbApiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.omdbTimeoutMs);

  try {
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      return {
        ok: false,
        status: apiRes.status
      };
    }

    const response = await apiRes.json();

    if (response.Response !== "True") {
      return {
        ok: false,
        status: 404
      };
    }

    return {
      ok: true,
      movie: convertOmdbMovie(response)
    };
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      return {
        ok: false,
        status: 504
      };
    }

    return {
      ok: false,
      status: 500
    };
  }
}

app.post("/login", function (req, res) {
  const username = req.body.username;
  const password = req.body.password;

  const user = userModel.getUserByUsername(username);

  if (user && bcrypt.compareSync(password, user.password)) {
    req.session.user = {
      username: user.username,
      firstName: user.firstName,
      lastName: user.lastName,
      loginTime: new Date().toISOString()
    };

    return res.send(req.session.user);
  }

  return res.sendStatus(401);
});

app.get("/logout", function (req, res) {
  req.session.destroy(function (err) {
    if (err) {
      return res.sendStatus(500);
    }

    return res.sendStatus(200);
  });
});

app.get("/session", function (req, res) {
  if (req.session && req.session.user) {
    return res.send(req.session.user);
  }

  return res.status(401).json(null);
});

app.get("/movies", requireLogin, function (req, res) {
  const username = req.session.user.username;
  let movies = Object.values(movieModel.getUserMovies(username));

  const queriedGenre = req.query.genre;

  if (queriedGenre) {
    movies = movies.filter(movie =>
        Array.isArray(movie.Genres) && movie.Genres.includes(queriedGenre)
    );
  }

  return res.send(movies);
});

app.get("/movies/:imdbID", requireLogin, function (req, res) {
  const username = req.session.user.username;
  const imdbID = req.params.imdbID;

  const movie = movieModel.getUserMovie(username, imdbID);

  if (movie) {
    return res.send(movie);
  }

  return res.sendStatus(404);
});

app.put("/movies/:imdbID", requireLogin, async function (req, res) {
  const username = req.session.user.username;
  const imdbID = req.params.imdbID;

  const existingMovie = movieModel.getUserMovie(username, imdbID);
  const requestBody = req.body || {};
  const hasRequestBody = Object.keys(requestBody).length > 0;

  if (existingMovie) {
    if (hasRequestBody) {
      movieModel.setUserMovie(username, imdbID, requestBody);
    }

    return res.sendStatus(200);
  }

  const result = await fetchMovieFromOmdb(imdbID);

  if (!result.ok) {
    return res.sendStatus(result.status);
  }

  movieModel.setUserMovie(username, imdbID, result.movie);

  return res.status(201).send(result.movie);
});

app.delete("/movies/:imdbID", requireLogin, function (req, res) {
  const username = req.session.user.username;
  const imdbID = req.params.imdbID;

  if (movieModel.deleteUserMovie(username, imdbID)) {
    return res.sendStatus(200);
  }

  return res.sendStatus(404);
});

app.get("/genres", requireLogin, function (req, res) {
  const username = req.session.user.username;
  const genres = movieModel.getGenres(username);

  genres.sort();

  return res.send(genres);
});

app.get("/search", requireLogin, async function (req, res) {
  const username = req.session.user.username;
  const query = req.query.query;

  if (!query) {
    return res.sendStatus(400);
  }

  const url = `http://www.omdbapi.com/?s=${encodeURIComponent(query)}&apikey=${config.omdbApiKey}`;

  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), config.omdbTimeoutMs);

  try {
    const apiRes = await fetch(url, { signal: controller.signal });
    clearTimeout(timeoutId);

    if (!apiRes.ok) {
      return res.sendStatus(apiRes.status);
    }

    const response = await apiRes.json();

    if (response.Response !== "True") {
      return res.send([]);
    }

    const results = response.Search
        .filter(movie => !movieModel.hasUserMovie(username, movie.imdbID))
        .map(movie => ({
          Title: movie.Title,
          imdbID: movie.imdbID,
          Year: Number.isNaN(parseInt(movie.Year, 10)) ? null : parseInt(movie.Year, 10)
        }));

    return res.send(results);
  } catch (err) {
    clearTimeout(timeoutId);

    if (err.name === "AbortError") {
      return res.sendStatus(504);
    }

    return res.sendStatus(500);
  }
});

app.listen(config.port);

console.log(`Server now listening on http://localhost:${config.port}/`);