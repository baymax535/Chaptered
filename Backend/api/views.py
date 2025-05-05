from rest_framework import viewsets, permissions, status, generics, filters
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework_simplejwt.tokens import RefreshToken
from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from django_filters.rest_framework import DjangoFilterBackend

from .models import Media, Book, Movie, Review, Favorite, UserProfile
from .serializers import (
    UserSerializer, UserProfileSerializer, MediaSerializer,
    BookSerializer, MovieSerializer, ReviewSerializer,
    FavoriteSerializer, UserRegistrationSerializer
)

class UserRegistrationView(generics.CreateAPIView):
    """View for user registration"""
    serializer_class = UserRegistrationSerializer
    permission_classes = [permissions.AllowAny]
    
    def post(self, request, *args, **kwargs):
        serializer = self.serializer_class(data=request.data)
        if serializer.is_valid():
            user = serializer.save()
            refresh = RefreshToken.for_user(user)
            return Response({
                'refresh': str(refresh),
                'access': str(refresh.access_token),
                'user': UserSerializer(user).data
            }, status=status.HTTP_201_CREATED)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class UserProfileViewSet(viewsets.ModelViewSet):
    """ViewSet for UserProfile model"""
    queryset = UserProfile.objects.all()
    serializer_class = UserProfileSerializer
    permission_classes = [permissions.IsAuthenticated]
    pagination_class = None 

    def get_queryset(self):
        if self.action == 'list':
            return UserProfile.objects.filter(user=self.request.user)
        return UserProfile.objects.all()
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

class BookViewSet(viewsets.ModelViewSet):
    """ViewSet for the Book model"""
    queryset = Book.objects.all().order_by('id')
    serializer_class = BookSerializer
    filter_backends = [filters.SearchFilter, filters.OrderingFilter]
    search_fields = ['title', 'author', 'genre', 'summary']
    ordering_fields = ['title', 'author', 'publication_year']
    pagination_class = None
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]

class MovieViewSet(viewsets.ModelViewSet):
    """ViewSet for Movie model"""
    queryset = Movie.objects.all().order_by('id')
    serializer_class = MovieSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['genre', 'release_year']
    search_fields = ['title', 'director', 'summary', 'genre']
    ordering_fields = ['title', 'release_year']
    pagination_class = None

class ReviewViewSet(viewsets.ModelViewSet):
    """ViewSet for Review model"""
    queryset = Review.objects.all()
    serializer_class = ReviewSerializer
    filter_backends = [DjangoFilterBackend, filters.OrderingFilter]
    filterset_fields = ['media', 'user', 'rating']
    ordering_fields = ['created_at', 'rating']
    
    def get_permissions(self):
        if self.action in ['list', 'retrieve']:
            return [permissions.AllowAny()]
        return [permissions.IsAuthenticated()]
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)
    
    def get_queryset(self):
        queryset = Review.objects.all()
        media_id = self.request.query_params.get('media_id')
        book_id = self.request.query_params.get('book_id')
        movie_id = self.request.query_params.get('movie_id')
        
        if media_id:
            queryset = queryset.filter(media_id=media_id)
        elif book_id:
            queryset = queryset.filter(media_id=book_id)
        elif movie_id:
            queryset = queryset.filter(media_id=movie_id)
            
        return queryset

class FavoriteViewSet(viewsets.ModelViewSet):
    """ViewSet for Favorite model"""
    serializer_class = FavoriteSerializer
    permission_classes = [IsAuthenticated]
    
    def get_queryset(self):
        return Favorite.objects.filter(user=self.request.user)
    
    def perform_create(self, serializer):
        serializer.save(user=self.request.user)

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def user_favorites(request):
    """Get user's favorites and wishlists"""
    favorites = Favorite.objects.filter(user=request.user, list_type='favorite')
    wishlist = Favorite.objects.filter(user=request.user, list_type='wishlist')
    return Response({
        'favorites': FavoriteSerializer(favorites, many=True).data,
        'wishlist': FavoriteSerializer(wishlist, many=True).data
    })

@api_view(['POST'])
@permission_classes([IsAuthenticated])
def password_change(request):
    """
    Allow an authenticated user to change their password.
    Expects: { "new_password": "..." }
    """
    user = request.user
    new_password = request.data.get('new_password')
    if not new_password:
        return Response({'detail': 'New password required.'}, status=status.HTTP_400_BAD_REQUEST)
    user.set_password(new_password)
    user.save()
    return Response({'detail': 'Password updated successfully.'})

@api_view(['GET'])
def media_recommendations(request):
    """Get media recommendations based on user preferences or general popularity"""
    if request.user.is_authenticated:
        reviewed_media = Media.objects.filter(reviews__user=request.user)
        user_genres = reviewed_media.values_list('genre', flat=True).distinct()
        
        recommendations = Media.objects.filter(genre__in=user_genres).exclude(reviews__user=request.user)[:10]
        
        if recommendations:
            return Response({
                'personalized': True,
                'books': BookSerializer(recommendations.filter(media_type='book'), many=True).data,
                'movies': MovieSerializer(recommendations.filter(media_type='movie'), many=True).data
            })
    
    top_books = Book.objects.all().order_by('-reviews__rating')[:5]
    top_movies = Movie.objects.all().order_by('-reviews__rating')[:5]
    
    return Response({
        'personalized': False,
        'books': BookSerializer(top_books, many=True).data,
        'movies': MovieSerializer(top_movies, many=True).data
    })

@api_view(['GET'])
def latest_books(request):
    """Return the 5 newest books"""
    newest = Book.objects.order_by('-publication_year')[:5]
    return Response(BookSerializer(newest, many=True).data)

@api_view(['GET'])
def latest_movies(request):
    """Return the 5 newest movies"""
    newest = Movie.objects.order_by('-release_year')[:5]
    return Response(MovieSerializer(newest, many=True).data)
