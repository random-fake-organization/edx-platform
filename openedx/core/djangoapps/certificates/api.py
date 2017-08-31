"""
The public API for certificates.
"""

from openedx.core.djangoapps.certificates.config import waffle


SWITCHES = waffle.waffle()


def auto_certificate_generation_enabled():
    return (
        SWITCHES.is_enabled(waffle.SELF_PACED_ONLY) or
        SWITCHES.is_enabled(waffle.INSTRUCTOR_PACED_ONLY)
    )


def auto_certificate_generation_enabled_for_course(self_paced):
    if not auto_certificate_generation_enabled():
        return False

    if self_paced:
        if not SWITCHES.is_enabled(waffle.SELF_PACED_ONLY):
            return False
    else:
        if not SWITCHES.is_enabled(waffle.INSTRUCTOR_PACED_ONLY):
            return False

    return True


def _enabled_and_self_paced(self_paced):
    if auto_certificate_generation_enabled_for_course(self_paced):
        return not self_paced
    return False


def can_validate_certificate_available_date_field(self_paced):
    return _enabled_and_self_paced(self_paced)


def can_show_certificate_available_date_field(self_paced):
    return _enabled_and_self_paced(self_paced)
