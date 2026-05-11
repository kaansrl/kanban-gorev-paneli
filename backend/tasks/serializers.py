from rest_framework import serializers
from .models import Unit, Task, TaskTransferHistory


class UnitSerializer(serializers.ModelSerializer):
    class Meta:
        model = Unit
        fields = '__all__'


class TaskTransferHistorySerializer(serializers.ModelSerializer):
    from_unit_name = serializers.CharField(source='from_unit.name', read_only=True)
    to_unit_name = serializers.CharField(source='to_unit.name', read_only=True)

    class Meta:
        model = TaskTransferHistory
        fields = [
            'id',
            'task',
            'from_unit',
            'from_unit_name',
            'to_unit',
            'to_unit_name',
            'transferred_at',
            'note',
        ]


class TaskSerializer(serializers.ModelSerializer):
    assigned_unit_name = serializers.CharField(source='assigned_unit.name', read_only=True)
    created_by_username = serializers.CharField(source='created_by.username', read_only=True)
    transfer_history = TaskTransferHistorySerializer(many=True, read_only=True)

    class Meta:
        model = Task
        fields = [
            'id',
            'title',
            'description',
            'status',
            'priority',
            'due_date',
            'assigned_unit',
            'assigned_unit_name',
            'created_by',
            'created_by_username',
            'created_at',
            'transfer_history',
        ]

        read_only_fields = [
            'created_by',
            'created_at',
            'transfer_history',
        ]