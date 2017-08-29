define(
    ['jquery', 'underscore', 'backbone', 'edx-ui-toolkit/js/utils/spec-helpers/ajax-helpers',
        'js/views/course_video_settings', 'common/js/spec_helpers/template_helpers'],
    function($, _, Backbone, AjaxHelpers, CourseVideoSettingsView, TemplateHelpers) {
        'use strict';
        describe('CourseVideoSettingsView', function() {
            var $courseVideoSettingsEl,
                courseVideoSettingsView,
                renderCourseVideoSettingsView,
                destroyCourseVideoSettingsView,
                transcript_preferences_handler_url = '/transcript_preferences/course-v1:edX+DemoX+Demo_Course',
                activeTranscriptPreferences = {
                    'provider': 'Cielo24',
                    'cielo24_fidelity': 'PROFESSIONAL',
                    'cielo24_turnaround': 'PRIORITY',
                    'three_play_turnaround': '',
                    'preferred_languages': [
                        'ru',
                        'fr',
                        'pt',
                        'nl'
                    ],
                    'modified': '2017-08-27T12:28:17.421260Z'
                },
                transcription_plans = {
                    '3PlayMedia': {
                        'languages': {
                            'fr': 'French',
                            'en': 'English',
                            'ms': 'Malay',
                            'tr': 'Turkish',
                            'de': 'German',
                            'it': 'Italian',
                            'da': 'Danish',
                            'ar': 'Arabic',
                            'uk': 'Ukrainian',
                            'bg': 'Bulgarian',
                            'cs': 'Czech',
                            'fi': 'Finnish',
                            'hu': 'Hungarian',
                            'ja': 'Japanese',
                            'he': 'Hebrew',
                            'ru': 'Russian',
                            'ro': 'Romanian',
                            'nl': 'Dutch',
                            'pt': 'Portuguese',
                            'no': 'Norwegian',
                            'zh-hans': 'Chinese (Simplified)',
                            'sr': 'Serbian',
                            'ko': 'Korean',
                            'sv': 'Swedish',
                            'id': 'Indonesian',
                            'sk': 'Slovak',
                            'tl': 'Tagalog',
                            'th': 'Thai',
                            'vi': 'Vietnamese',
                            'es-419': 'Spanish (Latin America)',
                            'zh-cmn-Hant': 'Chinese (Traditional)',
                            'pl': 'Polish'
                        },
                        'turnaround': {
                            'default': '4-Day/Default',
                            'same_day_service': 'Same Day',
                            'rush_service': '24-hour/Rush',
                            'extended_service': '10-Day/Extended',
                            'expedited_service': '2-Day/Expedited'
                        },
                        'display_name': '3PlayMedia'
                    },
                    'Cielo24': {
                        'turnaround': {
                            'PRIORITY': 'Priority, 24h',
                            'STANDARD': 'Standard, 48h'
                        },
                        'fidelity': {
                        'PROFESSIONAL': {
                            'languages': {
                                'ru': 'Russian',
                                'fr': 'French',
                                'en': 'English',
                                'nl': 'Dutch',
                                'pt': 'Portuguese',
                                'zh-yue': 'Chinese - Cantonese (Traditional)',
                                'zh-tw': 'Chinese - Mandarin (Traditional)',
                                'de': 'German',
                                'ko': 'Korean',
                                'zh-cmn': 'Chinese - Mandarin (Simplified)',
                                'it': 'Italian',
                                'tr': 'Turkish',
                                'ar': 'Arabic',
                                'hi': 'Hindi',
                                'ja': 'Japanese',
                                'es': 'Spanish',
                                'he': 'Hebrew'
                            },
                            'display_name': 'Professional, 99% Accuracy'
                        },
                        'PREMIUM': {
                            'languages': {
                                'en': 'English'
                            },
                            'display_name': 'Premium, 95% Accuracy'
                        },
                        'MECHANICAL': {
                            'languages': {
                                'fr': 'French',
                                'en': 'English',
                                'nl': 'Dutch',
                                'de': 'German',
                                'it': 'Italian',
                                'es': 'Spanish'
                            },
                            'display_name': 'Mechanical, 75% Accuracy'
                            }
                        },
                        'display_name': 'Cielo24'
                    }
                };

            renderCourseVideoSettingsView = function(activeTranscriptPreferences, transcription_plans) {
                courseVideoSettingsView  = new CourseVideoSettingsView({
                    activeTranscriptPreferences: activeTranscriptPreferences || null,
                    videoTranscriptSettings: {
                        transcript_preferences_handler_url: transcript_preferences_handler_url,
                        transcription_plans: transcription_plans || null
                    }
                });
                $courseVideoSettingsEl = courseVideoSettingsView.render().$el;
            };

            destroyCourseVideoSettingsView = function() {
                if (courseVideoSettingsView) {
                    courseVideoSettingsView.closeCourseVideoSettings();
                    courseVideoSettingsView = null;
                }
            };

            beforeEach(function() {
                setFixtures(
                    '<div class="video-transcript-settings-wrapper"></div>' +
                    '<button class="button course-video-settings-button"></button>'
                );
                TemplateHelpers.installTemplate('course-video-settings');
                renderCourseVideoSettingsView(activeTranscriptPreferences, transcription_plans);
            });

            afterEach(function() {
                destroyCourseVideoSettingsView();
            });

            it('renders as expected', function() {
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).toExist();
            });

            it('closes course video settings pane when close button is clicked', function() {
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).toExist();
                $courseVideoSettingsEl.find('.action-close-course-video-settings').click();
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).not.toExist();
            });

            it('closes course video settings pane when clicked outside course video settings pane', function() {
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).toExist();
                $('body').click();
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).not.toExist();
            });

            it('does not close course video settings pane when clicked inside the course video settings pane', function() {
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).toExist();
                $courseVideoSettingsEl.find('.transcript-provider-group').click();
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).toExist();
            });

            it('does not populate transcription plans if transcription plans are not provided', function() {
                // First detroy old referance to the view.
                destroyCourseVideoSettingsView();

                // Create view with empty data.
                renderCourseVideoSettingsView(null, null);

                expect($courseVideoSettingsEl.find('.transcript-provider-group').html()).toEqual('');
                expect($courseVideoSettingsEl.find('#transcript-turnaround').html()).toEqual('');
                expect($courseVideoSettingsEl.find('#transcript-fidelity').html()).toEqual('');
                expect($courseVideoSettingsEl.find('.languages-menu-container').html()).toEqual('');
            });

            it('populates transcription plans correctly', function() {
                // Only check transcript-provider radio buttons for now, because other preferances are based on either
                // user selection or activeTranscriptPreferences.
                expect($courseVideoSettingsEl.find('.transcript-provider-group').html()).not.toEqual('');
            });

            it('populates active preferances correctly', function() {
                // First check preferance are selected correctly in HTML.
                expect($courseVideoSettingsEl.find('.transcript-provider-group input:checked').val()).toEqual(
                    activeTranscriptPreferences.provider
                );
                expect($courseVideoSettingsEl.find('#transcript-turnaround').val()).toEqual(
                    activeTranscriptPreferences.cielo24_turnaround
                );
                expect($courseVideoSettingsEl.find('#transcript-fidelity').val()).toEqual(
                    activeTranscriptPreferences.cielo24_fidelity
                );
                expect(
                    $courseVideoSettingsEl.find('.languages-menu-container .transcript-language-menu-container:not(:has(.transcript-language-menu))').length
                ).toEqual(activeTranscriptPreferences.preferred_languages.length);

                // Now check values are assigned correctly.
                expect(courseVideoSettingsView.selectedProvider, activeTranscriptPreferences.provider);
                expect(courseVideoSettingsView.selectedTurnaroundPlan, activeTranscriptPreferences.cielo24_turnaround);
                expect(courseVideoSettingsView.selectedFidelityPlan, activeTranscriptPreferences.cielo24_fidelity);
                expect(courseVideoSettingsView.selectedLanguages, activeTranscriptPreferences.preferred_languages);
            });
        });
    }
);
