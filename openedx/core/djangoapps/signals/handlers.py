"""
This module contains all general use or cross-use handlers.
"""
import logging

from celery.task import task
from django.dispatch import receiver

from opaque_keys.edx.keys import CourseKey
from signals import COURSE_PACING_CHANGE

log = logging.getLogger(__name__)