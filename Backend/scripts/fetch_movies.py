"""
Script to fetch movies from TMDB API and save as JSON.
"""
import os
import json
import requests
import time
from dotenv import load_dotenv
from api.settings import TMDB_API_KEY

load_dotenv()

TMDB_API_KEY = os.getenv("TMDB_API_KEY")
TMDB_API_URL = "https://api.themoviedb.org/3"

def fetch_movies():
    all_movies = []
    movie_ids = set()
    
    endpoints = [
        {"path": "/movie/popular", "pages": 20, "desc": "popular movies"},
        {"path": "/movie/top_rated", "pages": 20, "desc": "top rated movies"},
        {"path": "/movie/now_playing", "pages": 10, "desc": "now playing movies"},
        {"path": "/movie/upcoming", "pages": 10, "desc": "upcoming movies"},
    ]
    
    genres = [
        {"id": 28, "name": "Action"},
        {"id": 12, "name": "Adventure"},
        {"id": 16, "name": "Animation"},
        {"id": 35, "name": "Comedy"},
        {"id": 80, "name": "Crime"},
        {"id": 99, "name": "Documentary"},
        {"id": 18, "name": "Drama"},
        {"id": 10751, "name": "Family"},
        {"id": 14, "name": "Fantasy"},
        {"id": 36, "name": "History"},
        {"id": 27, "name": "Horror"},
        {"id": 10402, "name": "Music"},
        {"id": 9648, "name": "Mystery"},
        {"id": 10749, "name": "Romance"},
        {"id": 878, "name": "Science Fiction"},
        {"id": 53, "name": "Thriller"},
        {"id": 10752, "name": "War"},
        {"id": 37, "name": "Western"}
    ]
    
    for endpoint in endpoints:
        for page in range(1, endpoint["pages"] + 1):
            url = f"{TMDB_API_URL}{endpoint['path']}"
            params = {
                "api_key": TMDB_API_KEY,
                "language": "en-US",
                "page": page
            }
            
            try:
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    movies = response.json().get("results", [])
                    
                    if not movies:
                        break
                    
                    for movie in movies:
                        if movie["id"] in movie_ids:
                            continue
                        
                        movie_ids.add(movie["id"])
                        processed_movie = process_movie(movie)
                        if processed_movie:
                            all_movies.append(processed_movie)
                    
                    print(f"Fetched page {page}/{endpoint['pages']} of {endpoint['desc']} with {len(movies)} movies")
                    
                else:
                    print(f"Error fetching page {page} from {endpoint['path']}: {response.status_code}")
                    break
                
                time.sleep(0.25)
                
            except Exception as e:
                print(f"Exception fetching from {endpoint['path']}: {str(e)}")
                time.sleep(2)
    for genre in genres:
        for page in range(1, 6):
            url = f"{TMDB_API_URL}/discover/movie"
            params = {
                "api_key": TMDB_API_KEY,
                "language": "en-US",
                "with_genres": genre["id"],
                "sort_by": "popularity.desc",
                "page": page
            }
            
            try:
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    movies = response.json().get("results", [])
                    
                    if not movies:
                        break
                    
                    new_movies = 0
                    for movie in movies:
                        if movie["id"] in movie_ids:
                            continue
                        
                        movie_ids.add(movie["id"])
                        processed_movie = process_movie(movie)
                        if processed_movie:
                            all_movies.append(processed_movie)
                            new_movies += 1
                    
                    print(f"Fetched page {page}/5 of {genre['name']} genre with {new_movies} new movies")
                    
                    if new_movies == 0:
                        break
                    
                else:
                    print(f"Error fetching {genre['name']} movies page {page}: {response.status_code}")
                    break
                
                time.sleep(0.25)
                
            except Exception as e:
                print(f"Exception fetching {genre['name']} movies: {str(e)}")
                time.sleep(2)
    
    print(f"Total unique movies found: {len(all_movies)}")
    
    with open("scripts/data/movies.json", "w") as f:
        json.dump(all_movies, f, indent=2)
    
    print(f"Saved {len(all_movies)} movies to movies.json")
    return all_movies

def process_movie(movie):
    movie_id = movie["id"]
    
    try:
        details_url = f"{TMDB_API_URL}/movie/{movie_id}"
        details_params = {
            "api_key": TMDB_API_KEY,
            "language": "en-US",
            "append_to_response": "credits,keywords"
        }
        
        details_response = requests.get(details_url, params=details_params)
        
        if details_response.status_code == 200:
            details = details_response.json()
            
            director = next((crew["name"] for crew in details.get("credits", {}).get("crew", []) 
                            if crew["job"] == "Director"), "Unknown")
            
            if not movie.get("release_date"):
                return None
            
            movie_obj = {
                "tmdb_id": movie["id"],
                "title": movie["title"],
                "director": director,
                "release_year": int(movie["release_date"][:4]) if movie["release_date"] else None,
                "genre": ", ".join([genre["name"] for genre in details.get("genres", [])]),
                "summary": movie["overview"],
                "poster_path": movie["poster_path"],
                "backdrop_path": movie["backdrop_path"],
                "vote_average": movie["vote_average"],
                "runtime": details.get("runtime")
            }
            
            time.sleep(0.25)
            
            return movie_obj
            
        else:
            print(f"Error fetching details for movie {movie_id}: {details_response.status_code}")
            return None
            
    except Exception as e:
        print(f"Exception processing movie {movie_id}: {str(e)}")
        return None

if __name__ == "__main__":
    os.makedirs("scripts/data", exist_ok=True)
    fetch_movies() 