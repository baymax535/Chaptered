import os
import json
from django.core.management.base import BaseCommand
from api.models import Book, Movie
from faker import Faker
from django.conf import settings
from pathlib import Path

class Command(BaseCommand):
    help = 'Populate the database with books and movies from JSON files'

    def handle(self, *args, **options):
        self.stdout.write(self.style.SUCCESS('Starting database population...'))

        book_count = Book.objects.count()
        movie_count = Movie.objects.count()

        if book_count < 50:
            self.stdout.write(self.style.SUCCESS('Creating additional dummy books...'))
            self.create_dummy_books(50 - book_count)

        if movie_count < 50:
            self.stdout.write(self.style.SUCCESS('Creating additional dummy movies...'))
            self.create_dummy_movies(50 - movie_count)

        self.populate_books()
        self.populate_movies()

        self.stdout.write(self.style.SUCCESS('Database population completed!'))

    def populate_books(self):
        try:
            books_path = os.path.join(settings.BASE_DIR, "scripts", "data", "books.json")
            self.stdout.write(self.style.SUCCESS(f'Looking for books at: {books_path}'))
            with open(books_path, "r") as f:
                books_data = json.load(f)

            count = 0
            skipped = 0
            for i, book_data in enumerate(books_data):
                try:
                    if not book_data.get('title') or not book_data.get('author'):
                        self.stdout.write(self.style.WARNING(f'Skipping book at index {i}: Missing title or author'))
                        skipped += 1
                        continue

                    publication_year = book_data.get('publication_year') or 2000

                    book, created = Book.objects.get_or_create(
                        title=book_data.get('title'),
                        defaults={
                            'author': book_data.get('author'),
                            'publication_year': publication_year,
                            'genre': book_data.get('genre', 'Fiction'),
                            'summary': book_data.get('summary', 'No summary available.'),
                            'media_type': 'book'
                        }
                    )

                    if created:
                        count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing book at index {i}: {str(e)}'))
                    skipped += 1

            self.stdout.write(self.style.SUCCESS(f'Added {count} new books to database (skipped {skipped} books)'))

        except FileNotFoundError:
            self.stdout.write(self.style.WARNING('Books data file not found. Run fetch_books.py first.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error populating books: {str(e)}'))

    def populate_movies(self):
        try:
            movies_path = os.path.join(settings.BASE_DIR, "scripts", "data", "movies.json")
            self.stdout.write(self.style.SUCCESS(f'Looking for movies at: {movies_path}'))
            with open(movies_path, "r") as f:
                movies_data = json.load(f)

            count = 0
            skipped = 0
            for i, movie_data in enumerate(movies_data):
                try:
                    if not movie_data.get('title') or not movie_data.get('director'):
                        self.stdout.write(self.style.WARNING(f'Skipping movie at index {i}: Missing title or director'))
                        skipped += 1
                        continue

                    release_year = movie_data.get('release_year') or 2000

                    movie, created = Movie.objects.get_or_create(
                        title=movie_data.get('title'),
                        defaults={
                            'director': movie_data.get('director'),
                            'release_year': release_year,
                            'genre': movie_data.get('genre', 'Drama'),
                            'summary': movie_data.get('summary', 'No summary available.'),
                            'media_type': 'movie'
                        }
                    )

                    if created:
                        count += 1
                except Exception as e:
                    self.stdout.write(self.style.ERROR(f'Error processing movie at index {i}: {str(e)}'))
                    skipped += 1

            self.stdout.write(self.style.SUCCESS(f'Added {count} new movies to database'))

        except FileNotFoundError:
            self.stdout.write(self.style.WARNING('Movies data file not found. Run fetch_movies.py first.'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'Error populating movies: {str(e)}'))

    def create_dummy_books(self, count):
        fake = Faker()

        genres = ['Fiction', 'Science Fiction', 'Fantasy', 'Mystery', 'Thriller', 
                  'Romance', 'Historical Fiction', 'Biography', 'Self-Help', 'Business']

        for i in range(count):
            year = fake.random_int(min=1900, max=2023)
            Book.objects.create(
                title=fake.catch_phrase(),
                author=fake.name(),
                publication_year=year,
                genre=fake.random_element(genres),
                summary=fake.paragraph(nb_sentences=5),
                media_type='book'
            )

    def create_dummy_movies(self, count):
        fake = Faker()

        genres = ['Action', 'Comedy', 'Drama', 'Science Fiction', 'Horror', 
                  'Romance', 'Thriller', 'Animation', 'Documentary', 'Fantasy']

        for i in range(count):
            year = fake.random_int(min=1950, max=2023)
            Movie.objects.create(
                title=fake.catch_phrase(),
                director=fake.name(),
                release_year=year,
                genre=fake.random_element(genres),
                summary=fake.paragraph(nb_sentences=5),
                media_type='movie'
            ) 
