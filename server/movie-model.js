const initialMovies = {
  "tt0110413": {
    imdbID: "tt0110413",
    Title: "Léon – Der Profi",
    Released: "1994-09-14",
    Runtime: 110,
    Genres: ["Action", "Crime", "Drama"],
    Directors: ["Luc Besson"],
    Writers: ["Luc Besson"],
    Actors: ["Jean Reno", "Gary Oldman", "Natalie Portman"],
    Plot: "Ein Auftragskiller nimmt ein 12-jähriges Mädchen auf, nachdem ihre Familie ermordet wurde.",
    Poster: "https://upload.wikimedia.org/wikipedia/en/0/03/Leon-poster.jpg",
    Metascore: 64,
    imdbRating: 8.5
  },

  "tt0102926": {
    imdbID: "tt0102926",
    Title: "Das Schweigen der Lämmer",
    Released: "1991-02-14",
    Runtime: 118,
    Genres: ["Crime", "Drama", "Horror"],
    Directors: ["Jonathan Demme"],
    Writers: ["Thomas Harris", "Ted Tally"],
    Actors: ["Jodie Foster", "Anthony Hopkins", "Lawrence A. Bonney"],
    Plot: "Eine FBI-Anwärterin bittet einen inhaftierten Kannibalen um Hilfe bei der Suche nach einem Serienmörder.",
    Poster: "https://m.media-amazon.com/images/M/MV5BNjNhZTk0ZmEtNjJhMi00YzFlLWE1MmEtYzM1M2ZmMGMwMTU4XkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_SX300.jpg",
    Metascore: 86,
    imdbRating: 8.6
  },

  "tt0120737": {
    imdbID: "tt0120737",
    Title: "Der Herr der Ringe: Die Gefährten",
    Released: "2001-12-19",
    Runtime: 178,
    Genres: ["Action", "Adventure", "Drama"],
    Directors: ["Peter Jackson"],
    Writers: ["J.R.R. Tolkien", "Fran Walsh"],
    Actors: ["Elijah Wood", "Ian McKellen", "Orlando Bloom"],
    Plot: "Ein junger Hobbit begibt sich auf eine gefährliche Reise, um den Einen Ring zu zerstören.",
    Poster: "https://m.media-amazon.com/images/M/MV5BN2EyZjM3NzUtNWUzMi00MTgxLWI0NTctMzY4M2VlOTdjZWRiXkEyXkFqcGdeQXVyNDUzOTQ5MjY@._V1_SX300.jpg",
    Metascore: 92,
    imdbRating: 8.9
  },

  "tt0071562": {
    imdbID: "tt0071562",
    Title: "Der Pate II",
    Released: "1974-12-20",
    Runtime: 202,
    Genres: ["Crime", "Drama"],
    Directors: ["Francis Ford Coppola"],
    Writers: ["Francis Ford Coppola", "Mario Puzo"],
    Actors: ["Al Pacino", "Robert De Niro", "Robert Duvall"],
    Plot: "Die Fortsetzung zeigt den Aufstieg von Vito Corleone und die Festigung von Michaels Macht.",
    Poster: "https://m.media-amazon.com/images/M/MV5BMWMwMGQzZTItY2JlNC00OWZiLWIyMDctNDk2ZDQ2YjRjMWQ0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    Metascore: 90,
    imdbRating: 9.0
  },

  "tt0137523": {
    imdbID: "tt0137523",
    Title: "Fight Club",
    Released: "1999-10-15",
    Runtime: 139,
    Genres: ["Drama"],
    Directors: ["David Fincher"],
    Writers: ["Chuck Palahniuk", "Jim Uhls"],
    Actors: ["Brad Pitt", "Edward Norton", "Meat Loaf"],
    Plot: "Ein schlafloser Büroangestellter gründet einen geheimen Kampfclub.",
    Poster: "https://m.media-amazon.com/images/M/MV5BNDIzNDU0YzEtYzE5Ni00ZjlkLTk5ZjgtNjM3NWE4YzA3Nzk3XkEyXkFqcGdeQXVyMjUzOTY1NTc@._V1_SX300.jpg",
    Metascore: 66,
    imdbRating: 8.8
  },

  "tt0060196": {
    imdbID: "tt0060196",
    Title: "Zwei glorreiche Halunken",
    Released: "1966-12-23",
    Runtime: 161,
    Genres: ["Adventure", "Western"],
    Directors: ["Sergio Leone"],
    Writers: ["Luciano Vincenzoni", "Sergio Leone"],
    Actors: ["Clint Eastwood", "Eli Wallach", "Lee Van Cleef"],
    Plot: "Drei Männer suchen während des Bürgerkriegs nach einem vergrabenen Goldschatz.",
    Poster: "https://m.media-amazon.com/images/M/MV5BOTQ5NDI3MTI4MF5BMl5BanBnXkFtZTgwNDQ4ODE5MDE@._V1_SX300.jpg",
    Metascore: 90,
    imdbRating: 8.8
  },

  "tt0057012": {
    imdbID: "tt0057012",
    Title: "Dr. Seltsam oder: Wie ich lernte, die Bombe zu lieben",
    Released: "1964-01-29",
    Runtime: 95,
    Genres: ["Comedy", "War"],
    Directors: ["Stanley Kubrick"],
    Writers: ["Stanley Kubrick", "Terry Southern"],
    Actors: ["Peter Sellers", "George C. Scott", "Sterling Hayden"],
    Plot: "Ein wahnsinniger General löst einen nuklearen Angriff aus, während Politiker versuchen, ihn zu stoppen.",
    Poster: "https://m.media-amazon.com/images/M/MV5BZWI3ZTMxNjctMjdlNS00NmUwLWFiM2YtZDUyY2I3N2MxYTE0XkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_SX300.jpg",
    Metascore: 97,
    imdbRating: 8.3
  }
};

const userMovies = {
  lika: structuredClone(initialMovies),
  jane: structuredClone(initialMovies)
};

function ensureUser(username) {
  if (!userMovies[username]) {
    userMovies[username] = {};
  }
}

function getUserMovies(username) {
  ensureUser(username);
  return userMovies[username];
}

function getUserMovie(username, imdbID) {
  ensureUser(username);
  return userMovies[username][imdbID];
}

function setUserMovie(username, imdbID, movie) {
  ensureUser(username);

  userMovies[username][imdbID] = {
    ...movie,
    imdbID: imdbID
  };
}

function deleteUserMovie(username, imdbID) {
  ensureUser(username);

  if (!userMovies[username][imdbID]) {
    return false;
  }

  delete userMovies[username][imdbID];
  return true;
}

function hasUserMovie(username, imdbID) {
  ensureUser(username);
  return userMovies[username][imdbID] !== undefined;
}

function getGenres(username) {
  ensureUser(username);

  const genreSet = new Set();

  Object.values(userMovies[username]).forEach(movie => {
    if (Array.isArray(movie.Genres)) {
      movie.Genres.forEach(genre => genreSet.add(genre));
    }
  });

  return Array.from(genreSet);
}

module.exports = {
  getUserMovies,
  getUserMovie,
  setUserMovie,
  deleteUserMovie,
  hasUserMovie,
  getGenres
};