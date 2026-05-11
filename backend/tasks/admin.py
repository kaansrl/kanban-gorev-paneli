from django.contrib import admin
from .models import Task, Unit, TaskTransferHistory

admin.site.register(Unit)
admin.site.register(Task)
admin.site.register(TaskTransferHistory)