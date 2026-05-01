import { ButtonBuilder, ElementBuilder, MovieBuilder } from "./builders.js";

const messages = {
  dataLoadError: "Daten konnten nicht geladen werden, Status",
  movieAlreadyInCollection: "Film bereits in der Sammlung.",
  addMovieFailed: "Hinzufügen des Films ist fehlgeschlagen.",
  deleteMovieFailed: "Film konnte nicht gelöscht werden.",
  noResultsFound: "Keine Ergebnisse gefunden.",
  searchFailed: "Die Suche ist fehlgeschlagen...",
  loggedOutGreeting: "Bitte logge dich ein, um deine Filmkollektion zu sehen.",
  loginFailed: "Login fehlgeschlagen. Bitte Benutzername und Passwort prüfen."
};

let currentSession = null;

function removeMovies() {
  const mainElement = document.querySelector("main");

  while (mainElement.childElementCount > 0) {
    mainElement.firstChild.remove();
  }
}

function loadMovies(genre) {
  if (!currentSession) {
    removeMovies();
    return;
  }

  const url = new URL("/movies", location.href);

  if (genre) {
    url.searchParams.set("genre", genre);
  }

  fetch(url)
      .then(response => {
        removeMovies();

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then(movies => {
        const mainElement = document.querySelector("main");

        movies.forEach(movie => {
          new MovieBuilder(movie, deleteMovie, Boolean(currentSession))
              .appendTo(mainElement);
        });
      })
      .catch(error => {
        console.error("Failed to load movies:", error);

        const mainElement = document.querySelector("main");
        mainElement.append(`${messages.dataLoadError} ${error.message}`);
      });
}

function updateGenres() {
  const header = document.querySelector("nav > h2");
  const listElement = document.querySelector("#filter");

  listElement.innerHTML = "";

  if (!currentSession) {
    header.style.display = "none";
    return;
  }

  fetch("/genres")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then(genres => {
        header.style.display = "block";

        new ElementBuilder("li")
            .append(new ButtonBuilder("All").onclick(() => loadMovies()))
            .appendTo(listElement);

        for (const genre of genres) {
          new ElementBuilder("li")
              .append(new ButtonBuilder(genre).onclick(() => loadMovies(genre)))
              .appendTo(listElement);
        }

        const firstButton = listElement.querySelector("button");

        if (firstButton) {
          firstButton.click();
        }
      })
      .catch(error => {
        console.error("Failed to load genres:", error);
        listElement.append(`${messages.dataLoadError} ${error.message}`);
      });
}

function addMovie(imdbID) {
  return fetch(`/movies/${imdbID}`, {
    method: "PUT"
  })
      .then(response => {
        if (response.status === 201) {
          loadMovies();
          updateGenres();
          return true;
        }

        if (response.status === 200) {
          alert(messages.movieAlreadyInCollection);
          return false;
        }

        throw new Error(`HTTP ${response.status}`);
      })
      .catch(error => {
        console.error("Failed to add movie:", error);
        alert(`${messages.addMovieFailed} ${error.message}`);
        return false;
      });
}

function deleteMovie(imdbID) {
  fetch(`/movies/${imdbID}`, {
    method: "DELETE"
  })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        const article = document.getElementById(imdbID);

        if (article) {
          article.remove();
        }

        updateGenres();
      })
      .catch(error => {
        console.error("Failed to delete movie:", error);
        alert(`${messages.deleteMovieFailed} ${error.message}`);
      });
}

