from django.http import JsonResponse

def index(request):
    """
    API information endpoint that returns info about the API
    This endpoint is useful for the React frontend to check if the API is running
    """
    return JsonResponse({
        'api_name': 'Chaptered API',
        'version': '1.0.0',
        'status': 'running',
        'message': 'Connection successful!',
        'endpoints': {
            'api_root': '/api/',
            'books': '/api/books/',
            'movies': '/api/movies/',
            'reviews': '/api/reviews/',
            'authentication': '/api/auth/token/',
        }
    })

def test_connection(request):
    """Simple endpoint to test API connectivity"""
    return JsonResponse({
        'status': 'success',
        'message': 'API connection is working!'
    }) 