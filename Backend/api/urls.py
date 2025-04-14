from django.urls import path, include
from rest_framework.routers import DefaultRouter
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView

from .views import (
    UserRegistrationView, UserProfileViewSet, BookViewSet,
    MovieViewSet, ReviewViewSet, FavoriteViewSet,
<<<<<<< HEAD
    user_favorites, media_recommendations,
    latest_books, latest_movies
=======
    user_favorites, media_recommendations
>>>>>>> e52135338f7de1e3520460255b08674c7b8495c2
)

router = DefaultRouter()
router.register(r'profiles', UserProfileViewSet)
router.register(r'books', BookViewSet)
router.register(r'movies', MovieViewSet)
router.register(r'reviews', ReviewViewSet)
router.register(r'favorites', FavoriteViewSet, basename='favorite')

urlpatterns = [
    path('', include(router.urls)),
    
    path('auth/register/', UserRegistrationView.as_view(), name='register'),
    path('auth/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('auth/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
    
    path('user/favorites/', user_favorites, name='user-favorites'),
    path('recommendations/', media_recommendations, name='media-recommendations'),
<<<<<<< HEAD

    path('latest/books/', latest_books, name='latest-books'),
    path('latest/movies/', latest_movies, name='latest-movies'),

=======
>>>>>>> e52135338f7de1e3520460255b08674c7b8495c2
] 