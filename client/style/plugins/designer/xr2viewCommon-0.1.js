/// <reference path="../jquery-1.9.1.js" />
/// <reference path="../linq.js" />
/// <reference path="xr2formsCommon-0.1.js" />

(function (window, $) {
    window.xr2viewCommon = (function () {
        
        function setupMetadata(pageSection, metadata) {
            /// <summary>Sets the metadata loaded into the page on the corresponding fields.</summary>
            /// <param name="pageSection" type="DOM">The DOM representation of the page section.</param>
            /// <returns type="void"></returns>

            // parse and transforms the metadata loaded on the page, to use it on the fields
            // parse the fields data
            xr2formsCommon.transformMetadataToFieldsData(metadata);  //common.js

            // loop through each of the metadata elements - each corresponds to a different field
            for (var i = 0; i < metadata.length; i++) {
                var fieldId = metadata[i][xr2formsCommon.vars.DATA_FIELD_ID];
                
                // insert the fields html code
                pageSection.append(metadata[i][xr2formsCommon.vars.DATA_HTML]);

                var fieldContainer = pageSection.find('#' + fieldId);
                xr2formsCommon.vars.fieldsDataStructure[fieldId] = {};
                xr2formsCommon.vars.fieldsDataStructure[fieldId].container = fieldContainer;
                xr2formsCommon.vars.fieldsDataStructure[fieldId].type = metadata[i][xr2formsCommon.vars.DATA_FIELD_TYPE];
                xr2formsCommon.vars.fieldsDataStructure[fieldId].innerFields = fieldContainer.find(xr2formsCommon.vars.INNER_FIELDS);
                xr2formsCommon.vars.fieldsDataStructure[fieldId].externalID = metadata[i]['Id'];    // db id from server
                xr2formsCommon.setHtmlMetadata(metadata[i], fieldContainer);  // common.js
            }
        }
        

        function setupFieldsValues(pageSection, fieldValues) {
            /// <summary>Sets the values of the fields, whether they are initial values or submitted values.</summary>
            /// <param name="pageSection" type="DOM">The DOM representation of the page section.</param>
            /// <param name="fieldValues" type="Object">The page field instance values dictionary.</param>
            /// <returns type="void"></returns>

            // set initial values
            xr2formsCommon.setInitialValues(pageSection);      // common.js
            
            // set submitted values
            setPageFieldValues(pageSection, fieldValues);
        }
        
        /** Setup the submitted values **/
        function setPageFieldValues(pageSection, fieldValues) {
            var fieldContainers = pageSection.find(xr2formsCommon.vars.FIELD_CONTAINER);
            fieldContainers.find(xr2formsCommon.vars.TEXT_PASS_EMAIL_NUMBER_INPUTS).each(function () {
                var fieldId = $(this).parent().attr('id');
                var fieldValue = Enumerable.From(fieldValues).Where(function (x) { return x.PageFieldId == fieldId; }).FirstOrDefault();
                if (fieldValue !== undefined) {
                    $(this).val(fieldValue.Value);
                }
            });
            fieldContainers.find(xr2formsCommon.vars.LABEL_LINK_INPUTS).each(function () {
                var fieldId = $(this).parent().attr('id');
                var fieldValue = Enumerable.From(fieldValues).Where(function (x) { return x.PageFieldId == fieldId; }).FirstOrDefault();
                if (fieldValue !== undefined && fieldValue.Value !== '') {
                    $(this).html(fieldValue.Value);
                }
            });
            fieldContainers.find(xr2formsCommon.vars.DATEPICKER_INPUT).each(function () {
                var fieldId = $(this).parent().attr('id');
                var fieldValue = Enumerable.From(fieldValues).Where(function (x) { return x.PageFieldId == fieldId; }).FirstOrDefault();
                if (fieldValue !== undefined && fieldValue.Value !== '') {
                    var parsedDate = Date.parse(fieldValue.Value);
                    if (!isNaN(parsedDate)) {
                        $(this).datepicker("setDate", new Date(parsedDate));
                    }
                }
            });
            fieldContainers.find(xr2formsCommon.vars.SELECT_INPUT).each(function () {
                var fieldId = $(this).parents(xr2formsCommon.vars.FIELD_CONTAINER).attr('id');
                var fieldValue = Enumerable.From(fieldValues).Where(function (x) { return x.PageFieldId == fieldId; }).FirstOrDefault();

                if (fieldValue !== undefined) {
                    var values = JSON.parse(fieldValue.Value).map(function (item, a) { return item.Value; });
                    for (var i = 0; i < values.length; i++) {
                        $(this).val(values[i]);
                    }
                }
            });
            fieldContainers.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).each(function () {
                var fieldId = $(this).parents(xr2formsCommon.vars.FIELD_CONTAINER).attr('id');
                var fieldValue = Enumerable.From(fieldValues).Where(function (x) { return x.PageFieldId == fieldId; }).FirstOrDefault();

                if (fieldValue !== undefined) {
                    var values = JSON.parse(fieldValue.Value).map(function (item, a) { return item.Value; });
                    for (var i = 0; i < values.length; i++) {
                        if (values[i] === $(this).val()) {
                            $(this).attr('checked', 'checked');
                            $(this).parent().addClass('checked');
                        }
                    }
                }
            });
            fieldContainers.filter('.' + xr2formsCommon.vars.SIGNATURE_PAD_CLASS).each(function () {
                var fieldId = $(this).attr('id');
                var fieldValue = Enumerable.From(fieldValues).Where(function (x) { return x.PageFieldId == fieldId; }).FirstOrDefault();
                if (fieldValue !== undefined !== undefined && fieldValue.Value !== '') {
                    $(this).data(xr2formsCommon.vars.DATA_SIGNATURE_PAD).regenerate(fieldValue.Value);
                }
            });
        }
        
        
        //#region Public available methods
        var viewCommon = {
            setupMetadata: setupMetadata,
            setupFieldsValues: setupFieldsValues,
        };
        //#endregion
        
        return viewCommon;

    })();
})(window, jQuery);