/// <reference path="../jquery-1.9.1.js" />
/// <reference path="../linq.js" />
/// <reference path="xr2formsCommon-0.1.js" />
/// <reference path="xr2viewCommon-0.1.js" />

(function (window, $) {
    window.xr2filler = (function () {
        
        // default filler options
        var defaultOptions = { baseUrl: ".", readonly: false };
        
        var filler = function (selector, options) {
            
            // check for a correct container
            var $container = $(selector);
            if ($container.length < 1)
                return undefined;
            
            $container.html('<div />');
            $container = $container.find('div');
            
            // merge the options
            var opts = $.extend({}, defaultOptions, options || {});
            
            //#region Config variables
            var FILLER_TEMPLATE_URL = 'Content/xr2designer/xr2filler.html';
            //#endregion
            
            //#region GLOBAL VARIABLE DEFINITIONS
            var $formImage, $formSection, validationSync;

            //#endregion


            //#region INITIALIZATION FUNCTONS
            
            function init() {
                
                // load the filler page on the container
                var fillerPromise = $.get(opts.baseUrl + FILLER_TEMPLATE_URL);
                
                // wait for all ajax calls to end
                $.when(fillerPromise)
                    .done(function (fillerTemplate) {

                        $container.addClass('xr2filler-container').html(fillerTemplate);

                        // run the initial setup
                        initialSetup();

                        // fire an event when the designer is loaded
                        $container.trigger($.Event("xr2filler:loaded"));
                    })

                    // in case any of the calls fails
                    .fail(function () {
                        $container.html("An error occurred and the filler could not be loaded");
                        $container.trigger($.Event("xr2filler:failedLoad"));
                    });
            }

            function initialSetup() {
                
                // global variables initialization
                initializeGlobalVariables();

                // setup general validation settings
                xr2formsCommon.setupValidation();

                // Adds an effect called "customErrors" to the validator
                $.tools.validator.addEffect("customErrors", function (errors, event) {

                    // get the error messages div
                    var wall = $container.find(this.getConf().container).css('display', 'block'),
                        errorIndex = 0,
                        maxErrors;

                    // remove the previous 'show all messages' link
                    wall.find("div").remove();

                    // check if we can only add the new error messages or if we can also remove the previous ones
                    // to do this, we are using two auxiliary variables, which are set after running the checkbox validation
                    // for the first one, and after displaying the errors for the second one
                    if (xr2formsCommon.vars.checkboxOptionVerification === false || xr2formsCommon.vars.regularValidationErrors === false) {
                        // remove all previous error messages
                        wall.find("p").remove();
                        maxErrors = xr2formsCommon.vars.MAX_ERRORS;
                    } else {
                        // if we can't erase the previous messages, we need to know how many can we add
                        maxErrors = xr2formsCommon.vars.MAX_ERRORS - wall.find('p').length;
                    }

                    // add the first MAX_ERRORS
                    while (errorIndex < errors.length && errorIndex < maxErrors) {
                        // add the error message into the wall
                        wall.append("<p><strong>" + errors[errorIndex].input.attr("name") + "</strong> " + errors[errorIndex].messages[0] + "</p>");
                        // increment the loop variable
                        errorIndex++;
                    }

                    // make the error fields have the class ERROR_FIELD_CLASS
                    $.each(errors, function (index, error) {
                        error.input.parents(xr2formsCommon.vars.FIELD_CONTAINER).addClass(xr2formsCommon.vars.ERROR_FIELD_CLASS);
                    });

                    if (xr2formsCommon.vars.checkboxOptionVerification === false) {
                        // set aux variable to true, to indicate that regular errors have occurred
                        xr2formsCommon.vars.regularValidationErrors = true;
                    } else if (xr2formsCommon.vars.regularValidationErrors === true) {
                        // reset aux variable to false, to indicate that checkbox errors have been added
                        xr2formsCommon.vars.regularValidationErrors = false;
                    }

                    // code to handle the expand/collapse error messages
                    var errorMessages = wall.find('p');
                    if (errorMessages.length > 1) {
                        // hidde all other errors
                        errorMessages.css('display', 'none').eq(0).css('display', 'block');

                        //  add the div to expand/collapse the errors
                        wall.append("<div style=\"float: right; position: relative;top: -10px; color:darkred; cursor:pointer; \">" + "show more" + "&#9660;</div>");
                        wall.find('div').bind('click', xr2formsCommon.showAllErrors);
                    }


                }, function (inputs) {
                    // hide the error messages div
                    var wall = $container.find(this.getConf().container).css('display', 'none');
                    // remove the class 'errorField' from the field
                    $.each(inputs, function () {
                        $(this).parents(xr2formsCommon.vars.FIELD_CONTAINER).removeClass(xr2formsCommon.vars.ERROR_FIELD_CLASS);
                    });
                });
                
            }

            function initializeGlobalVariables() {
                $formImage = $container.find("#form-image");
                $formSection = $container.find("#form-section");
            }
            //#endregion
            

            //#region PAGE SETUP
            
            /** Sets the form image URL **/
            function setFormImage(srcUrl) {
                $formImage.html('');
                if (srcUrl !== undefined) {
                    $formImage.html('<img src="' + srcUrl + '" alt="" width="100%" style="position:relative; top:0px; z-index: -10" />');
                }
            }

            /** Clears the form's background image **/
            function resetFormImage() {
                $formImage.html('');
            }
            
            /** Clears all elements from the form **/
            function resetForm() {
                $formSection.html('');
            }


            /** Loads the fields on the filler section **/
            function setFieldsMetadata(metadata, fieldValues) {
                
                // clean the designer's fields section
                resetForm();

                // reset structures
                xr2formsCommon.vars.fieldsDataStructure = {};
                xr2formsCommon.fieldObservers = new Object();

                // setup fields metadata
                xr2viewCommon.setupMetadata($formSection, metadata);    // viewCommon.js
                
                // setup more common settings - styles, tooltips, dates, signatures
                xr2formsCommon.setPageCommonSettings($formSection);     // common.js

                // TODO: if the page is already Approved or Expired, disable all fields

                // transform from PageFieldId to FieldId - FieldId is the designer representation
                //$.each(fieldValues, function(index, value) {
                //    var targetField = Enumerable.From(metadata).Where(function (x) { return x.Id == value.PageFieldId; }).FirstOrDefault();
                //    value.PageFieldId(targetField.FieldId);
                //});

                // setup initial values
                xr2viewCommon.setupFieldsValues($formSection, fieldValues);   // viewCommon.js

                // setup the custom field validations
                xr2formsCommon.registerCustomValidations($formSection);  // common.js

                // enable dependency validation settings
                xr2formsCommon.setPageDependencies($formSection);  // common.js
                
                // enable checkbox to run the validation when a change event is raised
                xr2formsCommon.setCheckboxChangeEventHandler($formSection, $formSection.find(xr2formsCommon.vars.ERROR_SECTION), fieldValidationSuccess);  // common.js
                
                // bind the form validations with the submit event
                xr2formsCommon.setPageValidationSettings($formSection, validationPassed, fieldValidationSuccess, validationFailed);  // common.js
                
                // trigger an event to let the user knows
                $container.trigger($.Event("xr2filler:fieldsLoaded"));
            }
            
            /** Retrieves the values from the fields **/
            function getFieldValues() {
                var values = [];
                var fieldContainers = $formSection.find(xr2formsCommon.vars.FIELD_CONTAINER);
                fieldContainers.find(xr2formsCommon.vars.TEXT_PASS_EMAIL_NUMBER_INPUTS).each(function () {
                    var fieldId = $(this).parent().attr('id');
                    var fieldValue = $(this).val();
                    if (fieldValue !== undefined) {
                        values.push({ PageFieldId: xr2formsCommon.vars.fieldsDataStructure[fieldId].externalID, Value: fieldValue });
                    }
                });
                fieldContainers.find(xr2formsCommon.vars.SELECT_INPUT).each(function () {
                    var fieldId = $(this).parent().attr('id');
                    var fieldValue = $(this).val();
                    if (fieldValue !== undefined) {
                        var value = JSON.stringify([{ Value: fieldValue }]);
                        values.push({ PageFieldId: xr2formsCommon.vars.fieldsDataStructure[fieldId].externalID, Value: value });
                    }
                });
                fieldContainers.find(xr2formsCommon.vars.DATEPICKER_INPUT).each(function () {
                    var fieldId = $(this).parent().attr('id');
                    var fieldValue = $.datepicker.formatDate(xr2formsCommon.vars.DATE_FORMAT, $(this).datepicker("getDate"));
                    if (fieldValue !== undefined) {
                        values.push({ PageFieldId: xr2formsCommon.vars.fieldsDataStructure[fieldId].externalID, Value: fieldValue });
                    }
                });
                fieldContainers.filter(xr2formsCommon.vars.RADIO_GROUP_CONTAINER).each(function () {
                    var fieldId = $(this).attr('id');
                    var fieldValue = $(this).find(xr2formsCommon.vars.CHECKED_INPUT).first();
                    if (fieldValue.length > 0) {
                        var value = JSON.stringify([{ Value: fieldValue.val() }]);
                        values.push({ PageFieldId: xr2formsCommon.vars.fieldsDataStructure[fieldId].externalID, Value: value });
                    }
                });
                fieldContainers.filter(xr2formsCommon.vars.CHECKBOX_GROUP_CONTAINER).each(function () {
                    var fieldId = $(this).attr('id');
                    var fieldValue = $(this).find(xr2formsCommon.vars.CHECKED_INPUT);
                    if (fieldValue.length > 0) {
                        var value = JSON.stringify(fieldValue.map(function () { return { Value: $(this).val() }; }).toArray());
                        values.push({ PageFieldId: xr2formsCommon.vars.fieldsDataStructure[fieldId].externalID, Value: value });
                    }
                });
                fieldContainers.filter('.' + xr2formsCommon.vars.SIGNATURE_PAD_CLASS).each(function () {
                    var fieldId = $(this).attr('id');
                    var fieldValue = $(this).find(xr2formsCommon.vars.input).val();
                    if (fieldValue !== undefined) {
                        values.push({ PageFieldId: xr2formsCommon.vars.fieldsDataStructure[fieldId].externalID, Value: fieldValue });
                    }
                });

                return values;
            }

            /** Validates the page **/
            function validatePage() {
                validationSync = $.Deferred();
                $formSection.submit();
                return validationSync.promise();
            }


            /** Handles the onSuccess event raised by the validator **/
            function fieldValidationSuccess(e, els) {
                // checks for the next error to indicate to the user
                xr2formsCommon.checkNextError($formSection, $formSection.find(xr2formsCommon.vars.ERROR_SECTION), fieldValidationSuccess); // common.js
            }
            
            /** Custom action to perform when the form is submitted and all validations are passed **/
            function validationPassed(form) {
                validationSync.resolve();
            }
            
            /** Custom action to perform when the form is submitted and validations fail **/
            function validationFailed(form) {
                validationSync.reject();
            }
            
            
            
            
            
            /** Based on the metadata given as a parameter, adds a new field and loads it data accordingly **/
            function setFieldMetadata(fieldMetadata) {
                /// <summary>Based on the metadata given as a parameter, adds a new field and loads it data accordingly.</summary>
                /// <param name="fieldMetadata" type="Object">The metadata of the field.</param>
                /// <returns type="Object">The newly created field</returns>

                var fieldId = fieldMetadata[xr2formsCommon.vars.DATA_FIELD_ID],
                    currentField;

                // insert the fields html code
                $formSection.append(fieldMetadata[xr2formsCommon.vars.DATA_HTML]);
                currentField = $formSection.find('#' + fieldId);

                // make all the metadata available on the field
                $.each(xr2formsCommon.vars.fieldDataProperties, function (index, key) {
                    // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
                    var camelCaseKey = jQuery.camelCase(key),
                    dataValue = fieldMetadata[camelCaseKey];

                    if (dataValue !== null && dataValue !== undefined) {

                        // TODO: transform the initial value internal IDs to its key representation
                        //if (camelCaseKey === 'initialvalue') {
                        //    for (var mergeKey in mergeFieldDefinitionsDictionary) {
                        //        var regex = new RegExp("\\[" + mergeKey + "\\]", "ig");
                        //        dataValue = dataValue.replace(regex, '[' + mergeFieldDefinitionsDictionary[mergeKey].key + ']');
                        //    }
                        //}

                        currentField.data(key, dataValue);
                    }
                });
                // make the custom validation data available on the field
                xr2formsCommon.processCustomValidationMetadataToFields(fieldMetadata, currentField);  // common.js
                // make the dependency data available on the field
                xr2formsCommon.processDependencyMetadataToFields(fieldMetadata, currentField);  // common.js
             
                // apply the styles saved on the metadata
                //TODO: applyFieldStyles(currentField, fieldMetadata[xr2formsCommon.vars.DATA_FIELD_TYPE]);

                // return the new field
                return currentField;
            }
            
            /* Applies all style properties that were set on the field's data object */
            function applyFieldStyles(currentField, fieldType) {
                var style = currentField.data(xr2formsCommon.vars.DATA_STYLE);
                if (style !== undefined) {

                    // iterate over each property
                    $.each(style, function (key, value) {
                        if (value !== undefined && key !== 'display') {
                            if (fieldType === 'checkbox' || fieldType === 'radio') {
                                currentField.css(key, value[xr2formsCommon.vars.DATA_STYLE_VALUE]);
                            } else {
                                currentField.find('input, select, canvas, label, a').css(key, value[xr2formsCommon.vars.DATA_STYLE_VALUE]);
                            }
                        }
                    });
                }
            }

            //#endregion
            

            // initialize the plugin
            init();
            
            //#region Public available methods
            return {
                setFieldsMetadata: setFieldsMetadata,
                setFormImage: setFormImage,
                resetImage: resetFormImage,
                clearForm: resetForm,
                validatePage: validatePage,
                getFieldValues: getFieldValues,
            };
            //#endregion  
        };
        
        filler.default_options = defaultOptions;
        return filler;

    })();
})(window, jQuery);