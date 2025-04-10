from django.contrib import admin
from .models import Media, Book, Movie, Review, Favorite, UserProfile

@admin.register(Media)
class MediaAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'media_type', 'genre', 'created_at')
    list_filter = ('media_type', 'genre')
    search_fields = ('title', 'genre')
    ordering = ('title',)
    
    actions = ['delete_selected']
    
    def delete_selected(self, request, queryset):
        for obj in queryset:
            obj.delete()
        self.message_user(request, f"Successfully deleted {queryset.count()} items.")
    delete_selected.short_description = "Delete selected items"
    
    def delete_model(self, request, obj):
        super().delete_model(request, obj)

@admin.register(Book)
class BookAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'authors_display', 'genre')
    list_filter = ('genre',)
    search_fields = ('title', 'authors')
    ordering = ('title',)
    
    def authors_display(self, obj):
        if hasattr(obj, 'authors') and obj.authors:
            if isinstance(obj.authors, list):
                return ', '.join(obj.authors)
            return obj.authors
        return '-'
    authors_display.short_description = 'Authors'

@admin.register(Movie)
class MovieAdmin(admin.ModelAdmin):
    list_display = ('id', 'title', 'director', 'genre', 'release_year')
    list_filter = ('genre', 'release_year')
    search_fields = ('title', 'director')
    ordering = ('title',)

@admin.register(Review)
class ReviewAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'media_title', 'rating', 'created_at')
    list_filter = ('rating', 'created_at')
    search_fields = ('user__username', 'media__title', 'review_text')
    ordering = ('-created_at',)
    
    def media_title(self, obj):
        return obj.media.title if obj.media else '-'
    media_title.short_description = 'Media'

@admin.register(Favorite)
class FavoriteAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'media_title')
    search_fields = ('user__username', 'media__title')
    ordering = ('-id',)
    
    def media_title(self, obj):
        return obj.media.title if obj.media else '-'
    media_title.short_description = 'Media'

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ('id', 'user', 'bio_preview')
    search_fields = ('user__username', 'bio')
    
    def bio_preview(self, obj):
        if obj.bio:
            return obj.bio[:50] + '...' if len(obj.bio) > 50 else obj.bio
        return '-'
    bio_preview.short_description = 'Bio Preview' 