function searchMovies(query) {
  const resultsDiv = document.getElementById("searchResults");

  resultsDiv.innerHTML = "";

  fetch(`/search?query=${encodeURIComponent(query)}`, {
    credentials: "same-origin"
  })
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then(results => {
        resultsDiv.innerHTML = "";

        if (!results || results.length === 0) {
          new ElementBuilder("p")
              .text(messages.noResultsFound)
              .appendTo(resultsDiv);

          return;
        }

        results.forEach(movie => {
          const resultElement = document.createElement("div");
          resultElement.classList.add("search-result");

          const movieText = document.createElement("span");
          movieText.textContent = `${movie.Title} (${movie.Year})`;

          const addButton = document.createElement("button");
          addButton.type = "button";
          addButton.textContent = "Add";

          addButton.addEventListener("click", () => {
            addMovie(movie.imdbID).then(added => {
              if (added) {
                resultElement.remove();
              }
            });
          });

          resultElement.appendChild(movieText);
          resultElement.appendChild(addButton);

          resultsDiv.appendChild(resultElement);
        });
      })
      .catch(error => {
        console.error("Search failed:", error);

        resultsDiv.innerHTML = "";

        new ElementBuilder("p")
            .text(`${messages.searchFailed} ${error.message}`)
            .appendTo(resultsDiv);
      });
}

function renderUserGreeting() {
  const greetingElement = document.getElementById("userGreeting");

  if (currentSession) {
    const loginDate = new Date(currentSession.loginTime);

    const formattedDate = loginDate.toLocaleDateString("de-DE", {
      day: "numeric",
      month: "long",
      year: "numeric"
    });

    const formattedTime = loginDate.toLocaleTimeString("de-DE", {
      hour: "2-digit",
      minute: "2-digit"
    });

    greetingElement.textContent =
        `Hi ${currentSession.firstName} ${currentSession.lastName}, du hast dich am ${formattedDate} um ${formattedTime} angemeldet.`;
  } else {
    greetingElement.textContent = messages.loggedOutGreeting;
  }
}

function updateUI() {
  const authBtn = document.getElementById("authBtn");
  const addMoviesBtn = document.getElementById("addMoviesBtn");

  renderUserGreeting();
  updateGenres();

  if (currentSession) {
    authBtn.textContent = "Logout";

    authBtn.onclick = () => {
      fetch("/logout")
          .then(response => {
            if (response.ok) {
              currentSession = null;
              updateUI();
            }
          })
          .catch(error => {
            console.error("Logout failed:", error);
          });
    };

    addMoviesBtn.style.display = "inline";
  } else {
    removeMovies();

    authBtn.textContent = "Login";

    authBtn.onclick = () => {
      const loginForm = document.getElementById("loginForm");

      loginForm.reset();

      document.getElementById("loginDialog").showModal();
    };

    addMoviesBtn.style.display = "none";
  }
}

window.onload = function () {
  fetch("/session")
      .then(response => {
        if (!response.ok) {
          throw new Error(`HTTP ${response.status}`);
        }

        return response.json();
      })
      .then(data => {
        currentSession = data || null;
        updateUI();
      })
      .catch(error => {
        console.error("Failed to load session:", error);
        currentSession = null;
        updateUI();
      });

  document.getElementById("loginForm").addEventListener("submit", event => {
    event.preventDefault();

    const formData = new FormData(event.target);
    const loginDialog = document.getElementById("loginDialog");

    const username = formData.get("username");
    const password = formData.get("password");

    fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        username: username,
        password: password
      })
    })
        .then(response => {
          if (!response.ok) {
            throw new Error("Invalid username or password");
          }

          return response.json();
        })
        .then(data => {
          currentSession = data;

          loginDialog.close();

          updateUI();
        })
        .catch(error => {
          console.error("Login failed:", error);
          alert(messages.loginFailed);
        });
  });

  document.getElementById("cancelLogin").addEventListener("click", () => {
    document.getElementById("loginDialog").close();
  });

  const addMoviesBtn = document.getElementById("addMoviesBtn");
  const searchForm = document.getElementById("searchForm");
  const cancelSearch = document.getElementById("cancelSearch");
  const searchDialog = document.getElementById("searchDialog");

  if (addMoviesBtn && searchForm && cancelSearch && searchDialog) {
    addMoviesBtn.addEventListener("click", () => {
      searchForm.reset();
      document.getElementById("searchResults").innerHTML = "";
      searchDialog.showModal();
    });

    searchForm.addEventListener("submit", event => {
      event.preventDefault();

      const query = document.getElementById("query").value.trim();

      if (!query) {
        return;
      }

      searchMovies(query);
    });

    cancelSearch.addEventListener("click", () => {
      searchDialog.close();
    });
  }
};