define(
    ['jquery', 'underscore', 'backbone', 'edx-ui-toolkit/js/utils/spec-helpers/ajax-helpers',
        'js/views/course_video_settings', 'common/js/spec_helpers/template_helpers'],
    function($, _, Backbone, AjaxHelpers, CourseVideoSettingsView, TemplateHelpers) {
        'use strict';
        describe('CourseVideoSettingsView', function() {
            var $courseVideoSettingsEl,
                courseVideoSettingsView,
                renderCourseVideoSettingsView,
                activeTranscriptPreferences = {
                    'course_id': 'course-v1:edX+DemoX+Demo_Course',
                    'provider': 'Cielo24',
                    'cielo24_fidelity': 'PROFESSIONAL',
                    'cielo24_turnaround': 'PRIORITY',
                    'three_play_turnaround': 'same_day_service',
                    'preferred_languages': [
                        'ru',
                        'fr',
                        'pt',
                        'nl'
                    ],
                    'modified': '2017-08-27T12:28:17.421260Z'
                },
                videoTranscriptSettings = {
                    'transcript_preferences_handler_url': '/transcript_preferences/course-v1:edX+DemoX+Demo_Course',
                    'transcription_plans': {
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
                    }
                };

            renderCourseVideoSettingsView = function() {
                courseVideoSettingsView  = new CourseVideoSettingsView({
                    activeTranscriptPreferences: activeTranscriptPreferences,
                    videoTranscriptSettings: videoTranscriptSettings
                });
                $courseVideoSettingsEl = courseVideoSettingsView.render().$el;
            };

            beforeEach(function() {
                setFixtures('<div class="video-transcript-settings-wrapper"></div>');
                //setFixtures('<button class="button course-video-settings-button">');
                TemplateHelpers.installTemplate('course-video-settings');
                renderCourseVideoSettingsView();
            });

            it('renders as expected', function() {
                expect($courseVideoSettingsEl.find('.course-video-settings-container')).toExist();
            });
        });
    }
);
