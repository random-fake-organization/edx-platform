/**
 * CourseVideoSettingsView shows a sidebar containing course wide video settings.
 */
define([
    'jquery', 'backbone', 'underscore', 'gettext', 'moment',
    'edx-ui-toolkit/js/utils/html-utils',
    'edx-ui-toolkit/js/utils/string-utils',
    'text!templates/course-video-settings.underscore'
],
function($, Backbone, _, gettext, moment, HtmlUtils, StringUtils, TranscriptSettingsTemplate) {
    'use strict';

    var CourseVideoSettingsView = Backbone.View.extend({
        el: 'div.video-transcript-settings-wrapper',

        events: {
            'change .transcript-provider-group input': 'providerSelected',
            'change #transcript-turnaround': 'turnaroundSelected',
            'change #transcript-fidelity': 'fidelitySelected',
            'click .action-add-language': 'languageAdded',
            'click .action-remove-language': 'languageRemoved',
            'click .action-update-course-video-settings': 'updateCourseVideoSettings',
            'click .action-close-course-video-settings': 'closeCourseVideoSettings'
        },

        initialize: function(options) {
            var videoTranscriptSettings = options.videoTranscriptSettings;
            this.activeTranscriptionPlan = options.activeTranscriptPreferences;
            this.availableTranscriptionPlans = videoTranscriptSettings['transcription_plans'];
            this.transcriptHandlerUrl = videoTranscriptSettings['transcript_preferences_handler_url'];
            this.template = HtmlUtils.template(TranscriptSettingsTemplate);
            this.setActiveTranscriptPlanData();
            this.selectedLanguages = [];
            this.listenTo(Backbone, 'coursevideosettings:showCourseVideoSettingsView', this.render);
        },

        registerCloseClickHandler: function() {
            var self = this;

            // Preventing any parent handlers from being notified of the event. This is to stop from firing the document
            // level click handler to execute on course video settings pane click.
            self.$el.click(function(event){
                event.stopPropagation();
            });

            // Click anywhere outside the course video settings pane would close the pane.
            $(document).click(function(event){
                // if the target of the click isn't the container nor a descendant of the contain
                if (!self.$el.is(event.target) && self.$el.has(event.target).length === 0) {
                    self.closeCourseVideoSettings();
                }
            });
        },

        resetPlanData: function() {
            this.selectedProvider = '';
            this.selectedTurnaroundPlan = '';
            this.selectedFidelityPlan = '';
            this.availableLanguages = [];
            this.activeLanguages = [];
            this.selectedLanguages = [];
        },

        setActiveTranscriptPlanData: function(){
            if (this.activeTranscriptionPlan) {
                this.selectedProvider = this.activeTranscriptionPlan['provider'];
                this.selectedFidelityPlan = this.activeTranscriptionPlan['cielo24_fidelity'];
                this.selectedTurnaroundPlan = this.selectedProvider === 'Cielo24' ? this.activeTranscriptionPlan['cielo24_turnaround']: this.activeTranscriptionPlan['three_play_turnaround'];
                this.activeLanguages = this.activeTranscriptionPlan['preferred_languages'];
            } else {
                this.resetPlanData();
            }
        },

        getProviderPlan: function() {
            return this.availableTranscriptionPlans;
        },

        getTurnaroundPlan: function() {
            if (this.selectedProvider){
                return this.availableTranscriptionPlans[this.selectedProvider].turnaround;
            }
        },

        getFidelityPlan: function() {
            if (this.selectedProvider == 'Cielo24') {
                return this.availableTranscriptionPlans[this.selectedProvider].fidelity;
            }
        },

        getPlanLanguages: function() {
            if (this.selectedProvider){
                var selectedPlan = this.availableTranscriptionPlans[this.selectedProvider];
                if (this.selectedProvider == 'Cielo24') {
                    return selectedPlan.fidelity[this.selectedFidelityPlan].languages;
                }
                return selectedPlan.languages;
            }
        },

        fidelitySelected: function(event) {
            this.selectedFidelityPlan = event.target.value;
            this.populateLanguages();
        },

        turnaroundSelected: function(event) {
            this.selectedTurnaroundPlan = event.target.value;
            this.populateLanguages();
        },

        providerSelected: function(event) {
            this.resetPlanData();
            this.selectedProvider = event.target.value;
            this.populatePreferences();
        },

        languageAdded: function(event) {
            var $parentEl = $(event.target.parentElement).parent(),
                $languagesEl = this.$el.find('.transcript-languages-wrapper'),
                selectedLanguage = $parentEl.find('select').val(),
                requiredText = gettext('Required'),
                infoIconHtml = HtmlUtils.HTML('<span class="icon fa fa-info-circle" aria-hidden="true"></span>');

            // Only add if not in the list already.
            if (selectedLanguage && _.indexOf(this.selectedLanguages, selectedLanguage) === -1) {
                this.selectedLanguages.push(selectedLanguage);
                HtmlUtils.setHtml(
                    $parentEl,
                    HtmlUtils.joinHtml(
                        HtmlUtils.interpolateHtml(
                            HtmlUtils.HTML('<span>{languageDisplayName}</span>'),
                            {
                                languageDisplayName: this.availableLanguages[selectedLanguage]
                            }
                        ),
                        HtmlUtils.interpolateHtml(
                            HtmlUtils.HTML('<div class="remove-language-action"><button class="button-link action-remove-language" data-language-code="{languageCode}">{text}<span class="sr">{srText}</span></button></div>'),
                            {
                                languageCode: selectedLanguage,
                                text: gettext('Remove'),
                                srText: gettext('Press Remove to remove language')
                            }
                        )
                    )
                );

                // Add a new language menu
                this.addLanguageMenu();

                // Remove any error if present already.
                this.clearPreferanceErrorState($languagesEl);
            } else {
                $languagesEl.addClass('error');
                HtmlUtils.setHtml(
                    $languagesEl.find('.error-icon'),
                    infoIconHtml
                );
                HtmlUtils.setHtml(
                    $languagesEl.find('.error-info'),
                    requiredText
                );
            }
        },

        languageRemoved: function(event) {
            var selectedLanguage = $(event.target).data('language-code');
            $(event.target.parentElement).parent().remove();
            this.selectedLanguages.pop(selectedLanguage);
        },

        populateProvider: function() {
            var self = this,
                providerPlan = self.getProviderPlan(),
                $providerEl = self.$el.find('.transcript-provider-group');
            // Provider dropdown
            $providerEl.empty();
            HtmlUtils.setHtml(
                $providerEl,
                HtmlUtils.interpolateHtml(
                    HtmlUtils.HTML('<input type="radio" id="transcript-provider-none" name="transcript-provider" value="" {checked}/><label for="transcript-provider-none">{text}</label>'),
                    {
                        text: gettext('None'),
                        checked: self.selectedProvider === '' ? 'checked' : ''
                    }
                )
            );

            _.each(providerPlan, function(providerObject, key){
                var checked = self.selectedProvider === key ? 'checked' : '';
                HtmlUtils.append(
                    $providerEl,
                    HtmlUtils.interpolateHtml(
                        HtmlUtils.HTML('<input type="radio" id="transcript-provider-{value}" name="transcript-provider" value="{value}" {checked}/><label for="transcript-provider-{value}">{text}'),
                        {
                            text: providerObject.display_name,
                            value: key,
                            checked: checked
                        }
                    )
                )
            });
        },

        populateTurnaround: function() {
            var self = this,
                turnaroundPlan = self.getTurnaroundPlan(),
                $turnaroundContainer = self.$el.find('.transcript-turnaround-wrapper'),
                $turnaround = self.$el.find('#transcript-turnaround');

            // Clear error state if present any.
            this.clearPreferanceErrorState($turnaroundContainer);

            if(self.selectedProvider && turnaroundPlan) {
                $turnaround.empty().append(new Option(gettext('Select turnaround'), ''));
                _.each(turnaroundPlan, function (value, key) {
                    var option = new Option(value, key);
                    if (self.selectedTurnaroundPlan === key) {
                        option.selected = true;
                    }
                    $turnaround.append(option);
                });
                $turnaroundContainer.show();
            } else {
                $turnaroundContainer.hide();
            }
        },

        populateFidelity: function() {
            var self = this,
                fidelityPlan = self.getFidelityPlan(),
                $fidelityContainer = self.$el.find('.transcript-fidelity-wrapper'),
                $fidelity = self.$el.find('#transcript-fidelity');

            // Clear error state if present any.
            this.clearPreferanceErrorState($fidelityContainer);

            // Fidelity dropdown
            if (self.selectedProvider &&fidelityPlan) {
                $fidelity.empty().append(new Option(gettext('Select fidelity'), ''));
                _.each(fidelityPlan, function(fidelityObject, key){
                    var option = new Option(fidelityObject.display_name, key);
                    if (self.selectedFidelityPlan === key) {
                        option.selected = true;
                    }
                    $fidelity.append(option);
                });
                self.$el.find('.transcript-fidelity-wrapper').show();
            } else {
                self.$el.find('.transcript-fidelity-wrapper').hide();
            }
        },

        populateLanguages: function() {
            var self = this,
                $languagesPreferanceContainer = self.$el.find('.transcript-languages-wrapper'),
                $languagesContainer = self.$el.find('.languages-menu-container'),
                isTurnaroundSelected = self.$el.find('#transcript-turnaround')[0].options.selectedIndex,
                isFidelitySelected = self.$el.find('#transcript-fidelity')[0].options.selectedIndex;

            // Clear error state if present any.
            this.clearPreferanceErrorState($languagesPreferanceContainer);

            $languagesContainer.empty();

            if (self.selectedProvider &&
                    ((isTurnaroundSelected > 0 && self.selectedProvider === '3PlayMedia') ||
                    (isTurnaroundSelected  > 0 && isFidelitySelected > 0))) {
                self.availableLanguages = self.getPlanLanguages();
                _.each(self.activeLanguages, function(activeLanguage){
                    // Only add if not in the list already.
                    if (_.indexOf(self.selectedLanguages, activeLanguage) === -1) {
                        self.selectedLanguages.push(activeLanguage);
                        HtmlUtils.append(
                            $languagesContainer,
                            HtmlUtils.joinHtml(
                                HtmlUtils.HTML('<div class="transcript-language-menu-container">'),
                                HtmlUtils.interpolateHtml(
                                    HtmlUtils.HTML('<span>{languageDisplayName}</span>'),
                                    {
                                        languageDisplayName: self.availableLanguages[activeLanguage]
                                    }
                                ),
                                HtmlUtils.interpolateHtml(
                                    HtmlUtils.HTML('<div class="remove-language-action"><button class="button-link action-remove-language" data-language-code="{languageCode}">{text}<span class="sr">{srText}</span></button></div>'),
                                    {
                                        languageCode: activeLanguage,
                                        text: gettext('Remove'),
                                        srText: gettext('Press Remove to remove language')
                                    }
                                ),
                                HtmlUtils.HTML('</div>')
                            )
                        );
                    }
                });

                self.addLanguageMenu();

                self.$el.find('.transcript-languages-wrapper').show();
            } else {
                self.availableLanguages = {};
                self.$el.find('.transcript-languages-wrapper').hide();
            }
        },

        populatePreferences: function() {
            this.populateProvider();
            this.populateTurnaround();
            this.populateFidelity();
            this.populateLanguages();
        },

        addLanguageMenu: function() {
            var availableLanguages,
                $transcriptLanguage,
                $languagesContainer = this.$el.find('.languages-menu-container'),
                totalCurrentLanguageMenus = $languagesContainer.find('.transcript-language-menu').length;

            // Omit out selected languages from selecting again.
             availableLanguages = _.omit(this.availableLanguages, this.selectedLanguages);

            HtmlUtils.append(
                $languagesContainer,
                HtmlUtils.joinHtml(
                    HtmlUtils.HTML('<div class="transcript-language-menu-container">'),
                    HtmlUtils.interpolateHtml(
                        HtmlUtils.HTML('<select class="transcript-language-menu" id="transcript-language-menu-{languageMenuId}"></select>'),
                        {
                            languageMenuId: totalCurrentLanguageMenus
                        }
                    ),
                    HtmlUtils.HTML('<div class="add-language-action">'),
                    HtmlUtils.interpolateHtml(
                        HtmlUtils.HTML('<button class="button-link action-add-language">{text}<span class="sr">{srText}</span></button>'),
                        {
                            text: gettext('Add'),
                            srText: gettext('Press Add to language')
                        }
                    ),
                    HtmlUtils.HTML('<span class="error-info" aria-hidden="true"></span>'),
                    HtmlUtils.HTML('</div></div>')
                )
            );
            $transcriptLanguage = this.$el.find('#transcript-language-menu-' + totalCurrentLanguageMenus);

            $transcriptLanguage.append(new Option(gettext('Choose a language'), ''));
            _.each(availableLanguages, function(value, key){
                $transcriptLanguage.append(new Option(value, key));
            });
        },

        clearPreferanceErrorState: function($preferanceContainer) {
            $preferanceContainer.removeClass('error');
            $preferanceContainer.find('.error-icon').empty();
            $preferanceContainer.find('.error-info').empty();
        },

        validateCourseVideoSettings: function() {
            var isValid = true,
                $providerEl = this.$el.find('.transcript-provider-wrapper'),
                $turnaroundEl = this.$el.find('.transcript-turnaround-wrapper'),
                $fidelityEl = this.$el.find('.transcript-fidelity-wrapper'),
                $languagesEl = this.$el.find('.transcript-languages-wrapper'),
                requiredText = gettext('Required'),
                infoIconHtml = HtmlUtils.HTML('<span class="icon fa fa-info-circle" aria-hidden="true"></span>');

            // Explicit None selected case.
            if(this.selectedProvider === '') {
                return true;
            }

            if (!this.selectedTurnaroundPlan){
                isValid = false;
                $turnaroundEl.addClass('error');
                HtmlUtils.setHtml(
                    $turnaroundEl.find('.error-icon'),
                    infoIconHtml
                );
                HtmlUtils.setHtml(
                    $turnaroundEl.find('.error-info'),
                    requiredText
                );
            } else {
                this.clearPreferanceErrorState($turnaroundEl);
            }


            if (this.selectedProvider === 'Cielo24' && !this.selectedFidelityPlan) {
                isValid = false;
                $fidelityEl.addClass('error');
                HtmlUtils.setHtml(
                    $fidelityEl.find('.error-icon'),
                    infoIconHtml
                );
                HtmlUtils.setHtml(
                    $fidelityEl.find('.error-info'),
                    requiredText
                );
            } else {
                this.clearPreferanceErrorState($fidelityEl);
            }


            if (this.selectedLanguages.length === 0) {
                isValid = false;
                $languagesEl.addClass('error');
                HtmlUtils.setHtml(
                    $languagesEl.find('.error-icon'),
                    infoIconHtml
                );
                HtmlUtils.setHtml(
                    $languagesEl.find('.error-info'),
                    requiredText
                );
            } else {
                this.clearPreferanceErrorState($languagesEl);

            }

            return isValid;
        },

        saveTranscriptPreferences: function() {
            var self = this,
                $successEl = self.$el.find('.course-video-settings-success-wrapper'),
                $errorEl = self.$el.find('.course-video-settings-error-wrapper');
            $.postJSON(this.transcriptHandlerUrl, {
                provider: self.selectedProvider,
                cielo24_fidelity: self.selectedFidelityPlan,
                cielo24_turnaround: self.selectedProvider === 'Cielo24' ? self.selectedTurnaroundPlan : '',
                three_play_turnaround: self.selectedProvider === '3PlayMedia' ? self.selectedTurnaroundPlan : '',
                preferred_languages: self.selectedLanguages
            }, function(data) {
                if (data.transcript_preferences) {
                    HtmlUtils.setHtml(
                        $successEl,
                        HtmlUtils.interpolateHtml(
                            HtmlUtils.HTML('<div class="course-video-settings-success"><span class="icon fa fa-check-circle" aria-hidden="true"></span><span>{text}</span></div>'),
                            {
                                text: gettext('Settings updated.')
                            }
                        )
                    );
                    self.activeTranscriptionPlan = data.transcript_preferences;
                    // Sync ActiveUploadListView with latest active plan.
                    Backbone.trigger('coursevideosettings:syncActiveTranscriptPreferences', self.activeTranscriptionPlan);
                } else {
                    HtmlUtils.setHtml(
                        $errorEl,
                        HtmlUtils.interpolateHtml(
                            HtmlUtils.HTML('<div class="course-video-settings-error"><span class="icon fa fa-info-circle" aria-hidden="true"></span><span>{text}</span></div>'),
                            {
                                text: gettext('Error saving data.')
                            }
                        )
                    );
                }
            })
        },

        updateCourseVideoSettings: function(event) {
            var $successEl = this.$el.find('.course-video-settings-success-wrapper');
            if(this.validateCourseVideoSettings()) {
                this.saveTranscriptPreferences();
            } else {
                $successEl.empty();
            }
        },

        render: function() {
            var dateModified = this.activeTranscriptionPlan ? moment.utc(this.activeTranscriptionPlan['modified']).format('ll') : '';
            HtmlUtils.setHtml(
                this.$el,
                this.template({
                    dateModified: dateModified
                })
            );

            this.populatePreferences();

            this.registerCloseClickHandler();
            this.setFixedCourseVideoSettingsPane();
            return this;
        },

        setFixedCourseVideoSettingsPane: function() {
            var self = this,
                windowWidth = $(window).width(),
                windowHeight = $(window).height(),
                $courseVideoSettingsButton = $('.course-video-settings-button'),
                $courseVideoSettingsContainer = this.$el.find('.course-video-settings-container'),
                initialPositionTop = $courseVideoSettingsContainer.offset().top,
                courseVideoSettingsButtonLeft = $courseVideoSettingsButton.offset().left,
                fixedOffsetRight = windowWidth - courseVideoSettingsButtonLeft - $courseVideoSettingsButton.width() - 25;

            // set windows total height
            $courseVideoSettingsContainer.css('height', windowHeight);
            $courseVideoSettingsContainer.css('right', 20);


            // Make sticky when scroll reaches top.
            $(window).scroll(function(){

                // Remove transition when we start scrolling.
                // Why we do this? The settings pane does some back and forth movemment when it is switched between
                // position:fixed and position:absolute, it's right and top position are then being changed wrt to their
                // position layout.
                $courseVideoSettingsContainer.css('transition', 'none');

                if ($(window).scrollTop() >= initialPositionTop) {
                    $courseVideoSettingsContainer.addClass('fixed-container');
                    $courseVideoSettingsContainer.css('right', fixedOffsetRight);
                } else {
                    $courseVideoSettingsContainer.removeClass('fixed-container');
                    $courseVideoSettingsContainer.css('right', 20);
                }
            });
        },

        closeCourseVideoSettings: function(event) {
            // Trigger destroy transcript event.
            Backbone.trigger('coursevideosettings:destroyCourseVideoSettingsView');

            // Unbind any events associated
            this.undelegateEvents();

            // Remove click handler on document
            // $(document).off('click', this.closeClickHandler);

            // Empty this.$el content from DOM
            this.$el.empty();

            this.resetPlanData();
        }
    });

    return CourseVideoSettingsView;
});
