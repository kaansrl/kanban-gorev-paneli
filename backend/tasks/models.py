from django.db import models
from django.contrib.auth.models import User


class Unit(models.Model):
    name = models.CharField(max_length=100, unique=True)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Birim"
        verbose_name_plural = "Birimler"


class Task(models.Model):

    STATUS_CHOICES = [
        ('beklemede', 'Beklemede'),
        ('devam', 'Devam Ediyor'),
        ('tamam', 'Tamamlandı'),
    ]

    PRIORITY_CHOICES = [
        ('dusuk', 'Düşük'),
        ('orta', 'Orta'),
        ('yuksek', 'Yüksek'),
    ]

    title = models.CharField(max_length=200)
    description = models.TextField()

    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='beklemede')
    priority = models.CharField(max_length=20, choices=PRIORITY_CHOICES)

    due_date = models.DateTimeField()

    assigned_unit = models.ForeignKey(Unit, on_delete=models.PROTECT)

    created_by = models.ForeignKey(User, on_delete=models.CASCADE)

    created_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.title


    def transfer_to(self, new_unit, note=None):
        old_unit = self.assigned_unit

        self.assigned_unit = new_unit
        self.save()

        TaskTransferHistory.objects.create(
            task=self,
            from_unit=old_unit,
            to_unit=new_unit,
            note=note
        )
    class Meta:
        verbose_name = "Görev"
        verbose_name_plural = "Görevler"


class TaskTransferHistory(models.Model):
    task = models.ForeignKey(Task, on_delete=models.CASCADE, related_name='transfer_history')

    from_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name='transfers_from'
    )

    to_unit = models.ForeignKey(
        Unit,
        on_delete=models.PROTECT,
        related_name='transfers_to'
    )

    transferred_at = models.DateTimeField(auto_now_add=True)

    note = models.TextField(blank=True, null=True)

    def __str__(self):
        return f"{self.task.title}: {self.from_unit} -> {self.to_unit}"

    class Meta:
        verbose_name = "Görev Devir Geçmişi"
        verbose_name_plural = "Görev Devir Geçmişleri"