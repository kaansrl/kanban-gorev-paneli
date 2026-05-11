from django.contrib.auth.models import User

from rest_framework import viewsets
from rest_framework.decorators import action
from rest_framework.response import Response
from rest_framework import status

from .models import Unit, Task, TaskTransferHistory
from .serializers import UnitSerializer, TaskSerializer, TaskTransferHistorySerializer


class UnitViewSet(viewsets.ModelViewSet):
    queryset = Unit.objects.all()
    serializer_class = UnitSerializer


class TaskViewSet(viewsets.ModelViewSet):
    queryset = Task.objects.all()
    serializer_class = TaskSerializer

    def perform_create(self, serializer):
        if self.request.user.is_authenticated:
            serializer.save(created_by=self.request.user)
        else:
            default_user = User.objects.first()
            serializer.save(created_by=default_user)

    @action(detail=True, methods=['post'])
    def transfer(self, request, pk=None):
        task = self.get_object()

        new_unit_id = request.data.get('new_unit_id')
        note = request.data.get('note')

        try:
            new_unit = Unit.objects.get(id=new_unit_id)

        except Unit.DoesNotExist:
            return Response(
                {"error": "Birim bulunamadı"},
                status=status.HTTP_404_NOT_FOUND
            )

        task.transfer_to(new_unit, note)

        return Response(
            {"message": "Görev devredildi"},
            status=status.HTTP_200_OK
        )


class TaskTransferHistoryViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = TaskTransferHistory.objects.all()
    serializer_class = TaskTransferHistorySerializer