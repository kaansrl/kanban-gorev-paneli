from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UnitViewSet, TaskViewSet, TaskTransferHistoryViewSet


router = DefaultRouter()
router.register(r'units', UnitViewSet)
router.register(r'tasks', TaskViewSet)
router.register(r'transfer-history', TaskTransferHistoryViewSet)


urlpatterns = [
    path('', include(router.urls)),
]