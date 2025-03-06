from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

class Media(models.Model):
    """Base model for Books and Movies"""
    MEDIA_TYPES = (
        ('book', 'Book'),
        ('movie', 'Movie'),
    )
    
    title = models.CharField(max_length=255)
    genre = models.CharField(max_length=100)
    summary = models.TextField()
    media_type = models.CharField(max_length=5, choices=MEDIA_TYPES)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        verbose_name_plural = "Media"
    
    def __str__(self):
        return f"{self.title} ({self.media_type})"

class Book(Media):
    """Book model extending the Media model"""
    author = models.CharField(max_length=255)
    publication_year = models.PositiveIntegerField()
    
    def save(self, *args, **kwargs):
        self.media_type = 'book'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} by {self.author}"

class Movie(Media):
    """Movie model extending the Media model"""
    director = models.CharField(max_length=255)
    release_year = models.PositiveIntegerField()
    
    def save(self, *args, **kwargs):
        self.media_type = 'movie'
        super().save(*args, **kwargs)
    
    def __str__(self):
        return f"{self.title} ({self.release_year})"

class Review(models.Model):
    """Review model for both books and movies"""
    RATING_CHOICES = [(i, i) for i in range(1, 6)]  # 1-5 star rating
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='reviews')
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name='reviews')
    rating = models.PositiveSmallIntegerField(choices=RATING_CHOICES)
    review_text = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        unique_together = ('user', 'media')
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.user.username}'s review of {self.media.title}"

class Favorite(models.Model):
    """User favorites/wishlist model"""
    LIST_TYPES = (
        ('favorite', 'Favorite'),
        ('wishlist', 'Wishlist'),
    )
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='favorites')
    media = models.ForeignKey(Media, on_delete=models.CASCADE, related_name='favorited_by')
    list_type = models.CharField(max_length=10, choices=LIST_TYPES, default='favorite')
    date_added = models.DateTimeField(default=timezone.now)
    
    class Meta:
        unique_together = ('user', 'media', 'list_type')
        ordering = ['-date_added']
    
    def __str__(self):
        return f"{self.user.username}'s {self.list_type}: {self.media.title}"

class UserProfile(models.Model):
    """Extended user profile"""
    user = models.OneToOneField(User, on_delete=models.CASCADE, related_name='profile')
    bio = models.TextField(blank=True)
    profile_picture = models.URLField(blank=True)
    
    def __str__(self):
        return f"{self.user.username}'s profile" 