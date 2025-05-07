"""
Script to fetch books from Google Books API and save as JSON.
"""
import os
import json
import requests
import time
from dotenv import load_dotenv

load_dotenv()

GOOGLE_BOOKS_API_URL = "https://www.googleapis.com/books/v1/volumes"

def fetch_books(max_results_per_query=40):
    queries = [
        "subject:fiction bestseller",
        "subject:science fiction",
        "subject:fantasy",
        "subject:mystery",
        "subject:thriller",
        "subject:horror",
        "subject:romance",
        "subject:historical fiction",
        "subject:adventure",
        "subject:classics",
        "subject:literary fiction",
        "subject:short stories",
        "subject:young adult",
        "subject:dystopian",

        "subject:biography",
        "subject:autobiography",
        "subject:history",
        "subject:science",
        "subject:philosophy",
        "subject:psychology",
        "subject:business",
        "subject:self-help",
        "subject:travel",
        "subject:cooking",
        "subject:art",
        "subject:health",
        "subject:politics",
        "subject:computers",

        "inauthor:stephen king",
        "inauthor:j.k. rowling",
        "inauthor:dan brown",
        "inauthor:james patterson",
        "inauthor:john grisham",
        "inauthor:nora roberts",
        "inauthor:agatha christie",
        "inauthor:george r.r. martin",
        "inauthor:haruki murakami",
        "inauthor:neil gaiman",

        "pulitzer prize winner",
        "booker prize winner",
        "hugo award",
        "national book award",
        "newbery medal"
    ]

    all_books = []
    books_set = set()

    for query in queries:
        for start_index in range(0, 200, 40): 
            params = {
                "q": query,
                "maxResults": 40, 
                "startIndex": start_index,
                "langRestrict": "en",
                "orderBy": "relevance"
            }

            try:
                response = requests.get(GOOGLE_BOOKS_API_URL, params=params)

                if response.status_code == 200:
                    data = response.json()
                    total_items = data.get("totalItems", 0)
                    items = data.get("items", [])

                    if not items:
                        break

                    for item in items:
                        volume_info = item.get("volumeInfo", {})

                        if not all(key in volume_info for key in ["title", "authors"]):
                            continue

                        book_id = f"{volume_info.get('title')}|{','.join(volume_info.get('authors', []))}"

                        if book_id in books_set:
                            continue
                        books_set.add(book_id)

                        published_date = volume_info.get("publishedDate", "")
                        publication_year = None
                        if published_date and len(published_date) >= 4:
                            try:
                                publication_year = int(published_date[:4])
                            except ValueError:
                                pass

                        book_obj = {
                            "google_books_id": item.get("id"),
                            "title": volume_info.get("title"),
                            "author": ", ".join(volume_info.get("authors", ["Unknown"])),
                            "publication_year": publication_year,
                            "genre": ", ".join(volume_info.get("categories", ["Fiction"])),
                            "summary": volume_info.get("description", "No description available."),
                            "page_count": volume_info.get("pageCount"),
                            "image_links": volume_info.get("imageLinks", {})
                        }

                        all_books.append(book_obj)

                    print(f"Fetched {len(items)} books for query: '{query}' (startIndex: {start_index})")

                    if len(items) < 40:
                        break

                else:
                    print(f"Error fetching books for query '{query}': {response.status_code}")
                    break

                time.sleep(0.5)

            except Exception as e:
                print(f"Exception fetching books for query '{query}': {str(e)}")
                time.sleep(2)
                continue

        time.sleep(1)

    print(f"Total unique books found: {len(all_books)}")

    # Ensure the data directory exists
    os.makedirs(os.path.join(os.path.dirname(__file__), "data"), exist_ok=True)

    # Use absolute path for saving the file
    books_json_path = os.path.join(os.path.dirname(__file__), "data", "books.json")
    with open(books_json_path, "w") as f:
        json.dump(all_books, f, indent=2)

    print(f"Saved {len(all_books)} books to {books_json_path}")
    return all_books

if __name__ == "__main__":
    # This is no longer needed as we create the directory in the fetch_books function
    fetch_books() 
