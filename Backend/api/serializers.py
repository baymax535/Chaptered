from rest_framework import serializers
from django.contrib.auth.models import User
from .models import Media, Book, Movie, Review, Favorite, UserProfile

class UserSerializer(serializers.ModelSerializer):
    """Serializer for the User model"""
    class Meta:
        model = User
        fields = ['id', 'username', 'email', 'date_joined']
        read_only_fields = ['date_joined']

class UserProfileSerializer(serializers.ModelSerializer):
    """Serializer for the UserProfile model"""
    username = serializers.CharField(source='user.username', read_only=True)
    email = serializers.EmailField(source='user.email', read_only=True)
    
    class Meta:
        model = UserProfile
        fields = ['user', 'username', 'email', 'bio', 'profile_picture']
        read_only_fields = ['user']

class MediaSerializer(serializers.ModelSerializer):
    """Base serializer for Media model"""
    class Meta:
        model = Media
        fields = ['id', 'title', 'genre', 'summary', 'media_type', 'created_at']
        read_only_fields = ['media_type', 'created_at']

class BookSerializer(serializers.ModelSerializer):
    """Serializer for Book model"""
    avg_rating = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Book
        fields = ['id', 'title', 'author', 'genre', 'publication_year', 'summary', 'avg_rating']
    
    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / len(reviews)
        return None

class MovieSerializer(serializers.ModelSerializer):
    """Serializer for Movie model"""
    avg_rating = serializers.SerializerMethodField(read_only=True)
    
    class Meta:
        model = Movie
        fields = ['id', 'title', 'director', 'genre', 'release_year', 'summary', 'avg_rating']
    
    def get_avg_rating(self, obj):
        reviews = obj.reviews.all()
        if reviews:
            return sum(review.rating for review in reviews) / len(reviews)
        return None

class ReviewSerializer(serializers.ModelSerializer):
    """Serializer for Review model"""
    username = serializers.CharField(source='user.username', read_only=True)
    
    class Meta:
        model = Review
        fields = ['id', 'user', 'username', 'media', 'rating', 'review_text', 'created_at', 'updated_at']
        read_only_fields = ['user', 'created_at', 'updated_at']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class FavoriteSerializer(serializers.ModelSerializer):
    """Serializer for Favorite model"""
    title = serializers.CharField(source='media.title', read_only=True)
    media_type = serializers.CharField(source='media.media_type', read_only=True)
    
    class Meta:
        model = Favorite
        fields = ['id', 'user', 'media', 'title', 'media_type', 'list_type', 'date_added']
        read_only_fields = ['user', 'date_added']
    
    def create(self, validated_data):
        validated_data['user'] = self.context['request'].user
        return super().create(validated_data)

class UserRegistrationSerializer(serializers.ModelSerializer):
    """Serializer for user registration"""
    password = serializers.CharField(write_only=True)
    password_confirm = serializers.CharField(write_only=True)
    
    class Meta:
        model = User
        fields = ['username', 'email', 'password', 'password_confirm']
    
    def validate(self, data):
        if data['password'] != data['password_confirm']:
            raise serializers.ValidationError({"password": "Passwords must match."})
        return data
    
    def create(self, validated_data):
        validated_data.pop('password_confirm')
        user = User.objects.create_user(
            username=validated_data['username'],
            email=validated_data['email'],
            password=validated_data['password']
        )
        UserProfile.objects.create(user=user)
        return user 