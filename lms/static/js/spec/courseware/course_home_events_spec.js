define(['jquery', 'logger', 'js/courseware/course_home_events'], function($, Logger, courseHomeEvents) {
    'use strict';

    describe('Course home page eventing', function() {
        beforeEach(function() {
            loadFixtures('js/fixtures/courseware/course_home_events.html');
            courseHomeEvents();
            spyOn(Logger, 'log');
        });

        it('sends an event when "Resume Course" is clicked', function() {
            $('.last-accessed-link').click();
            expect(Logger.log).toHaveBeenCalledWith('edx.course.home.resume_course.clicked', {
                url: 'http://' +
                window.location.host +
                '/courses/course-v1:edX+DemoX+Demo_Course/courseware/19a30717eff543078a5d94ae9d6c18a5/'
            });
        });

        it('sends an event when "Upgrade to Verified" is clicked from the sidebar', function() {
            $('.date-summary-link').click();
            expect(Logger.log).toHaveBeenCalledWith('edx.course.enrollment.upgrade.clicked', {location: 'sidebar'});
        });

        it('sends an event when "Upgrade Now" is clicked from the upsell notification', function() {
            $('.upgrade-banner-button').click();
            expect(Logger.log).toHaveBeenCalledWith(
                'edx.course.enrollment.upgrade.clicked', {location: 'notification'}
            );
        });

        it('sends an event when "Learn More" is clicked from the upsell notification', function() {
            $('.view-verified-info').click();
            expect(Logger.log).toHaveBeenCalledWith(
                'edx.course.home.learn_about_verified.clicked', {location: 'notification'}
            );
        });
    });
});
