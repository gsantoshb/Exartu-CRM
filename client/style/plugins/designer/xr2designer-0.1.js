/// <reference path="../jquery-1.9.1.js" />
/// <reference path="../knockout-2.2.1.debug.js" />
/// <reference path="customBindings-0.1.js" />
/// <reference path="xr2formsCommon-0.1.js" />
/// <reference path="codemirror.js" />


(function (window, $) {
  window.xr2designer = (function () {

    // default xr2designer options
    var defaultOptions = { baseUrl: ".", readonly: false };

    var designer = function (selector, options) {

      // check for a correct container
      var $container = $(selector);
      if ($container.length < 1)
        return undefined;

      $container.html('<div />');
      $container = $container.find('div');

      // merge the options
      var opts = $.extend({}, defaultOptions, options || {});

      //#region Config variables

      var DESIGNER_TEMPLATE_URL = 'Content/xr2designer/xr2designer.html';
      var MAINPROPERTIES_TEMPLATE_URL = 'Content/xr2designer/mainProperties.html';
      var VALIDATIONPROPERTIES_TEMPLATE_URL = 'Content/xr2designer/validationProperties.html';
      var CSSPROPERTIES_TEMPLATE_URL = 'Content/xr2designer/CSS_StyleProperties.html';
      var TOOLBOX_TEMPLATE_URL = 'Content/xr2designer/toolbox.html';
      var MODALDIALOGS_TEMPLATE_URL = 'Content/xr2designer/modalDialogs.html';
      var JQUERY_TEMPLATES_URL = 'Content/xr2designer/jQueryTemplates.html';

      //#endregion

      //#region observable Variables
      var loading = ko.observable(false),         // used when performing a task, to give the user a visual feedback
        inPreviewMode = ko.observable(false),   // true if the form is in preview mode, false if it's in design mode
        inAdvancedMode = ko.observable(false);  // true if the form is in advanced mode, false if it's in basic mode

      //#endregion


      //#region GLOBAL VARIABLE DEFINITIONS
      var $fieldsCollection = new Object(), $fieldsCounter = 0, mergeFieldDefinitionsDictionary = new Object(), comboValuesDictionary = Object();
      var $fieldSettings, $mainSettings, $mainSettingsMessage, $validationSettings, $validationMessage, $customValidationMessage, $dependencySettings, $dependencyMessage, $styleSettings, $styleBasicSettings, $styleAdvancedSettings, $styleMessage, $inputSettings,
        $formElements, $formTemplates, $inputSettingsTmpl, $customValTemplate, $customValSection, $dependencyTemplate, $depConditionTemplate, $depActionTemplate, $dependencySection, $alignTopAction, $alignLeftAction,
        $workArea, $formBuilder, $formDesigner, $formImage, $previewSection,
        $clickedContainerField, upperElementClick = false,
        $patternSelect, $jsEditor,
        $addMergeFieldDialog, $selectMergeFieldTypeDialog,
        $addInitialValueDialog, $initialValueSetting, $outFieldSelectNames,
        $rangedateMinInput, $rangedateMaxInput,
        $toggleBasicButton, $toggleAdvancedButton,
        $errorSection, $confirmDialog, $notification,
        fieldsMetadata, notificationTimeout, useUniform = true,
        $documentSection, // needed for the dependency function in common.js
        depTypeSectionIds = { 'premade': 'dep-premade-type-', 'manual': 'dep-manual-type-', 'function': 'dep-function-type-' },
        premadeDependencyActions = {
          'hideField': { displayName: 'Hide this field', targetProperty: 'css-display', actionValue: 'none', otherwiseValue: 'block' },
          'requireField': { displayName: 'Make this field required', targetProperty: 'required', actionValue: 'required', otherwiseValue: '' },
          'readonlyField': { displayName: 'Make this field readonly', targetProperty: 'readonly', actionValue: 'readony', otherwiseValue: '' }
        },
        BASIC = 0,
        ADVANCED = 1,
        TEXT_TYPE = 0,
        NUMBER_TYPE = 1,
        DATE_TYPE = 2,
        OPTIONS_TYPE = 3,
        DYNAMIC_TYPE = 4,
      //#region action property arrays
        actionPropertyColors = [
          { value: 'AliceBlue', text: 'Alice Blue' },
          { value: 'AntiqueWhite', text: 'Antique White' },
          { value: 'Aqua', text: 'Aqua' },
          { value: 'Aquamarine', text: 'Aquamarine' },
          { value: 'Azure', text: 'Azure' },
          { value: 'Beige', text: 'Beige' },
          { value: 'Black', text: 'Black' },
          { value: 'BlanchedAlmond', text: 'Blanched Almond' },
          { value: 'Blue', text: 'Blue' },
          { value: 'BlueViolet', text: 'Blue Violet' },
          { value: 'Brown', text: 'Brown' },
          { value: 'BurlyWood', text: 'Burly Wood' },
          { value: 'CadetBlue', text: 'Cadet Blue' },
          { value: 'Chartreuse', text: 'Chartreuse' },
          { value: 'Chocolate', text: 'Chocolate' },
          { value: 'Coral', text: 'Coral' },
          { value: 'CornflowerBlue', text: 'Cornflower Blue' },
          { value: 'Cornsilk', text: 'Cornsilk' },
          { value: 'Crimson', text: 'Crimson' },
          { value: 'Cyan', text: 'Cyan' },
          { value: 'DarkBlue', text: 'Dark Blue' },
          { value: 'DarkCyan', text: 'Dark Cyan' },
          { value: 'DarkGoldenRod', text: 'Dark Golden Rod' },
          { value: 'DarkGray', text: 'Dark Gray' }
          // TODO: add the rest of the colors
        ],
        actionPropertyStyles = [
          { value: 'none', text: 'None' },
          { value: 'solid', text: 'Solid' },
          { value: 'dotted', text: 'Dotted' },
          { value: 'dashed', text: 'Dashed' },
          { value: 'double', text: 'Double' }
        ],
        actionPropertyWidths = [
          { value: 'thin', text: 'Thin' },
          { value: 'medium', text: 'Medium' },
          { value: 'thick', text: 'Thick' }
        ],
        actionPropertyAlignments = [
          { value: 'center', text: 'Center' },
          { value: 'left', text: 'Left' },
          { value: 'right', text: 'Right' },
          { value: 'justify', text: 'Justify' }
        ],
        actionPropertyDecorations = [
          { value: 'none', text: 'None' },
          { value: 'underline', text: 'Underline' },
          { value: 'overline', text: 'Overline' },
          { value: 'line-through', text: 'Line through' }
        ],
      //#endregion
        fieldSettingsByType = {
          main: {
            settings: {
              'id': ADVANCED,
              'groupId': ADVANCED,
              'name': BASIC,
              'tooltip': BASIC,
              'initialValue': ADVANCED,
              'dropDownInitialValue': ADVANCED,
              'numericInitialValue': ADVANCED,
              'datepickerInitialValue': ADVANCED,
              'displayValue': BASIC,
              'href': BASIC,
              'tabindex': ADVANCED,
              'currentDate': BASIC,
              'displayLabels': BASIC,
              'grouping': BASIC,
              'readOnly': BASIC,
              'selectTitle': BASIC,
              'selectFieldSource': ADVANCED,
              'selectPrefixedSource': ADVANCED,
              'optionValuesContainer': BASIC
            },

            fields: {
              text: ['id', 'name', 'outFieldId', 'tooltip', 'initialValue', 'readOnly', 'tabindex'],
              number: ['id', 'name', 'outFieldId', 'tooltip', 'numericInitialValue', 'tabindex'],
              email: ['id', 'name', 'outFieldId', 'tooltip', 'initialValue', 'tabindex'],
              select: ['id', 'name', 'outFieldId', 'tooltip', 'dropDownInitialValue', 'tabindex', 'selectTitle', 'selectFieldSource', 'selectPrefixedSource', 'optionValuesContainer'],
              radio: ['groupId', 'name', 'outFieldId', 'tooltip', 'dropDownInitialValue', 'tabindex', 'displayLabels', 'optionValuesContainer'],
              checkbox: ['groupId', 'name', 'outFieldId', 'tooltip', 'dropDownInitialValue', 'tabindex', 'displayLabels', 'readOnly', 'optionValuesContainer'],
              password: ['id', 'name', 'outFieldId', 'tooltip', 'tabindex'],
              date: ['id', 'name', 'outFieldId', 'tooltip', 'datepickerInitialValue', 'currentDate', 'readOnly', 'tabindex'],
              label: ['id', 'name', 'displayValue'],
              canvas: ['id', 'name', 'tooltip'],
              link: ['id', 'name', 'tooltip', 'displayValue', 'href']
            },

            targetProperties: {
              'id': 'id',
              'groupId': 'group-id',
              'name': 'name',
              'tooltip': 'tooltip',
              'initialValue': 'initialvalue',
              'dropDownInitialValue': 'initialvalue',
              'numericInitialValue': 'initialvalue',
              'datepickerInitialValue': 'initialvalue',
              'displayValue': 'initialvalue',
              'href': 'href',
              'tabindex': 'tabindex',
              'currentDate': 'current-date',
              'displayLabels': 'displayLabels',
              'grouping': 'grouping',
              'readOnly': 'read-only',
              'selectTitle': 'select-title',
              'selectFieldSource': 'selectfield-source',
              'selectPrefixedSource': 'select-prefixed-source'
            }
          },

          validation: {
            settings: {
              'required': BASIC,
              'minimumlength': BASIC,
              'maxlength': BASIC,
              'min': BASIC,
              'max': BASIC,
              'min-selected': BASIC,
              'data-equals': BASIC,
              'rangedate-min': BASIC,
              'rangedate-min-current': BASIC,
              'rangedate-max': BASIC,
              'rangedate-max-current': BASIC,
              'pattern': BASIC,
              'custom-pattern': ADVANCED,
              'custom-validation': ADVANCED
            },

            fields: {
              text: ['required', 'minimumlength', 'maxlength', 'pattern', 'custom-pattern', 'custom-validation'],
              number: ['required', 'min', 'max', 'pattern', 'custom-pattern', 'custom-validation'],
              email: ['required', 'minimumlength', 'maxlength', 'custom-validation'],
              select: ['required', 'custom-validation'],
              radio: ['required'],
              checkbox: ['min-selected'],
              password: ['required', 'minimumlength', 'maxlength', 'data-equals', 'custom-validation'],
              date: ['required', 'rangedate-min', 'rangedate-min-current', 'rangedate-max', 'rangedate-max-current', 'custom-validation'],
              label: [],
              canvas: ['required'],
              link: []
            },

            patterns: {
              text: ['alpha', 'alpa-numeric', 'numeric', 'decimal', 'ssn', 'us-postal-code', 'us-phone', 'international-phone', 'date'],
              number: ['numeric', 'decimal']
            }
          },

          dependency: {
            conditions: {
              settings: {
                'fieldName': BASIC,
                'comparer': BASIC,
                'value': BASIC,
                'dropDownValue': BASIC,
                'numericValue': BASIC,
                'datepickerValue': BASIC
              },

              fields: {
                text: ['fieldName', 'comparer', 'value'],
                number: ['fieldName', 'comparer', 'numericValue'],
                email: ['fieldName', 'comparer', 'value'],
                select: ['fieldName', 'comparer', 'dropDownValue'],
                radio: ['fieldName', 'comparer', 'dropDownValue'],
                checkbox: ['fieldName', 'comparer', 'dropDownValue'],
                password: ['fieldName', 'comparer', 'value'],
                date: ['fieldName', 'comparer', 'datepickerValue'],
                label: ['fieldName', 'comparer', 'value'],
                canvas: ['fieldName', 'comparer'],
                link: ['fieldName', 'comparer', 'value']
              },

              comparers: {
                settings: {
                  'equals': BASIC,
                  'notEquals': BASIC,
                  'contains': BASIC,
                  'notContains': BASIC,
                  'greaterThan': BASIC,
                  'lessThan': BASIC,
                  'checked': BASIC,
                  'notChecked': BASIC,
                  'anyValue': BASIC,
                  'regex': ADVANCED
                },

                fields: {
                  text: ['equals', 'notEquals', 'contains', 'notContains', 'anyValue', 'regex'],
                  number: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'anyValue', 'regex'],
                  email: ['equals', 'notEquals', 'contains', 'notContains', 'anyValue', 'regex'],
                  select: ['equals', 'notEquals', 'anyValue'],
                  radio: ['equals', 'notEquals', 'anyValue'],
                  checkbox: ['checked', 'notChecked', 'anyValue'],
                  password: ['equals', 'notEquals', 'contains', 'notContains', 'anyValue', 'regex'],
                  date: ['equals', 'notEquals', 'greaterThan', 'lessThan', 'anyValue'],
                  label: [],
                  canvas: ['anyValue'],
                  link: []
                },

                text: {
                  'equals': 'Equals to',
                  'notEquals': 'Not equals to',
                  'contains': 'Contains',
                  'notContains': 'Not contains',
                  'greaterThan': 'Greater than',
                  'lessThan': 'Less than',
                  'checked': 'Is checked',
                  'notChecked': 'Not checked',
                  'anyValue': 'Takes any value',
                  'regex': 'Regex'
                }
              }
            },

            actions: {
              settings: {
                'type': ADVANCED,
                'selector': BASIC,
                'action': BASIC,
                'property': ADVANCED,
                'value': BASIC,
                'dropDownValue': BASIC,
                'numericValue': BASIC,
                'datepickerValue': BASIC,
                'evalOtherwise': ADVANCED,
                'valueOtherwise': ADVANCED,
                'dropDownOtherwise': ADVANCED,
                'numericOtherwise': ADVANCED,
                'datepickerOtherwise': ADVANCED
              },

              // used on a diferent way that the others settings, to display. An auxiliar function controls the fields based on the property type
              fields: {
                text: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                number: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                email: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                select: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                radio: ['type', 'selector', 'property', 'action', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                checkbox: ['type', 'selector', 'property', 'action', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                password: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                date: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'datepickerValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise', 'datepickerOtherwise'],
                label: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                canvas: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise'],
                link: ['type', 'action', 'property', 'value', 'dropDownValue', 'numericValue', 'evalOtherwise', 'valueOtherwise', 'dropDownOtherwise', 'numericOtherwise']
              },

              //#region premade
              premade: {
                action: {
                  'show': { property: 'css-display', value: 'block', evalOtherwise: 'true', otherwiseValue: 'none' },
                  'hide': { property: 'css-display', value: 'none', evalOtherwise: 'true', otherwiseValue: 'block' },
                  'enable': { property: 'disabled', value: xr2formsCommon.vars.EMPTY_VALUE, evalOtherwise: 'true', otherwiseValue: 'disabled' },
                  'disable': { property: 'disabled', value: 'disabled', evalOtherwise: 'true', otherwiseValue: xr2formsCommon.vars.EMPTY_VALUE },
                  'readonly': { property: 'readonly', value: 'readonly', evalOtherwise: 'true', otherwiseValue: xr2formsCommon.vars.EMPTY_VALUE },
                  'required': { property: 'required', value: 'required', evalOtherwise: 'true', otherwiseValue: xr2formsCommon.vars.EMPTY_VALUE },
                  'value': { property: 'value', evalOtherwise: 'false' },
                  'modifyurl': { property: 'href', evalOtherwise: 'false' },
                  'clear': { property: 'value', value: xr2formsCommon.vars.EMPTY_VALUE, evalOtherwise: 'false' },
                  'select': { property: 'selected', value: 'selected', evalOtherwise: 'true', otherwiseValue: xr2formsCommon.vars.EMPTY_VALUE },
                  'unselect': { property: 'selected', value: xr2formsCommon.vars.EMPTY_VALUE, evalOtherwise: 'true', otherwiseValue: 'selected' }
                },

                fields: {
                  text: ['show', 'hide', 'enable', 'disable', 'readonly', 'required', 'value', 'clear'],
                  number: ['show', 'hide', 'enable', 'disable', 'readonly', 'required', 'value', 'clear'],
                  email: ['show', 'hide', 'enable', 'disable', 'readonly', 'required', 'clear'],
                  select: ['show', 'hide', 'enable', 'disable', 'required', 'value', 'clear'],
                  radio: ['show', 'hide', 'enable', 'disable', 'required', 'value', 'clear'],
                  checkbox: ['show', 'hide', 'enable', 'disable', 'required', 'value', 'clear'],
                  password: ['show', 'hide', 'enable', 'disable', 'required', 'clear'],
                  date: ['show', 'hide', 'enable', 'disable', 'readonly', 'required', 'value', 'clear'],
                  label: ['show', 'hide', 'value'],
                  canvas: ['show', 'hide', 'enable', 'disable', 'readonly', 'required'],
                  link: ['show', 'hide', 'modifyurl', 'value']
                },

                checkRadioInputs: ['show', 'hide', 'enable', 'disable', 'select', 'unselect'],

                valueSections: {
                  text: 'value',
                  number: 'numericValue',
                  email: 'value',
                  select: 'dropDownValue',
                  radio: 'dropDownValue',
                  checkbox: 'dropDownValue',
                  password: 'value',
                  date: 'datepickerValue',
                  label: 'value',
                  link: 'value'
                },

                text: {
                  'show': 'Show field',
                  'hide': 'Hide field',
                  'enable': 'Enable field',
                  'disable': 'Disable field',
                  'readonly': 'Make field readonly',
                  'required': 'Make field required',
                  'value': 'Modify value',
                  'modifyurl': 'Modify URL value',
                  'select': 'Select option',
                  'unselect': 'Unselect option',
                  'clear': 'Clear value'
                }
              },
              //#endregion

              //#region manual
              manual: {
                fields: {
                  text: ['enabled', 'minlength', 'maxlength', 'required', 'value', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'textcolor', 'textalign', 'textdecoration', 'display'],
                  number: ['enabled', 'minnumber', 'maxnumber', 'required', 'numericValue', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'textcolor', 'textalign', 'textdecoration', 'display'],
                  email: ['enabled', 'minlength', 'maxlength', 'required', 'value', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'textcolor', 'textalign', 'textdecoration', 'display'],
                  select: ['enabled', 'required', 'dropDownValue', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'textcolor', 'display'],
                  radio: ['enabled', 'required', 'dropDownValue', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'display'],
                  checkbox: ['enabled', 'minselected', 'required', 'dropDownValue', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'display'],
                  password: ['enabled', 'minlength', 'maxlength', 'required', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'textcolor', 'textalign', 'textdecoration', 'display'],
                  date: ['enabled', 'mindate', 'maxdate', 'readonly', 'required', 'datepickerValue', 'tooltip', 'backgroundcolor', 'bordercolor', 'borderstyle', 'borderwidth', 'textcolor', 'textalign', 'textdecoration', 'display'],
                  label: ['value', 'tooltip', 'backgroundcolor', 'textcolor', 'textalign', 'textdecoration', 'display'],
                  canvas: ['enabled', 'required', 'tooltip', 'bordercolor', 'borderstyle', 'borderwidth', 'display'],
                  link: ['value', 'urlvalue', 'tooltip', 'backgroundcolor', 'textcolor', 'textdecoration', 'display']
                },

                checkRadioInputs: ['enabled', 'display', 'select'],

                properties: {
                  'enabled': {
                    property: 'disabled',
                    text: 'Enabled',
                    type: OPTIONS_TYPE,
                    options: [{ text: 'Enabled', value: xr2formsCommon.vars.EMPTY_VALUE }, { text: 'Disabled', value: 'disabled' }]
                  },
                  'minlength': {
                    property: 'minimumlength',
                    text: 'Minimun length',
                    type: NUMBER_TYPE
                  },
                  'maxlength': {
                    property: 'maxlength',
                    text: 'Maximun length',
                    type: NUMBER_TYPE
                  },
                  'minnumber': {
                    property: 'min',
                    text: 'Minimun number',
                    type: NUMBER_TYPE
                  },
                  'maxnumber': {
                    property: 'max',
                    text: 'Maximun number',
                    type: NUMBER_TYPE
                  },
                  'minselected': {
                    property: 'min-selected',
                    text: 'Minimum selected',
                    type: NUMBER_TYPE
                  },
                  'mindate': {
                    property: 'rangedate-min',
                    text: 'Minimum date',
                    type: DATE_TYPE
                  },
                  'maxdate': {
                    property: 'rangedate-max',
                    text: 'Maximun date',
                    type: DATE_TYPE
                  },
                  'required': {
                    property: 'required',
                    text: 'Required',
                    type: OPTIONS_TYPE,
                    options: [{ text: 'Required', value: 'required' }, { text: 'Not required', value: xr2formsCommon.vars.EMPTY_VALUE }]
                  },
                  'value': {
                    property: 'value',
                    text: 'Modify value',
                    type: TEXT_TYPE
                  },
                  'dropDownValue': {
                    property: 'value',
                    text: 'Modify value',
                    type: DYNAMIC_TYPE
                  },
                  'numericValue': {
                    property: 'value',
                    text: 'Modify value',
                    type: NUMBER_TYPE
                  },
                  'datepickerValue': {
                    property: 'value',
                    text: 'Modify value',
                    type: DATE_TYPE
                  },
                  'urlvalue': {
                    property: 'href',
                    text: 'Modify URL value',
                    type: TEXT_TYPE
                  },
                  'tooltip': {
                    property: 'tooltip',
                    text: 'Tooltip text',
                    type: TEXT_TYPE
                  },
                  'backgroundcolor': {
                    property: 'css-background-color',
                    text: 'Background color',
                    type: OPTIONS_TYPE,
                    options: actionPropertyColors
                  },
                  'bordercolor': {
                    property: 'css-border-color',
                    text: 'Border color',
                    type: OPTIONS_TYPE,
                    options: actionPropertyColors
                  },
                  'borderstyle': {
                    property: 'css-border-style',
                    text: 'Border style',
                    type: OPTIONS_TYPE,
                    options: actionPropertyStyles
                  },
                  'borderwidth': {
                    property: 'css-border-width',
                    text: 'Border width',
                    type: OPTIONS_TYPE,
                    options: actionPropertyWidths
                  },
                  'textcolor': {
                    property: 'css-color',
                    text: 'Text color',
                    type: OPTIONS_TYPE,
                    options: actionPropertyColors
                  },
                  'textalign': {
                    property: 'css-text-align',
                    text: 'Text alignment',
                    type: OPTIONS_TYPE,
                    options: actionPropertyAlignments
                  },
                  'textdecoration': {
                    property: 'css-text-align',
                    text: 'Text decoration',
                    type: OPTIONS_TYPE,
                    options: actionPropertyDecorations
                  },
                  'display': {
                    property: 'display',
                    text: 'Visibility',
                    type: OPTIONS_TYPE,
                    options: [{ value: 'block', text: 'Show' }, { value: 'none', text: 'Hide' }]
                  },
                  'select': {
                    property: 'selected',
                    text: 'Selected',
                    type: OPTIONS_TYPE,
                    options: [{ value: 'selected', text: 'Select' }, { value: xr2formsCommon.vars.EMPTY_VALUE, text: 'Unselect' }]
                  }
                }
              }
              //#endregion
            }
          },

          style: {
            rules: {
              'border-color': BASIC,
              'border-left-color': ADVANCED,
              'border-top-color': ADVANCED,
              'border-right-color': ADVANCED,
              'border-bottom-color': ADVANCED,
              'border-style': ADVANCED,
              'border-left-style': ADVANCED,
              'border-top-style': ADVANCED,
              'border-right-style': ADVANCED,
              'border-bottom-style': ADVANCED,
              'border-width': BASIC,
              'border-left-width': ADVANCED,
              'border-top-width': ADVANCED,
              'border-right-width': ADVANCED,
              'border-bottom-width': ADVANCED,
              'font-family': BASIC,
              'font-size': BASIC,
              'font-style': ADVANCED,
              'font-weight': BASIC,
              'text-align': BASIC,
              'text-decoration': ADVANCED,
              'text-transform': ADVANCED,
              'color': BASIC,
              'letter-spacing': ADVANCED,
              'background-color': BASIC,
              'cursor': ADVANCED,
              'display': ADVANCED,
              'opacity': ADVANCED
            },

            fields: {
              text: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration', 'text-transform', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity'],
              number: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration', 'text-transform', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity'],
              email: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration', 'text-transform', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity'],
              select: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-decoration', 'text-transform', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity'],
              radio: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'background-color', 'cursor', 'display', 'opacity'],
              checkbox: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'background-color', 'cursor', 'display', 'opacity'],
              password: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity'],
              date: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity'],
              label: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'font-family', 'font-size', 'font-style', 'font-weight', 'text-align', 'text-decoration', 'text-transform', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity'],
              canvas: ['border-color', 'border-left-color', 'border-top-color', 'border-right-color', 'border-bottom-color', 'border-style', 'border-left-style', 'border-top-style', 'border-right-style', 'border-bottom-style', 'border-width', 'border-left-width', 'border-top-width', 'border-right-width', 'border-bottom-width', 'cursor', 'display', 'opacity'],
              link: ['font-family', 'font-size', 'font-style', 'font-weight', 'text-decoration', 'text-transform', 'color', 'letter-spacing', 'background-color', 'cursor', 'display', 'opacity']
            }
          }
        },

        MERGEFIELD_TYPE_STRING = '_string_',
        MERGEFIELD_TYPE_DATE = '_date_',
        MERGEFIELD_TYPE_DECIMAL = '_decimal_',
        MERGEFIELD_TYPE_SELECT = '_select_',
        MERGEFIELD_TYPE_SINGLE = 1,
        MERGEFIELD_TYPE_MULTIPLE = 2,

        FORM_ELEMENT_TEMPLATES_URL = '../../Areas/DocCenter/Helpers/form_elements.html',
        SELECTED_FIELD_CLASS = 'selectedField',
        FIELD_TYPE_CHECKBOX = 'checkbox-field',
        FIELD_TYPE_RADIO = 'radio-field',
        FIELD_TYPE_LABEL = 'label-field',
        FIELD_TYPE_LINK = 'link-field',
        FIELD_TYPE_SELECT = 'select-field',
        FIELD_TYPE_DATE = 'date-field',
        FIELD_TYPE_SIGNATURE = 'signature-field',

        FIELD_ACTIONS = '.field-actions',
        RESIZABLE_HANDLE = '.ui-resizable-handle',
        RESIZABLE_CLASS = 'ui-resizable',
        DRAGGABLE_CLASS = 'ui-draggable',
        ARIA_DISABLED_ATTR = 'aria-disabled',
        CHECK_RADIO_OPTIONS = '.option',
        DATEPICKER_CLASS = 'hasDatepicker',
        DATA_POSITION_TOP = 'PositionTop',
        DATA_POSITION_LEFT = 'PositionLeft',
        DATA_FIELD_WIDTH = 'FieldWidth',
        DATA_FIELD_HEIGHT = 'FieldHeight',
        FIELD_ACTIONS_TEMPLATE = '#field-actions-tmpl',
        CLEAR_PAGE_TITLE = 'Reset Form',

        MESSAGE_CLASS = 'message',
        INDESIGN_SUBMIT_NOTIFICATION = 'Use preview mode to test form',
        VALIDATION_SUCCESS_NOTIFICATION = 'Validation passed',
        DELETE_FIELD_CLASS = 'delete-field',
        ADD_OPTION_ID = 'add-option-value',
        REMOVE_OPTION_CLASS = 'remove-option',
        DEFAULT_CONFIRM_ACTION_TITLE = 'Confirm',
        DELETE_FIELD_ACTION_TITLE = 'Delete Field',
        REMOVE_CUSTOM_VALIDATION_TITLE = 'Remove Custom Validation',
        REMOVE_DEPENDENCY_TITLE = 'Remove Dependency',
        REMOVE_DEP_CONDITION = 'Remove Condition',
        REMOVE_DEP_ACTION = 'Remove Action',
        CLEAR_IMAGE_TITLE = 'Reset Image',
        ADD_INITIAL_VALUE_ID = 'add-initial-value',
        ADD_CUSTOM_VAL_ID = 'add-new-custom-val',
        ADD_DEPENDENCY_ID = 'add-new-dependency',
        ADD_MERGE_FIELD_ID = 'addMergeField',
        DELETE_CUSTOM_VAL_CLASS = 'delete-validation',
        DELETE_DEPENDENCY_CLASS = 'delete-dependency',
        COLLAPSIBLE_SECTIONS = '.expand-collapse-button, .settingName',
        COLLAPSIBLE_HEADER_CLASS = 'collapsible-header',
        SETTING_SECTION_CLASS = 'settingSection',
        VAL_SETTING_PREFIX = 'custom-val-sett-',
        DEP_SETTING_PREFIX = 'dep-sett-',
        DEP_CONDITIONS_PREFIX = 'dep-conditions-',
        DEP_ACTIONS_PREFIX = 'dep-actions-',
        CONDITION_OPERATOR_PREFIX = 'condition-operator-',
        DELETE_DEP_CONDITION_CLASS = 'delete-dep-condition',
        DELETE_DEP_ACTION_CLASS = 'delete-dep-action',
        ADD_DEP_CONDITION_CLASS = 'add-new-condition',
        ADD_DEP_ACTION_CLASS = 'add-new-action',
        DEP_PREMADE_PREFIX = 'dep-premade-type-',
        DEP_SETTING_CLASS = 'dependency-setting',
        STYLE_SHORTHAND_CLASS = 'style-shorthand',
        SETTING_CONTENT_CLASS = 'setting-content',
        SETTING_COLLAPSED_CLASS = 'collapsed',
        CHECK_RADIO_CONTAINER_DISTANCE = 8;

      //#endregion

      //#region SINGLETON VARIABLES

      // Designer Status and Modes
      var designerStatus = new function () {

        var DESIGNER_MODE_BASIC = 'basic',
          DESIGNER_MODE_ADVANCED = 'advanced',
          DESIGNER_STATE_DESIGN = 'design',
          DESIGNER_STATE_PREVIEW = 'preview';

        //#region BASIC / ADVANCED MODES
        var mode = DESIGNER_MODE_BASIC;

        // returns true if the xr2designer is in basic mode
        this.InBasicMode = function () {
          return mode === DESIGNER_MODE_BASIC;
        };

        // returns true if the xr2designer is in advanced mode
        this.InAdvancedMode = function () {
          return mode === DESIGNER_MODE_ADVANCED;
        };

        // changes the xr2designer mode to Advanced
        this.SwitchToAdvancedMode = function () {
          // display loading dialog
          loading(true);

          // change the xr2designer mode to advanced
          mode = DESIGNER_MODE_ADVANCED;
          inAdvancedMode(true);

          // reset the properties sections when a single field is selected
          if ($container.find('.' + SELECTED_FIELD_CLASS).length === 1) {
            resetFieldSettings($clickedContainerField, xr2formsCommon.getType($clickedContainerField));
          }

          // show the advanced notification
          notificationService.ShowNotification('Advanced Mode');

          // hide loading dialog
          loading(false);
        };

        // changes the xr2designer mode to Basic
        this.SwitchToBasicMode = function () {
          // display loading dialog
          loading(true);

          // change the xr2designer mode to basic
          mode = DESIGNER_MODE_BASIC;
          inAdvancedMode(false);

          // reset the properties sections when a single field is selected
          if ($container.find('.' + SELECTED_FIELD_CLASS).length === 1) {
            resetFieldSettings($clickedContainerField, xr2formsCommon.getType($clickedContainerField));
          }

          // show the advanced notification
          notificationService.ShowNotification('Basic Mode');

          // hide loading dialog
          loading(false);
        };
        //#endregion

        //#region DESIGN / PREVIEW MODES
        var state = DESIGNER_STATE_DESIGN;

        // returns the actual state
        this.GetDesignerState = function () {
          return state;
        };

        this.SwitchToPreview = function () {
          // check whether the actual state is valid
          if (validateFieldsDependencies()) {
            // display loading dialog
            loading(true);
            // deselect any selected field
            deselectFields();
            // force a reload of the settings when exiting the preview mode
            $clickedContainerField = undefined;

            // disable dragging new fields
            $('#controls li').draggable("disable");

            // obtain the fields metadata to reset the form when exiting the preview mode
            fieldsMetadata = getMetadata(false);
            // change the xr2designer state to preview
            state = DESIGNER_STATE_PREVIEW;
            inPreviewMode(true);

            // copy the fields to the preview-section
            setupPreviewFormCode();

            // reset structures
            xr2formsCommon.vars.fieldsDataStructure = {};
            xr2formsCommon.fieldObservers = new Object();

            /**** Common page setup - data, validations, dependencies ****/
            setPreviewPageSettings($previewSection);

            // show the preview notification
            notificationService.ShowNotification('Preview Mode');
            // hide loading dialog
            loading(false);
          }
        };

        this.SwitchToDesign = function () {
          // display loading dialog
          loading(true);
          // clean up the preview section
          $previewSection.html('');
          // change the xr2designer state to design
          state = DESIGNER_STATE_DESIGN;
          inPreviewMode(false);
          // apply the UI changes to show the design mode
          designerUIControl.SwitchUIToDesign();

          // load the saved fields metadata into the xr2designer form
          setFieldsMetadata(fieldsMetadata);

          // enable dragging new fields
          $('#controls li').draggable("enable");

          // show the preview notification
          notificationService.ShowNotification('Design Mode', 2000);
          // hide loading dialog
          loading(false);
        };

        // toggles the xr2designer between preview and design modes
        this.TogglePreviewMode = function () {
          // show the loading indicator, and based on the actual state, go into preview or design mode
          if (inPreviewMode())
            designerStatus.SwitchToDesign();
          else
            designerStatus.SwitchToPreview();
        };
        //#endregion
      };

      // UI Control Functions
      var designerUIControl = new function () {

        //#region Change UI bewteen DESIGN / PREVIEW MODES

        // changes the UI to Design Mode
        this.SwitchUIToDesign = function () {
          // hide the error messages div - showed by the validation plugin
          $errorSection.fadeOut();
        };
        //#endregion


        //#region Field Settings controls

        this.MakeSettingsResizable = function () {
          // apply jScrollPane plugin to the setting sections
          $mainSettings.jScrollPane().find('.jspPane').resize(function (e) {
            $mainSettings.jScrollPane();
          });
          $validationSettings.jScrollPane().find('.jspPane').resize(function (e) {
            $validationSettings.jScrollPane();
          });
          $dependencySettings.jScrollPane().find('.jspPane').resize(function (e) {
            $dependencySettings.jScrollPane();
          });
          $styleSettings.jScrollPane().find('.jspPane').resize(function (e) {
            $styleSettings.jScrollPane();
          });
        };

        // given a certain section, makes all inner sections collapsible
        this.MakeSectionsCollapsible = function (section) {
          section.find('.' + COLLAPSIBLE_HEADER_CLASS).find(COLLAPSIBLE_SECTIONS).click(function () {
            $(this).parent('.' + COLLAPSIBLE_HEADER_CLASS).nextAll('.' + SETTING_CONTENT_CLASS).slideToggle(500);
            $(this).parents('.' + SETTING_SECTION_CLASS).toggleClass(SETTING_COLLAPSED_CLASS);
          });
        };

        // given a certain section, collapses all inner sections
        this.CollapseSections = function (section) {
          section.find('.' + SETTING_CONTENT_CLASS).hide();
          section.find(COLLAPSIBLE_SECTIONS).parents('.' + SETTING_SECTION_CLASS).addClass(SETTING_COLLAPSED_CLASS);
        };

        this.HideProperties = function () {
          $mainSettings.css('display', 'none');
          $validationSettings.css('display', 'none');
          $dependencySettings.css('display', 'none');
          $styleSettings.css('display', 'none');
        };

        this.ShowProperties = function () {
          $mainSettings.css('display', '');
          $validationSettings.css('display', '');
          $dependencySettings.css('display', '');
          $styleSettings.css('display', '');
        };

        this.HideSection = function (section) {
          section.css('display', 'none');
        };

        this.ShowSection = function (section) {
          section.css('display', '');
        };

        this.FilterPatternByField = function (fieldType) {
          // hide all options
          $patternSelect.find('option').hide();
          $patternSelect.find('option').each(function () {
            var pattern = $(this).attr('data-pattern');
            // make the option visible if its set for the fieldType
            if ($.inArray(pattern, fieldSettingsByType.validation.patterns[fieldType]) !== -1) {
              $(this).show();
            }
          });
        };

        //#endregion

        //#region Validation Error Handling

        /** Register the custom validation effect to show error messages **/
        this.RegisterValidationEffect = function () {
          // Adds an effect called "customErrors" to the validator
          $.tools.validator.addEffect("customErrors", function (errors, event) {

            // get the error messages div
            var wall = $(this.getConf().container).css('display', 'block'),
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
            var wall = $errorSection.css('display', 'none');
            // remove the class 'errorField' from the field
            $.each(inputs, function () {
              $(this).parents(xr2formsCommon.vars.FIELD_CONTAINER).removeClass(xr2formsCommon.vars.ERROR_FIELD_CLASS);
            });
          });
        };
        //#endregion

        //#region Field Selection/Deselection

        /* Selects a field */
        this.SelectField = function (fieldContainer) {
          // apply css style to the new selected field
          fieldContainer.addClass(SELECTED_FIELD_CLASS);
        };

        /** Deselects any previously selected field **/
        this.DeselectFields = function () {
          $container.find('.' + SELECTED_FIELD_CLASS).removeClass(SELECTED_FIELD_CLASS);
        };

        //#endregion
      };

      // Notification Message Control
      var notificationService = new function () {

        /** Shows an application notification **/
        this.ShowNotification = function (message, timeout) {
          //don't want a previously set timeout to prematurely clear this message if notification is called in rapid succession
          clearTimeout(notificationTimeout);
          $notification.html(message).css('display', 'block').animate({ opacity: 1 }, 'fast');

          if (timeout === undefined)
            timeout = 2000;

          notificationTimeout = setTimeout(function () {
            notificationService.HideNotification();
          }, timeout);
        };

        /** Hides the actual application notification **/
        this.HideNotification = function () {
          $notification.animate({ opacity: 0 }, 'fast', function () {
            $(this).css('display', 'none');
          });
        };
      };

      // Provides functions to handle the alignment of fields
      var alignment = new function () {

        //#region Private Methods

        /** Returns the minimum top offset of the inner fields for the specified control **/
        function getMinTopOffset(control) {
          /// <summary>Returns the minimum top offset of the inner fields for the specified control.</summary>
          /// <param name="control" type="Object">The field container element.</param>
          /// <returns type="Number"></returns>

          var $control = $(control);
          var type = xr2formsCommon.getType($control);

          if (type !== 'checkbox' && type !== 'radio') {
            return $control.find('input, select, canvas, label, a').first().offset().top;
          } else {
            var minTop = 999999;
            $control.find(CHECK_RADIO_OPTIONS).each(function () {
              if ($(this).offset().top < minTop) {
                minTop = $(this).offset().top;
              }
            });
            return minTop;
          }
        };

        /** Returns the maximum bottom offset (including height) of the inner fields for the specified control **/
        function getMaxBottomOffset(control) {
          /// <summary>Returns the maximum bottom offset (including height) of the inner fields for the specified control.</summary>
          /// <param name="control" type="Object">The field container element.</param>
          /// <returns type="Number"></returns>

          var $control = $(control);
          var type = xr2formsCommon.getType($control);

          if (type !== 'checkbox' && type !== 'radio') {
            var innerField = $control.find('input, select, canvas, label, a').first();
            return innerField.offset().top + innerField.height();
          } else {
            var maxTop = -1;
            var itemHeight = $control.find(CHECK_RADIO_OPTIONS).first().height();

            $control.find(CHECK_RADIO_OPTIONS).each(function () {
              if ($(this).offset().top > maxTop) {
                maxTop = $(this).offset().top;
              }
            });
            return maxTop + itemHeight;
          }

        };

        /** Returns the minimum left offset of the inner fields for the specified control **/
        function getMinLeftOffset(control) {
          /// <summary>Returns the minimum left offset of the inner fields for the specified control.</summary>
          /// <param name="control" type="Object">The field container element.</param>
          /// <returns type="Number"></returns>

          var $control = $(control);
          var type = xr2formsCommon.getType($control);

          if (type !== 'checkbox' && type !== 'radio') {
            return $control.find('input, select, canvas, label, a').first().offset().left;
          } else {
            var minLeft = 999999;
            $control.find(CHECK_RADIO_OPTIONS).each(function () {
              if ($(this).offset().left < minLeft) {
                minLeft = $(this).offset().left;
              }
            });
            return minLeft;
          }
        };

        /** Returns the maximum left offset (including width) of the inner fields for the specified control **/
        function getMaxLeftOffset(control) {
          /// <summary>Returns the maximum left offset (including width) of the inner fields for the specified control.</summary>
          /// <param name="control" type="Object">The field container element.</param>
          /// <returns type="Number"></returns>

          var $control = $(control);
          var type = xr2formsCommon.getType($control);

          if (type !== 'checkbox' && type !== 'radio') {
            var innerField = $control.find('input, select, canvas, label, a').first();
            return innerField.offset().left + innerField.width();
          } else {
            var maxLeft = -1;
            var itemWidth = $control.find(CHECK_RADIO_OPTIONS).first().width();

            $control.find(CHECK_RADIO_OPTIONS).each(function () {
              if ($(this).offset().left > maxLeft) {
                maxLeft = $(this).offset().left;
              }
            });
            return maxLeft + itemWidth;
          }

        };

        /** Vertically aligns the inner fields to the passed topOffset for the specified control **/
        function verticalAlign(control, topOffset) {
          /// <summary>Vertically aligns the inner fields to the passed topOffset for the specified control.</summary>
          /// <param name="control" type="Object">The field container element.</param>
          /// <param name="topOffset" type="Number">The top offset to set the inner fields to.</param>

          var $control = $(control);
          var type = xr2formsCommon.getType($control);
          var containerOffset = $control.offset().top;

          if (type !== 'checkbox' && type !== 'radio') {
            var fieldOffset = $control.find('input, select, canvas, label, a').first().offset().top;
            $control.offset({ top: topOffset - (fieldOffset - containerOffset) });
          } else {
            // vertical align each inner option
            $control.find(CHECK_RADIO_OPTIONS).each(function () {
              $(this).offset({ top: containerOffset + CHECK_RADIO_CONTAINER_DISTANCE });
            });

            // resize the container
            resetResizableMinHeightAndWidth($control);
            $control.css('height', $control.resizable("option", "minHeight"));

            // move the container to align the fields to the specified topOffset
            $control.offset({ top: topOffset - CHECK_RADIO_CONTAINER_DISTANCE });
          }
        };

        /** Horizontally aligns the inner fields to the passed leftOffset for the specified control **/
        function horizontalAlign(control, leftOffset) {
          /// <summary>Horizontally aligns the inner fields to the passed leftOffset for the specified control.</summary>
          /// <param name="control" type="Object">The field container element.</param>
          /// <param name="leftOffset" type="Number">The left offset to set the inner fields to.</param>

          var $control = $(control);
          var type = xr2formsCommon.getType($control);
          var containerOffset = $control.offset().left;

          if (type !== 'checkbox' && type !== 'radio') {
            var fieldOffset = $control.find('input, select, canvas, label, a').first().offset().left;
            $control.offset({ left: leftOffset - (fieldOffset - containerOffset) });
          } else {
            // horizontal align each inner option
            $control.find(CHECK_RADIO_OPTIONS).each(function () {
              $(this).offset({ left: containerOffset + CHECK_RADIO_CONTAINER_DISTANCE });
            });

            // resize the container
            resetResizableMinHeightAndWidth($control);
            $control.css('width', $control.resizable("option", "minWidth"));

            // move the container to align the fields to the specified topOffset
            $control.offset({ left: leftOffset - CHECK_RADIO_CONTAINER_DISTANCE });
          }
        };

        //#endregion

        //#region Public Methods

        /** Vertically aligns the specified controls with the top most field **/
        this.alignTop = function (controls) {
          /// <summary>Vertically aligns the specified controls with the top most field.</summary>
          /// <param name="controls" type="Object">The field container elements to align.</param>

          var minTop = 999999;

          // get the min top offset for each field
          $(controls).each(function () {
            var offset = getMinTopOffset($(this));
            if (offset < minTop) {
              minTop = offset;
            }
          });

          // set the top offset of each field to the min top calculated
          $(controls).each(function () {
            verticalAlign(this, minTop);
          });
        };

        /** Vertically aligns the specified controls with the bottom most field **/
        this.alignBottom = function (controls) {
          /// <summary>Vertically aligns the specified controls with the bottom most field.</summary>
          /// <param name="controls" type="Object">The field container elements to align.</param>

          var maxHeight = -1;

          // get the min top offset for each field
          $(controls).each(function () {
            var offset = getMaxBottomOffset($(this));
            if (offset > maxHeight) {
              maxHeight = offset;
            }
          });

          // set the top offset of each field to the min top calculated
          $(controls).each(function () {
            var type = xr2formsCommon.getType($(this)),
              fieldHeight;

            if (type !== 'checkbox' && type !== 'radio') {
              fieldHeight = $(this).find('input, select, canvas, label, a').first().height();
            } else {
              fieldHeight = $(this).find(CHECK_RADIO_OPTIONS).first().height();
            }

            verticalAlign(this, maxHeight - fieldHeight);
          });
        };

        /** Horizontally aligns the specified controls with the left most field **/
        this.alignLeft = function (controls) {
          /// <summary>Horizontally aligns the specified controls with the left most field.</summary>
          /// <param name="controls" type="Object">The field container elements to align.</param>

          var minLeft = 999999;

          // get the min left offset for each field
          $(controls).each(function () {
            var offset = getMinLeftOffset($(this));
            if (offset < minLeft) {
              minLeft = offset;
            }
          });

          // set the top offset of each field to the min top calculated
          $(controls).each(function () {
            horizontalAlign(this, minLeft);
          });
        };

        /** Horizontally aligns the specified controls with the right most field **/
        this.alignRight = function (controls) {
          /// <summary>Horizontally aligns the specified controls with the right most field.</summary>
          /// <param name="controls" type="Object">The field container elements to align.</param>

          var maxWidth = -1;

          // get the min top offset for each field
          $(controls).each(function () {
            var offset = getMaxLeftOffset($(this));
            if (offset > maxWidth) {
              maxWidth = offset;
            }
          });

          // set the top offset of each field to the min top calculated
          $(controls).each(function () {
            var type = xr2formsCommon.getType($(this)),
              fieldWidth;

            if (type !== 'checkbox' && type !== 'radio') {
              fieldWidth = $(this).find('input, select, canvas, label, a').first().width();
            } else {
              fieldWidth = $(this).find(CHECK_RADIO_OPTIONS).first().width();
            }

            horizontalAlign(this, maxWidth - fieldWidth);
          });
        };

        //#endregion
      };

      // Provides functions to clone fields
      var cloning = new function () {

        this.cloneField = function (field) {
          // check if in preview mode
          if (!inPreviewMode()) {

            var $field = $(field);
            if ($field.length === 1) {

              // get field metadata
              var fieldMetadata = getFieldMetadata($field, true);
              var fieldId = fieldMetadata.FieldId.slice(0, fieldMetadata.FieldId.indexOf('-'));

              // make sure that no other field has the same id on the form
              var newFieldId = generatePseudoGuid().replace(/-/g, '');
              while ($('#' + newFieldId + '-container').length !== 0) {
                newFieldId = generatePseudoGuid().replace(/-/g, '');
              }

              // Replace the ID on the possible properties
              // fieldID, HTML field container ID, name
              fieldMetadata[xr2formsCommon.vars.DATA_FIELD_ID] = fieldMetadata[xr2formsCommon.vars.DATA_FIELD_ID].replace(fieldId, newFieldId);
              fieldMetadata[xr2formsCommon.vars.DATA_HTML] = fieldMetadata[xr2formsCommon.vars.DATA_HTML].replace(new RegExp(fieldId, 'g'), newFieldId);
              fieldMetadata[xr2formsCommon.vars.DATA_NAME] = 'My field ' + ($fieldsCounter + 1); // fieldsCounter increased by the setFieldMetadata

              // clone the field
              var clonedField = setFieldMetadata(fieldMetadata);

              // Replace the name on the generated html
              clonedField.find('input, select, label, a').attr('name', 'My field ' + $fieldsCounter);

              // Move the field so it doesn't overlap with the original
              clonedField.css('top', (parseInt(clonedField.css('top').replace('px', '')) + 30).toString() + 'px');
              clonedField.css('left', (parseInt(clonedField.css('left').replace('px', '')) + 50).toString() + 'px');

              selectField(clonedField);
            }

          }
        };
      };
      //#endregion



      //#region AUXILIAR FUNCTIONS

      /** Pseudo GUID Generator  **/
      function generatePseudoGuid() {
        var s4 = function () {
          return (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);
        };
        return (s4() + s4() + "-" + s4() + "-" + s4() + "-" + s4() + "-" + s4() + s4() + s4());
      }

      /** Returns a copy of an item - objects or basic types **/
      function getDeepCopy(item) {
        if (typeof item === 'object') {
          var res = new Object();
          $.each(item, function (key, value) {
            res[key] = getDeepCopy(value);
          });
          return res;
        } else {
          return item;
        }
      }

      /** jQuey extension method to filter the elements of a select list **/
      jQuery.fn.filterByText = function (textbox, selectSingleMatch) {
        return this.each(function () {
          var select = this;
          var selectOptions = [];
          $(select).find('option').each(function () {
            selectOptions.push({ value: $(this).val(), text: $(this).text() });
          });
          $(select).data('options', selectOptions);
          $(textbox).unbind('change keyup').bind('change keyup', function () {
            var valueOptions = $(select).empty().data('options');
            var search = $.trim($(this).val());
            var regex = new RegExp(search, 'gi');

            $.each(valueOptions, function (i) {
              var option = valueOptions[i];
              if (option.text.match(regex) !== null) {
                $(select).append(
                  $('<option>').text(option.text).val(option.value)
                );
              }
            });
            if (selectSingleMatch === true &&
              $(select).children().length === 1) {
              $(select).children().get(0).selected = true;
            }
          });
        });
      };

      //#endregion

      //#region COMMON FUNCTIONS

      /** Makes a field resizeable **/
      function makeFieldResizable(fieldContainer) {
        var columnWidth = $formBuilder.width() / 4,
          margin = .04 * (columnWidth * 4),
          max = (columnWidth * 4) - margin;

        fieldContainer.resizable({
          handles: 'se',                                  // which handles can be used for resizing
          maxWidth: max,                                  // the maximum width the resizable should be allowed to resize to
          minWidth: getFieldMinWidth(fieldContainer),     // the minimum width the resizable should be allowed to resize to
          minHeight: getFieldMinHeight(fieldContainer)    // the minimum height the resizable should be allowed to resize to
        });
      }

      /** Sets the MinHeight and MinWidth attribute for a resizable control **/
      function resetResizableMinHeightAndWidth(fieldContainer) {
        fieldContainer.resizable("option", "minHeight", getFieldMinHeight(fieldContainer));
        fieldContainer.resizable("option", "minWidth", getFieldMinWidth(fieldContainer));

        // Calculate, adjust and modify the minimum height and width when necessary
        var currentMinHeight = fieldContainer.resizable("option", "minHeight");
        if (fieldContainer.height() < currentMinHeight)
          fieldContainer.css('height', '').height(currentMinHeight);
        var currentMinWidth = fieldContainer.resizable("option", "minWidth");
        if (fieldContainer.width() < currentMinWidth)
          fieldContainer.css('width', '').width(currentMinWidth);
      }

      /** Returns the min width for a resizable field based on the field's type **/
      function getFieldMinWidth(fieldContainer) {
        var fieldType = xr2formsCommon.getType(fieldContainer);

        switch (fieldType) {
          case "text": case "password": case "email": case "number": case "date": case "select": case "label": case "link":
          return 10;
          case "canvas":
            return 50;

          // in these cases we need to calculate the width based on the position of the internal options plus the width when using labels
          case "radio": case "checkbox":
          var rightmost = 0;
          var controlOffset = fieldContainer.offset().left;
          fieldContainer.find(CHECK_RADIO_OPTIONS).each(function () {
            // calculate the option's left offset + width
            var currentLeftValue = $(this).offset().left + $(this).width() - controlOffset;

            // update the rightmost variable when appropriate
            if (currentLeftValue > rightmost) {
              rightmost = currentLeftValue;
            }
          });
          return rightmost;
        }

        // for completion purposes
        return 10;
      }

      /** Returns the min height for a resizable control based on the control's type **/
      function getFieldMinHeight(fieldContainer) {
        var innerField = '';
        var fieldType = xr2formsCommon.getType(fieldContainer);

        switch (fieldType) {
          case "text": case "password": case "email": case "number": case "date":
          innerField = 'input';
          break;
          case "select":
            innerField = 'select';
            break;
          case "label":
            innerField = 'label';
            break;
          case "link":
            innerField = 'a';
            break;
          case "canvas":
            return 20;

          // in these cases we need to calculate the height based on the position of the internal options
          case "radio": case "checkbox":
          var lowest;
          var controlOffset = fieldContainer.offset().top;
          fieldContainer.find(CHECK_RADIO_OPTIONS).each(function () {
            // calculate the option's top offset
            var currentTopValue = $(this).offset().top - controlOffset;

            // update the lowest variable when appropriate
            if (lowest === undefined || (currentTopValue > lowest.offset().top - controlOffset))
              lowest = $(this);
          });
          return (lowest.offset().top - controlOffset) + lowest.height();
        }

        return fieldContainer.find(innerField).first().height() + 6;
      }

      /** Loads the saved values and binds the change event for the settings on the section **/
      function bindPropertySettings(settingSection, currentField, updateCallback) {

        settingSection.find('input, select, textarea').each(function () {
          var property = $(this).attr('data-property'),
            value, attributes = {};

          // unbind old event handler
          $(this).unbind('change textchange');

          // if there is a value for this rule set it
          value = (currentField.data(property) !== undefined) ? currentField.data(property) : '';
          if (value !== '') {
            if ($(this).is('input')) {
              if ($(this).attr('type') === 'checkbox') {
                attributes = { 'checked': value };
              }
              else if ($(this).attr('type') === 'radio') {
                if ($(this).val() === value)
                  attributes = { 'checked': 'checked' };
              }
              else attributes = { 'value': value };
            } else {
              attributes = { 'value': value };
            }
            // apply attributes variable
            $(this).attr(attributes);

            // for select fields check that the applied value corresponds - important: == not ===
            if ($(this).is('select') && $(this).val() == undefined) {
              $(this).val('');
            }

          } else {
            if ($(this).is('input')) {
              if ($(this).attr('type') === 'checkbox' || $(this).attr('type') === 'radio') {
                $(this).removeAttr('checked');
              } else {
                $(this).val(undefined);
              }
            } else if ($(this).is('select')) {
              $(this).val('');
            }
          }

          // bind the change event handler
          if (updateCallback !== 'undefined' && $.isFunction(updateCallback)) {
            $(this).bind('change textchange', function () {
              updateCallback(currentField, $(this), property);
            });
          }
        });
      }

      /** Opens a modal confirmation dialog with the supplied title and message. If the user confirms, the action supplied is executed **/
      function confirmAction(action, title, message) {
        // if no title is passed, use a default one
        if (title === undefined)
          title = DEFAULT_CONFIRM_ACTION_TITLE;

        // set the corresponding message
        if (message !== undefined)
          $confirmDialog.find('.' + MESSAGE_CLASS).html(message).css('display', 'block');
        else
          $confirmDialog.find('.' + MESSAGE_CLASS).html('').css('display', 'none');

        // show the jQueryUI modal dialog
        $confirmDialog.dialog({
          resizable: false,
          title: title,
          modal: true,
          buttons: {
            "Yes": function () {
              $(this).dialog("close");
              // in this case, execute the supplied action
              if (action !== undefined && $.isFunction(action)) {
                action();
              }
            },
            Cancel: function () {
              $(this).dialog("close");
            }
          }
        });
      }

      //#endregion


      //#region DESIGNER BASIC FUNCTIONS

      /** Adds a field to the form **/
      function addField(fieldType, positionLeft, positionTop) {

        // insert the new field on the xr2designer
        var newFieldContainer = insertNewField(fieldType, positionLeft, positionTop);

        // select the newly added field
        selectField(newFieldContainer);
      }

      /** Adds a field to the form **/
      function insertNewField(fieldType, positionLeft, positionTop) {

        if (positionLeft == undefined)
          positionLeft = 50;
        if (positionTop == undefined)
          positionTop = 50;

        // make sure that no other field has the same id on the form
        var fieldId = generatePseudoGuid().replace(/-/g, '');
        while ($container.find('#' + fieldId + '-container').length !== 0) {
          fieldId = generatePseudoGuid().replace(/-/g, '');
        }

        // increase the fields counter
        $fieldsCounter++;

        // set properties for the field template
        var field = {
          fieldType: fieldType,
          name: 'My field ' + $fieldsCounter,
          id: fieldId,
          actionsType: 'field'
        };

        // add the field to the form
        $formDesigner = $container.find('#form-preview');
        $formTemplates = $container.find('#form-elements-tmpl');
        $formTemplates.tmpl(field).appendTo($formDesigner);

        var thisNewField = $container.find('#' + fieldId),
          newFieldContainer = $container.find('#' + fieldId + '-container');

        // add the new field to the field collection object
        $fieldsCollection[newFieldContainer.attr('id')] = xr2formsCommon.getType(newFieldContainer);

        // setup container data
        if (fieldType === FIELD_TYPE_CHECKBOX || fieldType === FIELD_TYPE_RADIO) {
          newFieldContainer.data(xr2formsCommon.vars.DATA_NAME, newFieldContainer.find('input:first').attr('name'));
        } else {
          newFieldContainer.data(xr2formsCommon.vars.DATA_NAME, thisNewField.attr('name'));
        }

        if (fieldType !== FIELD_TYPE_CHECKBOX && fieldType !== FIELD_TYPE_LABEL && fieldType !== FIELD_TYPE_LINK) {
          newFieldContainer.data(xr2formsCommon.vars.DATA_REQUIRED, 'checked');
        }

        if (fieldType === FIELD_TYPE_SELECT) {
          newFieldContainer.data(xr2formsCommon.vars.DATA_SELECT_TITLE, '- Select a value -');
          newFieldContainer.data(xr2formsCommon.vars.DATA_SELECT_SOURCE, xr2formsCommon.vars.SELECT_SOURCE_MANUAL);
        }

        if ($.inArray(fieldType, [FIELD_TYPE_LABEL, FIELD_TYPE_LINK]) !== -1) {
          newFieldContainer.data(xr2formsCommon.vars.DATA_INITIAL_VALUE, thisNewField.html());
        }

        if (fieldType === FIELD_TYPE_LINK) {
          newFieldContainer.data(xr2formsCommon.vars.DATA_HREF, thisNewField.attr('href'));
        }

        // If date field, setup datepicker
        if (fieldType === FIELD_TYPE_DATE) {
          thisNewField.datepicker({
            dateFormat: xr2formsCommon.vars.DATE_FORMAT,
            changeMonth: true,
            changeYear: true,
            showButtonPanel: true,
            showOtherMonths: true,
            selectOtherMonths: true,
            yearRange: '-150:+10'
          });
        }

        // Apply uniform style to checkboxes and radio buttons
        if (useUniform && (fieldType === FIELD_TYPE_CHECKBOX || fieldType === FIELD_TYPE_RADIO)) {
          newFieldContainer.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).uniform().removeAttr('style');
        }

        // Make the field resizable
        makeFieldResizable(newFieldContainer.animate({ opacity: 1 }, 'fast'));

        // Make the field draggable
        newFieldContainer.draggable({ containment: $workArea });

        // Make the checkboxes and radio buttons draggables inside their container
        newFieldContainer.find(CHECK_RADIO_OPTIONS).draggable({
          containment: 'parent', stop: function (event, ui) {
            var fieldContainer = ui.helper.parent();
            resetResizableMinHeightAndWidth(fieldContainer);
          }
        });

        // Position the field according to the dropped item's position
        newFieldContainer.css('left', positionLeft + 'px');
        newFieldContainer.css('top', positionTop + 'px');

        return newFieldContainer;
      }

      /** Selects a field **/
      function selectField(container) {
        var $fieldContainer = $(container),
          prevSelected = $clickedContainerField;

        //  deselect any previous selected field
        deselectFields();

        // mark the field as selected
        designerUIControl.SelectField($fieldContainer);

        // reset the properties sections when a single field is selected
        if ($container.find('.' + SELECTED_FIELD_CLASS).length === 1) {
          $clickedContainerField = $fieldContainer;

          if (prevSelected === undefined || prevSelected.attr('id') !== $fieldContainer.attr('id')) {
            resetFieldSettings($fieldContainer, xr2formsCommon.getType($fieldContainer));
          }
          designerUIControl.ShowProperties();
        }
      }

      /** Selects multiples fields **/
      function selectMultipleFields(container) {
        // mark the field as selected
        designerUIControl.SelectField($(container));
        // hide the properties section, since multiples fields are been selected
        designerUIControl.HideProperties();
      }

      /** Deselects any previously selected field **/
      function deselectFields() {
        designerUIControl.DeselectFields();
        designerUIControl.HideProperties();
      }

      /** Removes a field from the form **/
      function removeField(field) {
        delete $fieldsCollection[field.attr('id')];
        field.fadeOut();
        field.remove();
        deselectFields();
      }

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
        deselectFields();
        $formDesigner.html('').removeAttr('enctype');
        notificationService.ShowNotification('Form Reset');
      }

      //#endregion

      //#region MERGE FIELDS / SELECT SOURCE FUNCTIONS

      //#region sync functions

      /** This function is called from the server on initialization, to provide the possible merge fields **/
      function addStringMergeField(mergeFieldId, mergeFieldKey, isPostBack, minlength, maxlength, testValue) {
        mergeFieldDefinitionsDictionary[mergeFieldId] = new Object();
        mergeFieldDefinitionsDictionary[mergeFieldId].type = MERGEFIELD_TYPE_STRING;
        mergeFieldDefinitionsDictionary[mergeFieldId].key = mergeFieldKey;
        mergeFieldDefinitionsDictionary[mergeFieldId].postBack = isPostBack;
        mergeFieldDefinitionsDictionary[mergeFieldId].minlength = minlength;
        mergeFieldDefinitionsDictionary[mergeFieldId].maxlength = maxlength;
        mergeFieldDefinitionsDictionary[mergeFieldId].testValue = testValue;
      }

      /** This function is called from the server on initialization, to provide the possible merge fields **/
      function addDateMergeField(mergeFieldId, mergeFieldKey, isPostBack, minDate, maxDate, testValue) {
        mergeFieldDefinitionsDictionary[mergeFieldId] = new Object();
        mergeFieldDefinitionsDictionary[mergeFieldId].type = MERGEFIELD_TYPE_DATE;
        mergeFieldDefinitionsDictionary[mergeFieldId].key = mergeFieldKey;
        mergeFieldDefinitionsDictionary[mergeFieldId].postBack = isPostBack;
        mergeFieldDefinitionsDictionary[mergeFieldId].minDate = minDate;
        mergeFieldDefinitionsDictionary[mergeFieldId].maxDate = maxDate;
        mergeFieldDefinitionsDictionary[mergeFieldId].testValue = testValue.toLocaleDateString();
      }

      /** This function is called from the server on initialization, to provide the possible merge fields **/
      function addDecimalMergeField(mergeFieldId, mergeFieldKey, isPostBack, minNumber, maxNumber, testValue) {
        mergeFieldDefinitionsDictionary[mergeFieldId] = new Object();
        mergeFieldDefinitionsDictionary[mergeFieldId].type = MERGEFIELD_TYPE_DECIMAL;
        mergeFieldDefinitionsDictionary[mergeFieldId].key = mergeFieldKey;
        mergeFieldDefinitionsDictionary[mergeFieldId].postBack = isPostBack;
        mergeFieldDefinitionsDictionary[mergeFieldId].minNumber = minNumber;
        mergeFieldDefinitionsDictionary[mergeFieldId].maxNumber = maxNumber;
        mergeFieldDefinitionsDictionary[mergeFieldId].testValue = testValue;
      }

      /** This function is called from the server on initialization, to provide the possible merge fields **/
      function addSelectMergeField(mergeFieldId, mergeFieldKey, isPostBack, selectType, values, testValue) {
        mergeFieldDefinitionsDictionary[mergeFieldId] = new Object();
        mergeFieldDefinitionsDictionary[mergeFieldId].type = MERGEFIELD_TYPE_SELECT;
        mergeFieldDefinitionsDictionary[mergeFieldId].key = mergeFieldKey;
        mergeFieldDefinitionsDictionary[mergeFieldId].postBack = isPostBack;
        mergeFieldDefinitionsDictionary[mergeFieldId].selectType = selectType;
        mergeFieldDefinitionsDictionary[mergeFieldId].values = values;
        mergeFieldDefinitionsDictionary[mergeFieldId].testValue = testValue;
      }

      /** This function is called from the server on initialization, to provide the possible pairs
       of key-value to use as 'premade sources' for 'select' fields **/
      function addComboValueKeyValuePair(key, value) {
        comboValuesDictionary[key] = value;
      }

      //#endregion

      function showMergeFieldDialog() {
        // clear and reload the available merge fields
        var selectListControl = $addInitialValueDialog.find('select');
        selectListControl.html('');

        for (var mergeId in mergeFieldDefinitionsDictionary) {
          selectListControl.append("<option value=\"" + mergeId + "\">" + mergeFieldDefinitionsDictionary[mergeId].key + "</option>");
        }

        // make the combobox filterable
        var filterText = $addInitialValueDialog.find('#filterTextbox');
        filterText.val('');
        selectListControl.filterByText(filterText, true);

        // show the dialog to the user
        $addInitialValueDialog.dialog({
          title: 'Add new merge field',
          resizable: false,
          modal: true,
          buttons: {
            "Add field": function () {
              $(this).dialog("close");
              // if the users selects one of the initial values, insert it on the appropriate setting
              if (selectListControl.val() !== null && selectListControl.val() !== undefined) {
                addMergeField(selectListControl.val());
              }
            },
            Cancel: function () {
              $(this).dialog("close");
            }
          }
        });
      }

      function addMergeField(mergeFieldId) {
        if (mergeFieldDefinitionsDictionary[mergeFieldId] !== undefined) {

          if ((mergeFieldDefinitionsDictionary[mergeFieldId].type === MERGEFIELD_TYPE_STRING)
            || (mergeFieldDefinitionsDictionary[mergeFieldId].type === MERGEFIELD_TYPE_SELECT && mergeFieldDefinitionsDictionary[mergeFieldId].selectType === MERGEFIELD_TYPE_SINGLE)) {

            selectMergeFieldType(mergeFieldId, mergeFieldDefinitionsDictionary[mergeFieldId].type);
          } else {
            if (mergeFieldDefinitionsDictionary[mergeFieldId].type === MERGEFIELD_TYPE_DATE) {
              addMergeFieldType(mergeFieldId, 'date-field');
            } else if (mergeFieldDefinitionsDictionary[mergeFieldId].type === MERGEFIELD_TYPE_DECIMAL) {
              addMergeFieldType(mergeFieldId, 'number-field');
            } else if (mergeFieldDefinitionsDictionary[mergeFieldId].type === MERGEFIELD_TYPE_SELECT && mergeFieldDefinitionsDictionary[mergeFieldId].selectType === MERGEFIELD_TYPE_MULTIPLE) {
              addMergeFieldType(mergeFieldId, 'checkbox-field');
            }
          }

        }
      }

      function selectMergeFieldType(mergeFieldId, type) {
        // hide all section
        designerUIControl.HideSection($selectMergeFieldTypeDialog.find('div[data-type]'));

        var section = $selectMergeFieldTypeDialog.find('div[data-type="' + type + '"]');
        if (section.length > 0) {
          // show the corresponding section based on the type
          designerUIControl.ShowSection(section);

          // select the firt option
          section.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).first().trigger('click');

          // show the dialog to the user
          $selectMergeFieldTypeDialog.dialog({
            title: 'Select a type for this field',
            resizable: false,
            modal: true,
            buttons: {
              "Add field": function () {
                $(this).dialog("close");
                // insert the selected option
                addMergeFieldType(mergeFieldId, section.find(xr2formsCommon.vars.CHECKED_INPUT).val());
              }
            }
          });
        }
      }

      function addMergeFieldType(mergeFieldId, fieldType) {
        // add the corresponding field
        var newField = insertNewField(fieldType);
        // mark the fiels as merge field
        newField.attr('data-mfType', 'checked');
        newField.data(xr2formsCommon.vars.DATA_MERGE_FIELD_ID, mergeFieldId);

        //#region text field
        if (fieldType === 'text-field') {
          // set the metadata manually
          if (mergeFieldDefinitionsDictionary[mergeFieldId].postBack === 'True') {
            newField.data(xr2formsCommon.vars.DATA_OUT_FIELD_ID, mergeFieldId);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].minlength !== '') {
            newField.data(xr2formsCommon.vars.DATA_MIN_LENGTH, mergeFieldDefinitionsDictionary[mergeFieldId].minlength);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].maxlength !== '') {
            newField.data(xr2formsCommon.vars.DATA_MAX_LENGTH, mergeFieldDefinitionsDictionary[mergeFieldId].maxlength);
          }
        }
        //#endregion

        //#region label field
        if (fieldType === 'label-field') {
          // set the metadata manually
          newField.find('label').html("[" + mergeFieldDefinitionsDictionary[mergeFieldId].key + "]");
        }
        //#endregion

        //#region mail field
        if (fieldType === 'email-field') {
          // set the metadata manually
          if (mergeFieldDefinitionsDictionary[mergeFieldId].postBack === 'True') {
            newField.data(xr2formsCommon.vars.DATA_OUT_FIELD_ID, mergeFieldId);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].minlength !== '') {
            newField.data(xr2formsCommon.vars.DATA_MIN_LENGTH, mergeFieldDefinitionsDictionary[mergeFieldId].minlength);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].maxlength !== '') {
            newField.data(xr2formsCommon.vars.DATA_MAX_LENGTH, mergeFieldDefinitionsDictionary[mergeFieldId].maxlength);
          }
        }
        //#endregion

        //#region date field
        if (fieldType === 'date-field') {
          // set the metadata manually
          if (mergeFieldDefinitionsDictionary[mergeFieldId].postBack === 'True') {
            newField.data(xr2formsCommon.vars.DATA_OUT_FIELD_ID, mergeFieldId);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].minDate !== '') {
            newField.data(xr2formsCommon.vars.DATA_MIN_DATE, mergeFieldDefinitionsDictionary[mergeFieldId].minDate);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].maxDate !== '') {
            newField.data(xr2formsCommon.vars.DATA_MAX_DATE, mergeFieldDefinitionsDictionary[mergeFieldId].maxDate);
          }
        }
        //#endregion

        //#region number field
        if (fieldType === 'number-field') {
          // set the metadata manually
          if (mergeFieldDefinitionsDictionary[mergeFieldId].postBack === 'True') {
            newField.data(xr2formsCommon.vars.DATA_OUT_FIELD_ID, mergeFieldId);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].minNumber !== '') {
            newField.data(xr2formsCommon.vars.DATA_MIN_NUMBER, mergeFieldDefinitionsDictionary[mergeFieldId].minNumber);
          }
          if (mergeFieldDefinitionsDictionary[mergeFieldId].maxNumber !== '') {
            newField.data(xr2formsCommon.vars.DATA_MAX_NUMBER, mergeFieldDefinitionsDictionary[mergeFieldId].maxNumber);
          }
        }
        //#endregion

        //#region select field
        if (fieldType === 'select-field') {

          // set the metadata manually
          if (mergeFieldDefinitionsDictionary[mergeFieldId].postBack === 'True') {
            newField.data(xr2formsCommon.vars.DATA_OUT_FIELD_ID, mergeFieldId);
          }

          // load the values
          newField.find('select').html('');

          var newFieldId = newField.attr('id'),
            fieldName = newField.data().name;

          var values = mergeFieldDefinitionsDictionary[mergeFieldId].values;
          for (var i = 0; i < values.length; i++) {
            // set the options to use on the template
            var newOptionNum = i + 1;
            var id = newFieldId.slice(0, newFieldId.indexOf('-') + 1) + newOptionNum;
            option = {
              fieldType: 'select-option',
              name: fieldName,
              id: id,
              option: values[i]
            };

            // append the new option to its parent
            $formTemplates.tmpl(option).appendTo(newField.find('select'));
          }
        }
        //#endregion

        //#region radio field
        if (fieldType === 'radio-field') {

          // set the metadata manually
          if (mergeFieldDefinitionsDictionary[mergeFieldId].postBack === 'True') {
            newField.data(xr2formsCommon.vars.DATA_OUT_FIELD_ID, mergeFieldId);
          }

          // load the values
          newField.find('.option').remove();

          var newFieldId = newField.attr('id'),
            fieldName = newField.data().name;

          var values = mergeFieldDefinitionsDictionary[mergeFieldId].values;
          for (var j = 0; j < values.length; j++) {
            // set the options to use on the template
            var newOptionNum = j + 1;
            var id = newFieldId.slice(0, newFieldId.indexOf('-') + 1) + newOptionNum;
            option = {
              fieldType: 'radio-option',
              type: 'radio',
              name: fieldName,
              id: id,
              option: values[j]
            };

            // append the new option to its parent
            $formTemplates.tmpl(option).appendTo(newField);
          }

          // apply the uniform plugin to the newly added option
          newField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).each(function () {
            $(this).uniform();
            $(this).removeAttr('style');
          });

          // make newly option draggable
          newField.find('.option').draggable({ containment: 'parent' });

          // bind the handler to reset the minimums height and width after an option is dragged
          newField.find('.option').bind("dragstop", function (event, ui) {
            var fieldContainer = ui.helper.parent();
            resetResizableMinHeightAndWidth(fieldContainer);
          });

          // Calculate, adjust and modify the minimum height and width when necessary
          resetResizableMinHeightAndWidth(newField);
        }
        //#endregion

        //#region check field
        if (fieldType === 'checkbox-field') {

          // set the metadata manually
          if (mergeFieldDefinitionsDictionary[mergeFieldId].postBack === 'True') {
            newField.data(xr2formsCommon.vars.DATA_OUT_FIELD_ID, mergeFieldId);
          }

          // load the values
          newField.find('.option').remove();

          var newFieldId = newField.attr('id'),
            fieldName = newField.data().name;

          // load the values
          var values = mergeFieldDefinitionsDictionary[mergeFieldId].values;
          for (var j = 0; j < values.length; j++) {
            // set the options to use on the template
            var newOptionNum = j + 1;
            var id = newFieldId.slice(0, newFieldId.indexOf('-') + 1) + newOptionNum;
            option = {
              fieldType: 'checkbox-option',
              type: 'checkbox',
              name: fieldName,
              id: id,
              option: values[j]
            };

            // append the new option to its parent
            $formTemplates.tmpl(option).appendTo(newField);
          }

          // apply the uniform plugin to the newly added option
          newField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).each(function () {
            $(this).uniform();
            $(this).removeAttr('style');
          });

          // make newly option draggable
          newField.find('.option').draggable({ containment: 'parent' });

          // bind the handler to reset the minimums height and width after an option is dragged
          newField.find('.option').bind("dragstop", function (event, ui) {
            var fieldContainer = ui.helper.parent();
            resetResizableMinHeightAndWidth(fieldContainer);
          });

          // Calculate, adjust and modify the minimum height and width when necessary
          resetResizableMinHeightAndWidth(newField);
        }
        //#endregion

        // select the new field
        selectField(newField);
      }

      //#endregion




      //#region RESET FIELD SETTINGS FUNCTIONS

      /** Reset the field settings dialog for the current field **/
      function resetFieldSettings(currentField, fieldType) {

        // hide all sections. They will be re-enabled based on rules and current inputs later
        $mainSettings.find('div.setting').each(function () {
          designerUIControl.HideSection($(this));
        });

        // hide advanced message
        designerUIControl.HideSection($mainSettingsMessage);

        if ($.inArray(fieldType, ['checkbox', 'radio', 'select']) !== -1) {
          // reset the option values container in case the fields uses it
          $inputSettings.html('');
          // load initial values
          loadInitialValues(currentField, fieldType);
        }

        // if the field is a select, load the field source premade fixed values
        if (fieldType === 'select') {
          loadSelectPrefixedSources();
        }

        // load the saved values, and bind the change event
        bindPropertySettings($mainSettings, currentField, updateMainSettings);

        var inBasicMode = designerStatus.InBasicMode();

        // iterate through the settings defined for the field
        var fieldSettings = fieldSettingsByType.main.fields[fieldType];
        for (var index = 0; index < fieldSettings.length; index++) {
          var setting = fieldSettings[index];

          // check whether the setting should be displayed
          var settingBox;
          if (!inBasicMode || fieldSettingsByType.main.settings[setting] === BASIC) {
            // show this option
            settingBox = $mainSettings.find('div[data-name="' + setting + '"]');
            designerUIControl.ShowSection(settingBox.parent());
          }

          //#region extra UI logic - set  ID's, dates, disable options
          var settingField;
          if (setting === 'id') {
            var currentInput = currentField.find('input, select, label, a').first();
            settingField = $mainSettings.find('div[data-name="' + setting + '"] input').first();
            settingField.val(currentInput.attr('id'));
          } else if (setting === 'groupId') {
            settingField = $mainSettings.find('div[data-name="' + setting + '"] input').first();
            settingField.val(currentField.attr('id'));
          } else if (setting === 'datepickerInitialValue') {
            settingField = $mainSettings.find('div[data-name="' + setting + '"] input').first();
            var fieldProperty = settingField.attr('data-property');
            if (currentField.data(fieldProperty) !== undefined && currentField.data(fieldProperty) !== '' && !isNaN(Date.parse(currentField.data(fieldProperty)))) {
              var date = $.datepicker.parseDate(xr2formsCommon.vars.DATE_FORMAT, currentField.data(fieldProperty));
              settingField.datepicker("setDate", date);
            }
          }
          //#endregion
        }

        // show the corresponding section for select fields based on the selected source
        var source;
        if (fieldType === 'select') {
          source = currentField.data(xr2formsCommon.vars.DATA_SELECT_SOURCE);
          if (source === xr2formsCommon.vars.SELECT_SOURCE_FIXED) {
            showFixedComboSettings();
          } else {
            showManualComboSettings();
          }
        }

        // reset the option values for check/radio/select fields
        if (($.inArray(fieldType, ['checkbox', 'radio']) !== -1) || (fieldType === 'select')) {
          resetInputSettings(currentField);
        }

        // display the advanced message when correspond
        if (inBasicMode) {
          var areAdvancedProperties = false;
          for (var mainSetting in fieldSettingsByType.main.fields[fieldType]) {
            if (fieldSettingsByType.main.settings[mainSetting] === ADVANCED) {
              var property = fieldSettingsByType.main.targetProperties[mainSetting];
              if (currentField.data(property) !== undefined) {

                // check that some properties are allowed to have certain values
                if (mainSetting !== 'selectFieldSource' || currentField.data(property) !== xr2formsCommon.vars.SELECT_SOURCE_MANUAL) {
                  areAdvancedProperties = true;
                  break;
                }

              }
            }
          }
          if (areAdvancedProperties) {
            designerUIControl.ShowSection($mainSettingsMessage);
          }
        }

        resetValidationSettings(currentField, fieldType);
      }

      /** Resets the option values for check/radio/select fields  **/
      function resetInputSettings(currentField) {
        $inputSettings.html('');

        currentField.find("input, option").each(function () {
          var thisInputField = $(this),
            thisInputFieldId = thisInputField.attr('id'),
            thisInputFieldSettings;

          // add an "option name" field for each option/choice
          $inputSettings.append($inputSettingsTmpl.tmpl({ id: thisInputFieldId + '-setting' }));

          // the handle to the "option name" field we just created
          thisInputFieldSettings = $container.find('#' + thisInputFieldId + '-setting');

          // populate existing values
          var settingsInput = thisInputFieldSettings.find('input');
          settingsInput.val(thisInputField.attr('value'));

          // bind text change event for option
          bindInputOptionToFieldSettings(settingsInput, thisInputField);
        });

        //#region Make the rows sortable
        $inputSettings.sortable({
          //handle: 'span',
          placeholder: "ui-state-highlight",
          axis: 'y',
          opacity: 0.6,
          update: function (event, ui) {
            var settings = $inputSettings.children(),
              settingIndex = settings.index(ui.item),
              fieldId = ui.item.attr('id').replace('-setting', ''),
              fieldOptions = $clickedContainerField.find('input, option'),
              optionIndex = fieldOptions.index($clickedContainerField.find('#' + fieldId)),
              fieldType = $fieldsCollection[$clickedContainerField.attr('id')];

            // rearrange the option values
            if (optionIndex < settingIndex) {
              for (var i = optionIndex; i < settingIndex; i++) {
                $(fieldOptions.get(i)).attr('value', $(fieldOptions.get(i + 1)).attr('value'));
                if (fieldType === 'select') {
                  $(fieldOptions.get(i)).html($(fieldOptions.get(i + 1)).html());
                }
              }
            } else {
              for (var j = optionIndex; j > settingIndex; j--) {
                $(fieldOptions.get(j)).attr('value', $(fieldOptions.get(j - 1)).attr('value'));
                if (fieldType === 'select') {
                  $(fieldOptions.get(j)).html($(fieldOptions.get(j - 1)).html());
                }
              }
            }

            // update the sorted option value
            $(fieldOptions.get(settingIndex)).attr('value', ui.item.find('input').val());
            if (fieldType === 'select') {
              $(fieldOptions.get(settingIndex)).html(ui.item.find('input').val());
            }

            // reload the values section
            resetInputSettings($clickedContainerField);
            // update labels
            updateLabelsDisplay($clickedContainerField);
          }
        });
        //#endregion

        // remove the images when the field is a merge field - to disallow the user from deleting the values
        if (currentField.attr('data-mfType') !== undefined) {
          $inputSettings.find('img').remove();
        }
      }

      /** Reset the validation settings section of the field settings dialog **/
      function resetValidationSettings(currentField, fieldType) {

        // hide all sections. They will be re-enabled based on rules and current inputs later
        $validationSettings.find('div.setting').each(function () {
          designerUIControl.HideSection($(this));
        });

        // hide advanced message
        designerUIControl.HideSection($validationMessage);

        // reset the pattern drop down list if the fields uses it
        if (fieldSettingsByType.validation.patterns[fieldType] !== undefined) {
          designerUIControl.FilterPatternByField(fieldType);
        }

        // load the saved values, and bind the change event
        bindPropertySettings($validationSettings, currentField, updateValidationSettings);

        var inBasicMode = designerStatus.InBasicMode();

        // iterate through the settings defined for the field
        var fieldSettings = fieldSettingsByType.validation.fields[fieldType];
        for (var index = 0; index < fieldSettings.length; index++) {
          var setting = fieldSettings[index];

          // check whether the setting should be displayed
          var settingBox;
          if (!inBasicMode || fieldSettingsByType.validation.settings[setting] === BASIC) {
            // show this option
            settingBox = $validationSettings.find('div[data-name="' + setting + '"]');
            designerUIControl.ShowSection(settingBox.parent());
          }

          //#region extra UI logic - set dates, disable options
          var settingField, fieldProperty;
          if (setting === 'rangedate-min' || setting === 'rangedate-max') {
            settingField = $validationSettings.find('div[data-name="' + setting + '"] input').first();
            fieldProperty = settingField.attr('data-property');
            if (currentField.data(fieldProperty) !== undefined && currentField.data(fieldProperty) !== '' && !isNaN(Date.parse(currentField.data(fieldProperty)))) {
              var date = $.datepicker.parseDate(xr2formsCommon.vars.DATE_FORMAT, currentField.data(fieldProperty));
              settingField.datepicker("setDate", date);
            }
          } else if (setting === 'rangedate-min-current') {
            settingField = $validationSettings.find('div[data-name="' + setting + '"] input').first();
            if (settingField.is(xr2formsCommon.vars.CHECKED_INPUT)) {
              // need to disable the minimum date input field
              $rangedateMinInput.attr('disabled', 'disabled');
            } else {
              $rangedateMinInput.removeAttr('disabled');
            }
          }
          else if (setting === 'rangedate-max-current') {
            settingField = $validationSettings.find('div[data-name="' + setting + '"] input').first();
            if (settingField.is(xr2formsCommon.vars.CHECKED_INPUT)) {
              // need to disable the maximun date input field
              $rangedateMaxInput.attr('disabled', 'disabled');
            } else {
              $rangedateMaxInput.removeAttr('disabled');
            }
          } else if (setting === 'pattern' && inBasicMode) {
            // check whether the pattern was set in advanced mode
            settingField = $validationSettings.find('div[data-name="' + setting + '"] select').first();
            fieldProperty = settingField.attr('data-property');

            if (currentField.data(fieldProperty) !== undefined && settingField.val() === '') {
              // hide this setting and show the advanced message
              settingBox = $validationSettings.find('div[data-name="' + setting + '"]');
              designerUIControl.HideSection(settingBox.parent());
              designerUIControl.ShowSection($validationMessage);
            }
          }
          //#endregion
        }


        resetCustomValidationSettings(currentField, fieldType);
      }

      /** Reset the custom validation settings section of the field settings dialog **/
      function resetCustomValidationSettings(currentField, fieldType) {

        // clear the custom validation section
        $customValSection.html('');

        // hide the custom validation message
        designerUIControl.HideSection($customValidationMessage);

        // if there are any custom validation defined
        var valCount = currentField.data(xr2formsCommon.vars.DATA_VALIDATION_COUNT);
        if (valCount !== undefined && valCount > 0) {

          // display the advance style message when correspond
          if (designerStatus.InBasicMode()) {
            designerUIControl.ShowSection($customValidationMessage);
          } else {

            // loop through them, adding the corresponding settings
            for (var i = 1; i <= valCount; i++) {

              // add a new custom validation section
              addCustomValidationSection(i);

              // load the saved values, and bind the change event for the fields
              var valSetting = $container.find('#' + VAL_SETTING_PREFIX + i);
              bindPropertySettings(valSetting, currentField, updateCustomValidationSettings);

              // setup button for JS editor
              valSetting.find('.editFunctionButton').button();
              valSetting.find('.editFunctionButton').bind('click', { currentField: currentField, valSetting: valSetting }, showJsEditorForValidation);

              // make the custom validation section collapsible
              designerUIControl.MakeSectionsCollapsible(valSetting);
              // collapse the custom validaton
              designerUIControl.CollapseSections(valSetting);
            }

          }
        }

        resetDependencySettings(currentField, fieldType);
      }

      /** Reset the dependency settings section of the field settings dialog **/
      function resetDependencySettings(currentField, fieldType) {

        // clear the dependency section
        $dependencySection.html('');

        // hide the advanced message
        designerUIControl.HideSection($dependencyMessage);

        // if there are any dependencies defined
        var depCount = currentField.data(xr2formsCommon.vars.DATA_DEPENDENCY_COUNT);
        if (depCount !== undefined && depCount > 0) {
          var inBasicMode = designerStatus.InBasicMode();
          var areAdvancedProperties = false;

          // loop through them, adding the corresponding settings
          for (var i = 1; i <= depCount; i++) {
            if (inBasicMode && currentField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA)[i].mode !== xr2formsCommon.vars.DEPENDENCY_MODE_BASIC) {
              areAdvancedProperties = true;
            } else {
              resetDependency(currentField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA)[i], i, fieldType);
            }
          }

          // display the advanced message when correspond
          if (areAdvancedProperties) {
            designerUIControl.ShowSection($dependencyMessage);
          }
        }

        resetStyleSettings(currentField, fieldType);
      }

      /** Reset the style settings section of the field settings dialog **/
      function resetStyleSettings(currentField, fieldType) {

        // make sure the field has a style data property
        if (currentField.data(xr2formsCommon.vars.DATA_STYLE) === undefined) {
          prepareStyleData(currentField, fieldType);
        }

        var inBasicMode = designerStatus.InBasicMode();
        var settings = inBasicMode ? $styleBasicSettings : $styleAdvancedSettings;

        // show/hide the corresponding section based on the mode
        if (inBasicMode) {
          designerUIControl.HideSection($styleAdvancedSettings);
          designerUIControl.HideSection($styleMessage);
        } else {
          designerUIControl.HideSection($styleBasicSettings);
        }
        designerUIControl.ShowSection(settings);

        // hide all sections and properties inside
        settings.find('div.setting').each(function () {
          designerUIControl.HideSection($(this));
          $(this).find('input').each(function () {
            designerUIControl.HideSection($(this).parent());
          });
        });

        // load the saved values, and bind the change event
        var style = currentField.data(xr2formsCommon.vars.DATA_STYLE);
        settings.find('input').each(function () {
          var name = $(this).attr('name'),
            value = '';

          // if there is a value for this rule set it
          value = (style[name] !== undefined) ? style[name][xr2formsCommon.vars.DATA_STYLE_VALUE] : '';

          // transform the font-size into a number
          if (name === 'font-size') {
            value = value.replace('px', '');
          }

          // load the corresponding value
          $(this).val(value);

          //unbind old events, bind current field
          var isShortHand = $(this).parents('.' + STYLE_SHORTHAND_CLASS).first().length > 0;
          $(this).unbind('change textchange')
            .bind('change textchange', function () {
              updateStyleSettings(currentField, $(this), isShortHand, name);
            });
        });

        // iterate through the rules defined for the field
        var visibleSections = new Object();
        var fieldRules = fieldSettingsByType.style.fields[fieldType];
        for (var index = 0; index < fieldRules.length; index++) {
          var rule = fieldRules[index];

          // check whether the rule should be displayed
          if (!inBasicMode || fieldSettingsByType.style.rules[rule] === BASIC) {
            // show this option
            var ruleBox = settings.find('input[name="' + rule + '"]');
            designerUIControl.ShowSection(ruleBox.parent());
            // mark this collapsible section as visible
            var sectionName = ruleBox.parents('div.setting').attr('data-name');
            visibleSections[sectionName] = 1;
          }
        }

        // show the collapsible sections
        for (var section in visibleSections) {
          var ruleSection = settings.find('div[data-name="' + section + '"]');
          designerUIControl.ShowSection(ruleSection);
        }

        // display the advance style message when correspond
        if (inBasicMode) {
          var areAdvancedProperties = false;
          for (var styleRule in fieldSettingsByType.style.rules) {
            if (fieldSettingsByType.style.rules[styleRule] === ADVANCED && style[styleRule] !== undefined) {
              areAdvancedProperties = true;
              break;
            }
          }
          if (areAdvancedProperties) {
            designerUIControl.ShowSection($styleMessage);
          }
        }


        // Enable or disabled the properties when a merge field is selected
        enableDisableMergeFieldProperties(currentField);
      }


      //#region Enable/Disable Merge Field Properties

      function enableDisableMergeFieldProperties(currentField) {
        if (currentField.attr('data-mfType') !== undefined) {
          // disable properties
          $mainSettings.find('div[data-name="initialValue"], div[data-name="numericInitialValue"], div[data-name="datepickerInitialValue"], div[data-name="displayValue"], div[data-name="selectFieldSource"], div[data-name="optionValuesContainer"]').each(function () {
            // make fields disabled and mark them - when readonly they're already disabled
            $(this).find('input').each(function () {
              if ($(this).attr('disabled') === undefined) {
                $(this).attr('disabled', 'disabled');
                $(this).attr('data-mf', 'checked');
              }
            });

            // change the opacity of the section
            $(this).css('opacity', '0.4');
          });
          // hide the input setting images, to disallow the user from adding new values
          $container.find('#' + ADD_OPTION_ID).css('display', 'none');

          $validationSettings.find('div[data-name="rangedate-min"], div[data-name="rangedate-max"], div[data-name="minimumlength"], div[data-name="maxlength"], div[data-name="min"], div[data-name="max"]').each(function () {
            var disable = false;

            // make fields disabled and mark them - when readonly they're already disabled
            $(this).find('input').each(function () {
              if ($(this).attr('disabled') === undefined && $(this).val() !== '') {
                $(this).attr('disabled', 'disabled');
                $(this).attr('data-mf', 'checked');
                disable = true;
              }
            });

            // change the opacity of the section
            if (disable) {
              $(this).css('opacity', '0.4');
            }
          });

        } else {
          // enable properties
          $mainSettings.find('div[data-name="initialValue"], div[data-name="numericInitialValue"], div[data-name="datepickerInitialValue"], div[data-name="displayValue"], div[data-name="selectFieldSource"], div[data-name="optionValuesContainer"]').each(function () {
            // make fields enabled
            $(this).find('input').each(function () {
              if ($(this).attr('data-mf') !== undefined) {
                $(this).removeAttr('disabled');
                $(this).removeAttr('data-mf');
              }
            });

            // change the opacity of the section
            $(this).css('opacity', '1');
          });
          // show the input setting images
          $container.find('#' + ADD_OPTION_ID).css('display', '');

          // enable properties
          $validationSettings.find('div[data-name="rangedate-min"], div[data-name="rangedate-max"], div[data-name="minimumlength"], div[data-name="maxlength"], div[data-name="min"], div[data-name="max"]').each(function () {
            var disable = false;

            // make fields enabled
            $(this).find('input').each(function () {
              if ($(this).attr('data-mf') !== undefined) {
                $(this).removeAttr('disabled');
                $(this).removeAttr('data-mf');
                disable = true;
              }
            });

            // change the opacity of the section
            if (disable) {
              $(this).css('opacity', '1');
            }
          });
        }
      }

      //#endregion


      //#endregion

      //#region UPDATE FIELD SETTINGS FUNCTIONS

      /** Update the main settings on a specific field once changes are made in the field settings dialog **/
      function updateMainSettings(currentField, mainSettingField, mainSettingProperty) {

        // notify the user when the action is not allowed
        if (mainSettingProperty === 'read-only' && mainSettingField.is(xr2formsCommon.vars.CHECKED_INPUT) && $clickedContainerField.data(xr2formsCommon.vars.DATA_REQUIRED) !== undefined) {
          // notify the user that readonly and required are mutually exclusive
          xr2formsCommon.showAlert('A field can not be readonly and required at the same time');
          // cancel the action - remove check
          mainSettingField.attr('checked', false).removeAttr('checked');
        } else {

          //#region html modifications on the field
          var fieldType = $fieldsCollection[currentField.attr('id')];
          var thisInputField = currentField.find("input, select, label, a").first();

          if (mainSettingProperty === 'initialvalue' && $.inArray(fieldType, ['label', 'link']) !== -1) {
            thisInputField.html(mainSettingField.val());
          } else if (mainSettingProperty === 'href') {
            thisInputField.attr('href', mainSettingField.val());
          } else if ($.inArray(mainSettingProperty, ['name', 'tab-index']) !== -1) {
            thisInputField.attr(mainSettingProperty, mainSettingField.val());
          }
          //#endregion

          //#region save the property value
          if ($.inArray(mainSettingProperty, ['read-only', 'grouping', 'current-date', 'displayLabels']) !== -1) {
            if (mainSettingField.is(xr2formsCommon.vars.CHECKED_INPUT)) {
              saveFieldMetadata(mainSettingProperty, 'checked');
            } else {
              saveFieldMetadata(mainSettingProperty, undefined);
            }
          } else if (mainSettingProperty === 'initialvalue' && mainSettingField.attr('type') === 'datepicker') {
            var stringDate = $.datepicker.formatDate(xr2formsCommon.vars.DATE_FORMAT, mainSettingField.datepicker("getDate"));
            saveFieldMetadata(mainSettingProperty, stringDate);
          } else {
            saveFieldMetadata(mainSettingProperty, mainSettingField.val());
          }
          //#endregion

          //#region extra prossecing after set data
          if (mainSettingProperty === 'displayLabels') {
            updateLabelsDisplay(currentField);
          }
          //#endregion
        }


        // manage the select field source selection change
        if (mainSettingProperty === 'selectfield-source') {
          if (currentField.data(xr2formsCommon.vars.DATA_SELECT_SOURCE) === xr2formsCommon.vars.SELECT_SOURCE_FIXED) {
            showFixedComboSettings();
          } else {
            showManualComboSettings();
          }
        }
      }

      /** Update the validation setting on a specific field once changes are made in the field settings dialog **/
      function updateValidationSettings(currentField, validationField, validationProperty) {

        // notify the user when the action is not allowed
        if (validationProperty === 'required' && validationField.is(xr2formsCommon.vars.CHECKED_INPUT) && $clickedContainerField.data(xr2formsCommon.vars.DATA_READ_ONLY) !== undefined) {
          // notify the user that readonly and required are mutually exclusive
          xr2formsCommon.showAlert('A field can not be readonly and required at the same time');
          // cancel the action - remove check
          validationField.attr('checked', false).removeAttr('checked');
        } else {

          //#region pattern modifications
          if (validationProperty === 'pattern' && designerStatus.InAdvancedMode()) {
            // if a pattern template is selected in advanced mode, set custom pattern field value too
            if ($(validationField).is('select')) {
              $validationSettings.find('div[data-name="custom-pattern"] input').val(validationField.val());
            } else {
              // reset the drop down when the pattern is set manually
              if (validationField.val() !== currentField.data(validationProperty)) {
                $patternSelect.val('');
              }
            }
          }
          //#endregion

          //#region when using the min/max date current, enable/disabled the min/max date input field accordingly
          if (validationProperty === 'rangedate-min-current') {
            if (validationField.is(xr2formsCommon.vars.CHECKED_INPUT)) {
              $rangedateMinInput.attr('disabled', 'disabled');
            }
            else {
              $rangedateMinInput.removeAttr('disabled');
            }
          } else if (validationProperty === 'rangedate-max-current') {
            if (validationField.is(xr2formsCommon.vars.CHECKED_INPUT)) {
              $rangedateMaxInput.attr('disabled', 'disabled');
            }
            else {
              $rangedateMaxInput.removeAttr('disabled');
            }
          }
          //#endregion

          //#region save the property value
          if ($.inArray(validationProperty, ['required', 'rangedate-min-current', 'rangedate-max-current']) !== -1) {
            if (validationField.is(xr2formsCommon.vars.CHECKED_INPUT)) {
              saveFieldMetadata(validationProperty, 'checked');
            } else {
              saveFieldMetadata(validationProperty, undefined);
            }
          } else if ($.inArray(validationProperty, ['rangedate-min', 'rangedate-max']) !== -1) {
            var stringDate = $.datepicker.formatDate(xr2formsCommon.vars.DATE_FORMAT, validationField.datepicker("getDate"));
            saveFieldMetadata(validationProperty, stringDate);
          } else {
            saveFieldMetadata(validationProperty, validationField.val());
          }
          //#endregion

        }
      }

      /** Update the style settings on a specific field once changes are made **/
      function updateStyleSettings(currentField, styleField, isShortHand, styleProperty) {
        var style = currentField.data(xr2formsCommon.vars.DATA_STYLE);
        var fieldType = xr2formsCommon.getType(currentField);
        if (styleField.val() !== '') {
          // create the required style property if needed
          if (style[styleProperty] === undefined) {
            style[styleProperty] = new Object();
          }

          if (styleProperty === 'font-size') {
            // transform the font-size into a css value
            style[styleProperty][xr2formsCommon.vars.DATA_STYLE_VALUE] = styleField.val() + 'px';
            // reset the resizable minimums
            resetResizableMinHeightAndWidth(currentField);
            currentField.css('height', '');
          } else {
            style[styleProperty][xr2formsCommon.vars.DATA_STYLE_VALUE] = styleField.val();
          }
        } else {
          style[styleProperty] = undefined;
          if (fieldType === 'checkbox' || fieldType === 'radio') {
            currentField.css(styleProperty, '');
          } else {
            currentField.find('input, select, canvas, label, a').css(styleProperty, '');
          }
        }

        // when writing a short hand, the browser may set some properties to 'initial' value
        // these need to be removed and for now the only way is to remove the style attribute
        if (isShortHand) {
          clearStyleProperty(currentField, fieldType);
        }

        // set every style property again, just in case this was a shorthand property
        applyFieldStyles(currentField, fieldType);
      }

      /** Saves the specified property on the field's data object **/
      function saveFieldMetadata(propertyName, propertyValue) {
        if (propertyValue != undefined && propertyValue !== '') {
          $clickedContainerField.data(propertyName, propertyValue);
        } else {
          $clickedContainerField.removeData(propertyName);
        }
      }

      //#endregion



      //#region MAIN SETTINGS AUXILIAR FUNCTION

      function loadInitialValues(currentField, fieldType) {
        // find the drop down controls
        var selectListControl = $mainSettings.find('div[data-name="dropDownInitialValue"] select');

        // remove any previous option
        selectListControl.find('option').remove();

        if ($.inArray(fieldType, ['checkbox', 'radio', 'select']) != -1) {
          // iterate through the fields values, adding eachone as an option
          currentField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS + ', option').each(function () {
            var optionText = $(this).attr('value');
            selectListControl.append('<option value=\"' + optionText + '\">' + optionText + '</option>');
          });
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select a value -</option>');
      }

      /** Loads the select field's source combobox with the name of all available ComboGroups **/
      function loadSelectPrefixedSources() {
        // find the select control
        var selectListControl = $mainSettings.find('div[data-name="selectPrefixedSource"] select');
        // remove all previous options
        selectListControl.find('option').remove();

        // iterate over the available sources
        for (var key in comboValuesDictionary) {
          // add it as an option
          selectListControl.append('<option value=\"' + key + '\">' + comboValuesDictionary[key] + '</option>');
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select a source -</option>');
      }

      /** Shows the section for prefixed combobox values **/
      function showFixedComboSettings() {
        designerUIControl.HideSection($('#input-settings-container').parent());
        designerUIControl.ShowSection($('#select-prefixed-source').parent());
      }

      /** Shows the section for manual combobox values **/
      function showManualComboSettings() {
        designerUIControl.HideSection($('#select-prefixed-source').parent());
        designerUIControl.ShowSection($('#input-settings-container').parent());
      }

      /** Binds the change event of an input to the specified field **/
      function bindInputOptionToFieldSettings(settingsInput, thisInputField) {
        var typedValue;

        settingsInput.bind('textchange', function () {
          typedValue = $(this).val();
          thisInputField.attr('value', typedValue);

          // if this is a select
          if (thisInputField.is('option')) {
            // change the showed value as well
            thisInputField.html(typedValue);
          }

          loadInitialValues($clickedContainerField, $fieldsCollection[$clickedContainerField.attr('id')]);
          updateLabelsDisplay($clickedContainerField);
        });
      }

      /** Adds an option to a select, radio, or checkbox field**/
      function addFieldOption() {
        var currentFieldId = $clickedContainerField.attr('id'),
          currentNumOptions = $clickedContainerField.find('input:last, option:last').last().attr('id'),
          fieldName = $clickedContainerField.data().name,
          fieldType = $fieldsCollection[$clickedContainerField.attr('id')],
          optionsParent = (fieldType !== 'select') ? $clickedContainerField : $clickedContainerField.find('select'),
          option = {},
          newOptionNum,
          id;

        if (fieldType !== undefined && fieldType !== '') {
          // obtain the number of options from the ID of the last option
          if (currentNumOptions !== undefined) {
            currentNumOptions = parseInt(currentNumOptions.slice(currentNumOptions.indexOf('-') + 1));
          }
          else {
            currentNumOptions = 0;
          }

          newOptionNum = currentNumOptions + 1;

          // set the options to use on the template
          id = currentFieldId.slice(0, currentFieldId.indexOf('-') + 1) + newOptionNum;
          option = {
            fieldType: fieldType + '-option',
            type: fieldType,
            name: fieldName,
            id: id,
            option: 'Value ' + newOptionNum
          };

          // append the new option to its parent
          $formTemplates.tmpl(option).appendTo(optionsParent);
          // append the corresponding setting to the inputsettings sectoin
          $inputSettingsTmpl.tmpl({ id: id + '-setting' }).appendTo($inputSettings);

          // get handles to the field settings input and input/option that we just created
          var settingsInput = $container.find('#' + id + '-setting').find('input');
          var thisInputField = $container.find('#' + id);

          // apply the uniform plugin to the newly added option
          if (useUniform && fieldType !== 'select') {
            thisInputField.uniform();
            thisInputField.removeAttr('style');
          }

          //set the newly added field settings input to the value of the new input/option
          settingsInput.val('Value ' + newOptionNum);

          // bind text change event
          bindInputOptionToFieldSettings(settingsInput, thisInputField);
          // update the labels
          updateLabelsDisplay($clickedContainerField);

          // make newly option draggable
          $container.find('#' + currentFieldId + ' .option').draggable({ containment: 'parent' });

          // bind the handler to reset the minimums height and width after an option is dragged
          $container.find('#' + currentFieldId + ' .option').bind("dragstop", function (event, ui) {
            var fieldContainer = ui.helper.parent();
            resetResizableMinHeightAndWidth(fieldContainer);
          });

          // Calculate, adjust and modify the minimum height and width when necessary
          resetResizableMinHeightAndWidth(optionsParent);
        }
      }

      /** Removes an option element from a select, radio, or checkbox field **/
      function removeFieldOption(removeButton) {
        var optionSetting = removeButton.parent(),
          optionSettingId = optionSetting.attr('id'),
          inputOptionId = optionSettingId.slice(0, optionSettingId.lastIndexOf('-')),
          inputOption = $formDesigner.find('#' + inputOptionId),
          fieldContainer = inputOption.parents(xr2formsCommon.vars.FIELD_CONTAINER);

        inputOption.parents('div.option:first').stop().fadeOut(function () {
          $(this).remove();
        });

        inputOption.fadeOut(function () {
          $(this).remove();
        });

        optionSetting.fadeOut(function () {
          $(this).remove();
          // Adjust the resizable height and width
          resetResizableMinHeightAndWidth(fieldContainer);
        });
      }

      /** Shows/Hides the labels of the check/radio fields **/
      function updateLabelsDisplay(currentField) {
        // reset the labels
        currentField.find('.option').each(function () {
          $(this).find('.option-title').html('');
          $(this).css('width', '');
        });

        if (currentField.data(xr2formsCommon.vars.DATA_DISPLAY_LABELS) === 'checked') {
          // display the labels
          currentField.find('.option').each(function () {
            var value = $(this).find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).attr('value');
            $(this).find('.option-title').html(value);

            // loop to avoid the text to split into diferent lines
            var initialWidth = $(this).width(),
              labelWidth = 0;
            while (labelWidth !== $(this).find('.option-title').width()) {
              labelWidth = $(this).find('.option-title').width();
              $(this).css('width', (initialWidth + $(this).find('.option-title').width() + 200) + 'px');
            }
            $(this).css('width', (initialWidth + labelWidth) + 'px');
          });
        }

        resetResizableMinHeightAndWidth(currentField);
      }

      //#endregion

      //#region CUSTOM VALIDATION FUNCTIONS

      /** Adds a new custom validation **/
      function addNewCustomValidation() {
        var valCount = $clickedContainerField.data(xr2formsCommon.vars.DATA_VALIDATION_COUNT);
        if (valCount === undefined) {
          valCount = 0;
        }
        valCount += 1;

        // add a new custom validation section to the properties section
        addCustomValidationSection(valCount);

        // add the needed data - validation new count
        $clickedContainerField.data(xr2formsCommon.vars.DATA_VALIDATION_COUNT, valCount);

        // load the saved values, and bind the change event for the fields
        var valSetting = $container.find('#' + VAL_SETTING_PREFIX + valCount);
        bindPropertySettings(valSetting, $clickedContainerField, updateCustomValidationSettings);

        // setup button for JS editor
        valSetting.find('.editFunctionButton').button();
        valSetting.find('.editFunctionButton').bind('click', { currentField: $clickedContainerField, valSetting: valSetting }, showJsEditorForValidation);

        // make the custom validation section collapsible
        designerUIControl.MakeSectionsCollapsible(valSetting);
      }

      /** Adds a new custom validation section **/
      function addCustomValidationSection(index) {
        //append to custom-val-section
        $customValTemplate.tmpl({ count: index }).appendTo($customValSection);
      }

      /** Updates the custom validation settings on a specific field once changes are made in the field settings dialog**/
      function updateCustomValidationSettings(currentField, validationField, validationProperty) {
        saveFieldMetadata(validationProperty, validationField.val());
      }

      /** Removes a custom validation **/
      function removeCustomValidation(valSetting) {
        var valNumber = valSetting.attr('id').slice(VAL_SETTING_PREFIX.length),
          valCount = $clickedContainerField.data(xr2formsCommon.vars.DATA_VALIDATION_COUNT);

        if (valCount !== undefined && valCount > 0) {

          // fade out the corresponding custom validation
          valSetting.fadeOut(function () {
            // remove the validation section
            $(this).remove();

            // remove all the field's properties for this validation
            $(this).find('input, textarea').each(function () {

              var property = $(this).attr('data-property'),
                value = $clickedContainerField.data(property);
              if (value !== undefined) {
                //remove the old rule
                delete $clickedContainerField.data()[jQuery.camelCase(property)];
              }
            });

            // update the rest to continue with the numeration
            for (var i = parseInt(valNumber) + 1; i <= valCount; i++) {
              var auxSetting = $container.find('#' + VAL_SETTING_PREFIX + i);

              auxSetting.find('input, textarea').each(function () {
                var property = $(this).attr('data-property'),
                  prefix = property.slice(0, property.length - ("" + i).length),
                  newRule = prefix + (i - 1),
                  value = $clickedContainerField.data(property);

                if (value !== undefined) {
                  //remove the old property
                  delete $clickedContainerField.data()[jQuery.camelCase(property)];
                  //add the new property with the same value
                  $clickedContainerField.data(newRule, value);
                }
              });
            }

            // decrement the custom validation count
            $clickedContainerField.data(xr2formsCommon.vars.DATA_VALIDATION_COUNT, valCount - 1);
            // reset the custom validation settings
            resetCustomValidationSettings($clickedContainerField);
          });
        }
      }

      //#endregion

      //#region DEPENDENCY SPECIFIC FUNCTIONS

      /** Adds a new dependency section on the properties box **/
      function addNewDependency() {
        var depCount = $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_COUNT);
        if (depCount === undefined) {
          depCount = 0;
        }
        depCount += 1;

        // create the dependency object
        if ($clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA) === undefined) {
          $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA, new Object());
        }

        var fieldId = $clickedContainerField.attr('id'),
          fieldType = $fieldsCollection[fieldId];

        // add a new dependency
        var newDependency = new xr2formsCommon.dependency();
        newDependency.GetRootCondition().AddCondition(fieldId);
        newDependency.AddAction();
        $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA)[depCount] = newDependency;

        // update the dependency count
        $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_COUNT, depCount);

        // add a new section for the depenedency
        resetDependency(newDependency, depCount, fieldType);
      }

      /** Adds a new dependency section, and returns it **/
      function addDependencySection(number) {
        //append to dependency-section
        $dependencyTemplate.tmpl({ count: number }).appendTo($dependencySection);
        // return the new section
        return $dependencySection.find('#' + DEP_SETTING_PREFIX + number);
      }

      /** Adds the needed sections for the depenedency object **/
      function resetDependency(dependency, number, fieldType) {

        // add a new section for the dependency
        var depSection = addDependencySection(number);

        // make the section collapsible
        designerUIControl.MakeSectionsCollapsible(depSection);

        // bind the condition operator change event
        bindConditionOperator(depSection, number, dependency.GetRootCondition());
        // bind the add condition button
        depSection.find('.' + ADD_DEP_CONDITION_CLASS).click(function () {
          dependency.GetRootCondition().AddCondition();
          resetDependencyConditions(dependency, depSection, number);
        });
        // reset the condition sections
        resetDependencyConditions(dependency, depSection, number);

        // bind the add action button
        depSection.find('.' + ADD_DEP_ACTION_CLASS).click(function () {
          dependency.AddAction();
          resetDependencyActions(dependency, depSection, number, fieldType);
        });
        // reset the action sections
        resetDependencyActions(dependency, depSection, number, fieldType);
      }

      /** Based on the setted properties, updates the mode when needed **/
      function updateDependencyMode(dependency) {
        var isBasic = true;

        // iterate over the conditions
        var conditions = dependency.GetRootCondition().GetConditions();
        for (var i = 0; i < conditions.length; i++) {
          if (conditions[i].comparer !== undefined &&
            fieldSettingsByType.dependency.conditions.comparers.settings[conditions[i].comparer] !== BASIC) {
            isBasic = false;
            break;
          }
        }

        if (isBasic) {
          // iterate over the actions
          var actions = dependency.GetActions();
          for (var j = 0; j < actions.length; j++) {
            if (actions[j].type !== xr2formsCommon.vars.ACTION_TYPE_BASIC) {
              isBasic = false;
              break;
            }
          }
        }

        if (isBasic) {
          dependency.mode = xr2formsCommon.vars.DEPENDENCY_MODE_BASIC;
        } else {
          dependency.mode = xr2formsCommon.vars.DEPENDENCY_MODE_ADVANCED;
        }
      }

      /** Removes a dependency section from the properties box **/
      function removeDependency(depNumber) {

        var depSetting = $dependencySection.find('#' + DEP_SETTING_PREFIX + depNumber),
          depCount = $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_COUNT);

        if (depCount !== undefined && depCount > 0 && depCount >= depNumber) {

          // fade out the corresponding dependency
          depSetting.fadeOut(function () {
            // remove the dependency section
            $(this).remove();

            // update the rest to continue with the numeration
            for (var i = parseInt(depNumber) ; i < depCount; i++) {
              $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA)[i] = $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA)[i + 1];
            }

            // delete the last and duplicated dep
            delete $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA)[depCount];


            // decrement the dependency count
            $clickedContainerField.data(xr2formsCommon.vars.DATA_DEPENDENCY_COUNT, depCount - 1);
            // reset the dependency settings menu
            resetDependencySettings($clickedContainerField, $fieldsCollection[$clickedContainerField.attr('id')]);
          });
        }
      }

      //#region Condition Specific Functions

      /* Used to bind the root condition operator to the UI */
      function bindConditionOperator(depSection, depNumber, rootCondition) {

        var operator = rootCondition.operator;
        depSection.find('#' + CONDITION_OPERATOR_PREFIX + depNumber + ' input').each(function () {
          // unbind old event handler
          $(this).unbind('change');

          // set as checked when selected
          if ($(this).val() === operator) {
            $(this).attr('checked', 'checked');
          }

          // bind the change event
          $(this).bind('change', function () {
            rootCondition.operator = $(this).val();
          });
        });

      }

      /* Removes and adds all the sections needed for the dependency conditions */
      function resetDependencyConditions(dependency, depSection, depNumber) {
        // remove all previous conditions
        depSection.find('#' + DEP_CONDITIONS_PREFIX + depNumber).html('');

        var depConditions = dependency.GetRootCondition().GetConditions();
        for (var i = 0; i < depConditions.length; i++) {
          // add a new section for each condition
          var condSection = addConditionSection(i, depSection, depNumber);

          // bind the remove condition event
          var handler = createRemoveConditionHandler(dependency, depSection, depNumber, i);
          condSection.find('.' + DELETE_DEP_CONDITION_CLASS).click(handler);

          // load the fields list
          loadConditionFieldNames(condSection);

          if (depConditions[i].fieldId !== undefined) {
            // load the comparers - based on the selected field
            loadConditionComparers(condSection, depConditions[i]);
            // load the available values - based on the selected field
            loadConditionValues(condSection, depConditions[i]);
          }

          // load the saved values, and bind the change event
          bindConditionSettings(dependency, condSection, depConditions[i]);

          // display the corresponding sections - based on the selected field
          displayConditionSettings(condSection, depConditions[i]);
        }


        // hide the condition operator when only 1 condition is defined
        if (depConditions.length === 1) {
          designerUIControl.HideSection(depSection.find('#' + CONDITION_OPERATOR_PREFIX + depNumber));
        } else {
          designerUIControl.ShowSection(depSection.find('#' + CONDITION_OPERATOR_PREFIX + depNumber));
        }
      }

      /* Adds a new condition section for the specified index, and returns it */
      function addConditionSection(index, depSection, depNumber) {
        //append to the conditions section for the specified dependency number
        var condSection = depSection.find('#' + DEP_CONDITIONS_PREFIX + depNumber);
        $depConditionTemplate.tmpl({ index: index }).appendTo(condSection);
        // set the datepicker when needed
        var newSection = condSection.find('div[data-condition="' + index + '"]');
        // setup datepicker plugin for any date field on the settings sections
        newSection.find(xr2formsCommon.vars.DATEPICKER_INPUT).datepicker({
          dateFormat: xr2formsCommon.vars.DATE_FORMAT,
          changeMonth: true,
          changeYear: true,
          showButtonPanel: true,
          showOtherMonths: true,
          selectOtherMonths: true,
          yearRange: '-150:+10'
        });

        // return the new section
        return newSection;
      }

      /* Loads the names of the available fields on the drop down list */
      function loadConditionFieldNames(condSection) {
        // find the drop down control
        var selectListControl = condSection.find('div[data-name="fieldName"] select');

        // remove any previous option
        selectListControl.find('option').remove();

        // load all field names to the list
        for (var containerId in $fieldsCollection) {
          // TODO: label and link fields are excluded - no tienen comparers - revisar porque la condition tiene el fieldId automatico
          //if ($fieldsCollection[containerId] !== 'label' && $fieldsCollection[containerId] !== 'link') {
          var fieldName = $('#' + containerId).data().name;
          selectListControl.append('<option value=\"' + containerId + '\">' + fieldName + '</option>');
          //}
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select a field by name -</option>');
      }

      /* Loads the diferent comparers based on the selected field */
      function loadConditionComparers(condSection, condition) {
        // find the drop down control
        var selectListControl = condSection.find('div[data-name="comparer"] select');

        // remove any previous option
        selectListControl.find('option').remove();

        // iterate through the comparers defined for the selected field
        var selectedFieldType = $fieldsCollection[condition.fieldId];
        var fieldComparers = fieldSettingsByType.dependency.conditions.comparers.fields[selectedFieldType];
        for (var index = 0; index < fieldComparers.length; index++) {
          var comparer = fieldComparers[index];

          // check whether the comparer should be added
          if (designerStatus.InAdvancedMode() || fieldSettingsByType.dependency.conditions.comparers.settings[comparer] === BASIC) {
            // add this option
            var comparerText = fieldSettingsByType.dependency.conditions.comparers.text[comparer];
            selectListControl.append('<option value=\"' + comparer + '\">' + comparerText + '</option>');
          }
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select a comparer -</option>');
      }

      /* Loads the diferent values available for the selected field */
      function loadConditionValues(condSection, condition) {
        // drop down are used for checkboxes, radiobuttons and comboboxes
        var selectedFieldType = $fieldsCollection[condition.fieldId];
        if (selectedFieldType === 'checkbox' || selectedFieldType === 'radio' || selectedFieldType === 'select') {

          // find the drop down control
          var selectListControl = condSection.find('div[data-name="dropDownValue"] select');
          // remove any previous option
          selectListControl.find('option').remove();

          // find the selected field
          var selectedField = $('#' + condition.fieldId);

          // add the values specified
          selectedField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS + ', option').each(function () {
            var optionText = $(this).attr('value'),
              optionValue = $(this).attr('id');

            selectListControl.append('<option value=\"' + optionValue + '\">' + optionText + '</option>');
          });

          // prepend an empty value option
          selectListControl.prepend('<option value=\"\">- Select a value -</option>');
        }
      }

      // TODO: juntar con el otro binding, poniendo como param el getValue y el binding del update
      function bindConditionSettings(dependency, condSection, condition) {

        condSection.find('input, select, textarea').each(function () {
          var property = $(this).attr('data-property'),
            value, attributes = {};

          // unbind old event handler
          $(this).unbind('change textchange');

          // if there is a value for this rule set it
          value = (condition[property] !== undefined) ? condition[property] : '';
          if (value !== '') {
            if ($(this).is('input')) {
              if ($(this).attr('type') === 'checkbox') {
                attributes = { 'checked': value };
              }
              else if ($(this).attr('type') === 'radio') {
                if ($(this).val() === value)
                  attributes = { 'checked': 'checked' };
              }
              else attributes = { 'value': value };
            } else {
              attributes = { 'value': value };
            }
            // apply attributes variable
            $(this).attr(attributes);

            // for select fields check that the applied value corresponds - important: == not ===
            if ($(this).is('select') && $(this).val() == undefined) {
              $(this).val('');
            }

          } else {
            if ($(this).is('input')) {
              if ($(this).attr('type') === 'checkbox' || $(this).attr('type') === 'radio') {
                $(this).removeAttr('checked');
              } else {
                $(this).val(undefined);
              }
            } else if ($(this).is('select')) {
              $(this).val('');
            }
          }

          // bind the change event handler
          $(this).bind('change textchange', function () {
            updateCondition(dependency, condSection, condition, $(this), property);
          });
        });
      }

      /* Updates the values of the condition properties */
      function updateCondition(dependency, condSection, condition, conditionField, property) {

        // get the corresponding value
        var propertyVal = conditionField.attr('type') === 'datepicker' ? conditionField.datepicker("getDate") : conditionField.val();
        // set the condition value
        if (propertyVal != undefined && propertyVal !== '') {
          condition[property] = propertyVal;
        } else {
          condition[property] = undefined;
        }

        //#region extra UI logic - disable options, update values
        if (property === 'fieldId' && condition[property] !== undefined) {
          // clear previous values
          condition.comparer = undefined;
          condition.value = undefined;
          //  load the corresponding options
          loadConditionComparers(condSection, condition);
          loadConditionValues(condSection, condition);
        }
        displayConditionSettings(condSection, condition);
        //#endregion

        // update the dependency mode - basic/advanced
        updateDependencyMode(dependency);
      }

      /* Displays the corresponding settings based on the field selected */
      function displayConditionSettings(condSection, condition) {

        // hide all sections
        condSection.find('input, select').each(function () {
          designerUIControl.HideSection($(this).parent());
        });

        var settingBox;
        if (condition.fieldId !== undefined) {
          // iterate through the settings defined for the field
          var selectedFieldType = $fieldsCollection[condition.fieldId];
          var fieldSettings = fieldSettingsByType.dependency.conditions.fields[selectedFieldType];
          for (var index = 0; index < fieldSettings.length; index++) {
            var setting = fieldSettings[index];

            // check whether the setting should be displayed
            if (designerStatus.InAdvancedMode() || fieldSettingsByType.dependency.conditions.settings[setting] === BASIC) {
              // show this option
              settingBox = condSection.find('div[data-name="' + setting + '"]');
              designerUIControl.ShowSection(settingBox);
            }
          }
        } else {
          settingBox = condSection.find('div[data-name="fieldName"]');
          designerUIControl.ShowSection(settingBox);
        }

        //#region extra UI logic
        if (condition.comparer === xr2formsCommon.vars.COMPARER_ANY_VALUE) {
          settingBox = condSection.find('div[data-name="value"], div[data-name="dropDownValue"], div[data-name="datepickerValue"]');
          designerUIControl.HideSection(settingBox);
        }
        //#endregion
      }

      /* Removes the specified condition, unless there is only one left */
      function removeCondition(dependency, depSection, depNumber, index) {
        if (index >= 0 && index < dependency.GetRootCondition().GetConditions().length) {
          // remove the condition from the dependency
          dependency.GetRootCondition().RemoveConditionAt(index);
          // reset the condition sections
          resetDependencyConditions(dependency, depSection, depNumber);
        }
      }

      /* Returnssss a handler function that removes the specified condition, unless there is only one left */
      function createRemoveConditionHandler(dependency, depSection, depNumber, index) {
        return function () {
          if (dependency.GetRootCondition().GetConditions().length > 1) {
            var action = function () {
              removeCondition(dependency, depSection, depNumber, index);
            };
            confirmAction(action, REMOVE_DEP_CONDITION);
          } else {
            xr2formsCommon.showAlert('At least one condition should be specified.');
          }
        };
      }

      //#endregion

      //#region Action Specific Functions

      /* Removes and adds all the sections needed for the dependency actions */
      function resetDependencyActions(dependency, depSection, depNumber, fieldType) {
        // remove all previous actions
        depSection.find('#' + DEP_ACTIONS_PREFIX + depNumber).html('');

        var depActions = dependency.GetActions();
        for (var i = 0; i < depActions.length; i++) {
          // add a new section for each action
          var actSection = addActionSection(i, depSection, depNumber);

          // bind the remove condition event
          var handler = createRemoveActionHandler(dependency, depSection, depNumber, i, fieldType);
          actSection.find('.' + DELETE_DEP_ACTION_CLASS).click(handler);

          // setup button for JS editor
          actSection.find('.editFunctionButton').button();
          actSection.find('.editFunctionButton').bind('click', { actSection: actSection, action: depActions[i] }, showJsEditorForDependency);

          // load values and display settings
          resetActionDisplay(dependency, actSection, depActions[i], fieldType);
        }

      }

      /* Adds a new condition section for the specified index, and returns it  */
      function addActionSection(index, depSection, depNumber) {
        // append an action section for the specified dependency number
        var actSection = depSection.find('#' + DEP_ACTIONS_PREFIX + depNumber);
        $depActionTemplate.tmpl({ index: index, depNumber: depNumber }).appendTo(actSection);
        // set the datepicker when needed
        var newSection = actSection.find('div[data-action="' + index + '"]');
        // setup datepicker plugin for any date field on the settings sections
        newSection.find(xr2formsCommon.vars.DATEPICKER_INPUT).datepicker({
          dateFormat: xr2formsCommon.vars.DATE_FORMAT,
          changeMonth: true,
          changeYear: true,
          showButtonPanel: true,
          showOtherMonths: true,
          selectOtherMonths: true,
          yearRange: '-150:+10'
        });

        // return the new section
        return newSection;
      }

      /* Loads and displays the corresponding settings based on the action type */
      function resetActionDisplay(dependency, actSection, action, fieldType) {

        // display the corresponding section
        var currentSection = displayActionSectionByType(actSection, action.type);

        // load the selectors
        loadActionSelectors(currentSection, fieldType);

        // load actions and values
        if (action.type === xr2formsCommon.vars.ACTION_TYPE_BASIC) {
          loadActions(currentSection, action, fieldType);
          loadActionValues(currentSection, fieldType);
        } else if (action.type === xr2formsCommon.vars.ACTION_TYPE_MANUAL) {
          loadActionProperties(currentSection, action, fieldType);
          loadActionPropertyValues(currentSection, action);
        }

        // load the values and bind the change event for each setting
        bindActionSettings(dependency, actSection, action);

        // display the corresponding sections - based on the selected field
        displayActionSettings(actSection, action);
      }

      /* Loads the available selectors for the specified field type on the drop down list */
      function loadActionSelectors(actSection, fieldType) {
        // find the drop down control
        var selectListControl = actSection.find('div[data-name="selector"] select');

        // remove any previous option
        selectListControl.find('option').remove();

        if ($.inArray(fieldType, ['checkbox', 'radio']) != -1) {
          // add an option to select all values
          selectListControl.prepend('<option value=\"' + xr2formsCommon.vars.ACTION_SELECTOR_ALL + '">Afect all options</option>');

          // iterate through the fields values, adding eachone as an option
          $clickedContainerField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).each(function () {
            var optionText = $(this).attr('value'),
              optionValue = $(this).attr('id');

            selectListControl.append('<option value=\"' + optionValue + '\">' + optionText + '</option>');
          });
        }
      }

      /* Loads the diferent actions based on the selected field */
      function loadActions(actSection, action, fieldType) {
        // find the drop down control
        var selectListControl = actSection.find('div[data-name="action"] select');

        // remove any previous option
        selectListControl.find('option').remove();

        // iterate through the actions defined for the selected field
        var actions;
        if (action.selector !== xr2formsCommon.vars.ACTION_SELECTOR_ALL) {
          actions = fieldSettingsByType.dependency.actions.premade.checkRadioInputs;
        } else {
          actions = fieldSettingsByType.dependency.actions.premade.fields[fieldType];
        }
        for (var index = 0; index < actions.length; index++) {
          var option = actions[index];

          // add this option
          var text = fieldSettingsByType.dependency.actions.premade.text[option];
          selectListControl.append('<option value=\"' + option + '\">' + text + '</option>');
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select an action -</option>');
      }

      /* Loads the diferent values based on the selected field */
      function loadActionValues(actSection, fieldType) {
        // find the drop down control
        var selectListControl = actSection.find('div[data-name="dropDownValue"] select');

        // remove any previous option
        selectListControl.find('option').remove();

        if ($.inArray(fieldType, ['checkbox', 'radio', 'select']) != -1) {
          // iterate through the fields values, adding eachone as an option
          $clickedContainerField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS + ', option').each(function () {
            var optionText = $(this).attr('value'),
              optionValue = $(this).attr('id');

            selectListControl.append('<option value=\"' + optionValue + '\">' + optionText + '</option>');
          });
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select a value -</option>');
      }

      /* Loads the names of the available properties on the drop down list */
      function loadActionProperties(actSection, action, fieldType) {
        // find the drop down controls
        var selectListControl = actSection.find('div[data-name="property"] select');

        // remove any previous option
        selectListControl.find('option').remove();


        // iterate through the actions defined for the selected field
        var properties;
        if (action.selector !== xr2formsCommon.vars.ACTION_SELECTOR_ALL) {
          properties = fieldSettingsByType.dependency.actions.manual.checkRadioInputs;
        } else {
          properties = fieldSettingsByType.dependency.actions.manual.fields[fieldType];
        }
        for (var index = 0; index < properties.length; index++) {
          // add this option
          var manualName = properties[index];
          var property = fieldSettingsByType.dependency.actions.manual.properties[manualName].property;
          var text = fieldSettingsByType.dependency.actions.manual.properties[manualName].text;
          selectListControl.append('<option value=\"' + manualName + '\" data-property="' + property + '">' + text + '</option>');
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select a property -</option>');
      }

      /* Loads the posible values for the property selected */
      function loadActionPropertyValues(actSection, action) {
        // find the drop down controls
        var selectListControl = actSection.find('div[data-name="dropDownValue"] select');
        var otherwiseListControl = actSection.find('div[data-name="dropDownOtherwise"] select');

        // remove any previous option
        selectListControl.find('option').remove();
        otherwiseListControl.find('option').remove();

        if (action.manualName !== undefined) {
          var index;
          if (fieldSettingsByType.dependency.actions.manual.properties[action.manualName].type === OPTIONS_TYPE) {
            // iterate through the actions values defined for the selected property
            var actionOptions = fieldSettingsByType.dependency.actions.manual.properties[action.manualName].options;
            for (index = 0; index < actionOptions.length; index++) {
              // add this option
              var option = actionOptions[index];
              selectListControl.append('<option value=\"' + option.value + '\">' + option.text + '</option>');
              otherwiseListControl.append('<option value=\"' + option.value + '\">' + option.text + '</option>');
            }

          } else if (fieldSettingsByType.dependency.actions.manual.properties[action.manualName].type === DYNAMIC_TYPE) {
            var fieldType = $fieldsCollection[$clickedContainerField.attr('id')];
            if ($.inArray(fieldType, ['checkbox', 'radio', 'select']) != -1) {
              // iterate through the fields values, adding eachone as an option
              $clickedContainerField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS + ', option').each(function () {
                var optionText = $(this).attr('value'),
                  optionValue = $(this).attr('id');

                selectListControl.append('<option value=\"' + optionValue + '\">' + optionText + '</option>');
                otherwiseListControl.append('<option value=\"' + optionValue + '\">' + optionText + '</option>');
              });
            }

            // apend an option to clear the values
            var text = fieldSettingsByType.dependency.actions.premade.text['clear'];
            selectListControl.append('<option value=\"' + xr2formsCommon.vars.EMPTY_VALUE + '\">' + text + '</option>');
            otherwiseListControl.append('<option value=\"' + xr2formsCommon.vars.EMPTY_VALUE + '\">' + text + '</option>');
          }
        }

        // prepend an empty value option
        selectListControl.prepend('<option value=\"\">- Select a value -</option>');
        otherwiseListControl.prepend('<option value=\"\">- Select a value -</option>');
      }

      /* Based on the action type, displays the corresponding UI section, and returns it */
      function displayActionSectionByType(actSection, actionType) {
        // hide all sections
        designerUIControl.HideSection(actSection.find('div[data-action-type]'));
        // show the corresponding section according to the type
        var section;
        if (actionType === xr2formsCommon.vars.ACTION_TYPE_BASIC) {
          section = actSection.find('div[data-action-type="basic"]');
        } else if (actionType === xr2formsCommon.vars.ACTION_TYPE_MANUAL) {
          section = actSection.find('div[data-action-type="manual"]');
        } else {
          section = actSection.find('div[data-action-type="function"]');
        }
        designerUIControl.ShowSection(section);
        return section;
      }

      /* Based on the action properties, displays the corresponding UI sections */
      function displayActionSettings(actSection, action) {
        // hide all sections
        actSection.find('input, select').each(function () {
          designerUIControl.HideSection($(this).parent());
        });

        var settingBox = undefined;
        // iterate through the settings defined for the field
        var fieldType = $fieldsCollection[$clickedContainerField.attr('id')];
        var fieldSettings = fieldSettingsByType.dependency.actions.fields[fieldType];
        for (var index = 0; index < fieldSettings.length; index++) {
          var setting = fieldSettings[index];

          // check whether the setting should be displayed
          if (designerStatus.InAdvancedMode() || fieldSettingsByType.dependency.actions.settings[setting] === BASIC) {
            // show this option
            settingBox = actSection.find('div[data-name="' + setting + '"]');
            designerUIControl.ShowSection(settingBox);
          }
        }

        //#region extra UI logic
        if (action.type === xr2formsCommon.vars.ACTION_TYPE_BASIC) {
          settingBox = actSection.find('div[data-name="value"], div[data-name="dropDownValue"], div[data-name="numericValue"], div[data-name="datepickerValue"]');
          designerUIControl.HideSection(settingBox);
          if (action.basicName === 'value' || action.basicName === 'modifyurl') {
            settingBox = actSection.find('div[data-name="' + fieldSettingsByType.dependency.actions.premade.valueSections[fieldType] + '"]');
            designerUIControl.ShowSection(settingBox);
          }
        } else if (action.type === xr2formsCommon.vars.ACTION_TYPE_MANUAL) {
          if (action.manualName === undefined) {
            // Hide all other sections
            settingBox = actSection.find('div[data-name="value"], div[data-name="dropDownValue"], div[data-name="numericValue"], div[data-name="datepickerValue"], ' +
              'div[data-name="evalOtherwise"], div[data-name="valueOtherwise"], div[data-name="dropDownOtherwise"], div[data-name="numericOtherwise"], div[data-name="datepickerOtherwise"]');
            designerUIControl.HideSection(settingBox);
          } else {
            // show the corresponding value section
            var propertyType = fieldSettingsByType.dependency.actions.manual.properties[action.manualName].type;
            if (propertyType === TEXT_TYPE) {
              settingBox = actSection.find('div[data-name="dropDownValue"], div[data-name="numericValue"], div[data-name="datepickerValue"]');
            } else if (propertyType === NUMBER_TYPE) {
              settingBox = actSection.find('div[data-name="value"], div[data-name="dropDownValue"], div[data-name="datepickerValue"]');
            } else if (propertyType === DATE_TYPE) {
              settingBox = actSection.find('div[data-name="value"], div[data-name="dropDownValue"], div[data-name="numericValue"]');
            } else if (propertyType === OPTIONS_TYPE || propertyType === DYNAMIC_TYPE) {
              settingBox = actSection.find('div[data-name="value"], div[data-name="numericValue"], div[data-name="datepickerValue"]');
            }
            designerUIControl.HideSection(settingBox);

            if (action.evalOtherwise === 'true') {
              // show the corresponding otherwise value section
              if (propertyType === TEXT_TYPE) {
                settingBox = actSection.find('div[data-name="dropDownOtherwise"], div[data-name="numericOtherwise"], div[data-name="datepickerOtherwise"]');
              } else if (propertyType === NUMBER_TYPE) {
                settingBox = actSection.find('div[data-name="valueOtherwise"], div[data-name="dropDownOtherwise"], div[data-name="datepickerOtherwise"]');
              } else if (propertyType === DATE_TYPE) {
                settingBox = actSection.find('div[data-name="valueOtherwise"], div[data-name="dropDownOtherwise"], div[data-name="numericOtherwise"]');
              } else if (propertyType === OPTIONS_TYPE || propertyType === DYNAMIC_TYPE) {
                settingBox = actSection.find('div[data-name="valueOtherwise"], div[data-name="numericOtherwise"], div[data-name="datepickerOtherwise"]');
              }
            } else {
              // hide the otherwise value sections
              settingBox = actSection.find('div[data-name="valueOtherwise"], div[data-name="dropDownOtherwise"], div[data-name="numericOtherwise"], div[data-name="datepickerOtherwise"]');
            }
            designerUIControl.HideSection(settingBox);
          }
        }
        //#endregion
      }

      // TODO: juntar con el otro binding, poniendo como param el getValue y el binding del update
      function bindActionSettings(dependency, actSection, action) {

        actSection.find('input, select, textarea').each(function () {
          var property = $(this).attr('data-property'),
            value, attributes = {};

          // unbind old event handler
          $(this).unbind('change textchange');

          // if there is a value for this rule set it
          value = (action[property] !== undefined) ? action[property] : '';
          if (value !== '') {
            if ($(this).is('input')) {
              if ($(this).attr('type') === 'checkbox') {
                attributes = { 'checked': value };
              }
              else if ($(this).attr('type') === 'radio') {
                if ($(this).val() === value)
                  attributes = { 'checked': 'checked' };
              }
              else attributes = { 'value': value };
            } else {
              attributes = { 'value': value };
            }
            // apply attributes variable
            $(this).attr(attributes);

            // for select fields check that the applied value corresponds - important: == not ===
            if ($(this).is('select') && $(this).val() == undefined) {
              $(this).val('');
            }

          } else {
            if ($(this).is('input')) {
              if ($(this).attr('type') === 'checkbox' || $(this).attr('type') === 'radio') {
                $(this).removeAttr('checked');
              } else {
                $(this).val(undefined);
              }
            } else if ($(this).is('select')) {
              $(this).val('');
            }
          }

          // bind the change event handler
          $(this).bind('change textchange', function () {
            updateAction(dependency, actSection, action, $(this), property);
          });
        });

      }

      /* Updates the values of the action properties */
      function updateAction(dependency, actSection, action, conditionField, property) {

        // get the corresponding value
        var propertyVal = conditionField.attr('type') === 'datepicker' ? conditionField.datepicker("getDate") : conditionField.val();
        // set the condition value
        if (propertyVal != undefined && propertyVal !== '') {
          action[property] = propertyVal;
        } else {
          action[property] = undefined;
        }

        //#region extra UI logic - disable options, update values
        var fieldType = $fieldsCollection[$clickedContainerField.attr('id')];
        if (property === 'type' || property === 'selector') {
          // clear previous values
          action.ClearValues();
          // load values and display settings
          resetActionDisplay(dependency, actSection, action, fieldType);
        } else if (property === 'basicName') {
          loadPropertiesFromBasicAction(action);
        } else if (property === 'manualName') {
          loadPropertiesFromManualAction(action);
          // load the corresponding options
          loadActionPropertyValues(actSection, action);
        }
        //#endregion

        displayActionSettings(actSection, action);

        // update the dependency mode - basic/advanced
        updateDependencyMode(dependency);
      }

      /* Sets the corresponding property values into the action, based on the selected basic action */
      function loadPropertiesFromBasicAction(action) {
        if (action.basicName !== undefined) {
          var properties = fieldSettingsByType.dependency.actions.premade.action[action.basicName];
          action.property = properties.property;
          action.value = properties.value;
          action.evalOtherwise = properties.evalOtherwise;
          action.otherwiseValue = properties.otherwiseValue;
        } else {
          action.property = undefined;
          action.value = undefined;
          action.otherwiseValue = undefined;
        }
      }

      /* Sets the corresponding property values into the action, based on the selected manual action */
      function loadPropertiesFromManualAction(action) {
        if (action.manualName !== undefined) {
          var properties = fieldSettingsByType.dependency.actions.manual.properties[action.manualName];
          action.property = properties.property;
        } else {
          action.property = undefined;
        }
        // clear previous values
        action.value = undefined;
        action.otherwiseValue = undefined;
      }

      /* Removes the specified action, unless there is only one left */
      function removeAction(dependency, depSection, depNumber, index, fieldType) {
        if (index >= 0 && index < dependency.GetActions().length) {
          // remove the action from the dependency
          dependency.RemoveActionAt(index);
          // reset the action sections
          resetDependencyActions(dependency, depSection, depNumber, fieldType);
        }
      }

      /* Returns a handler function that removes the specified action, unless there is only one left */
      function createRemoveActionHandler(dependency, depSection, depNumber, index, fieldType) {
        return function () {
          if (dependency.GetActions().length > 1) {
            var action = function () {
              removeAction(dependency, depSection, depNumber, index, fieldType);
            };
            confirmAction(action, REMOVE_DEP_ACTION);
          } else {
            xr2formsCommon.showAlert('At least one action should be specified.');
          }
        };
      }

      //#endregion

      //#endregion

      //#region STYLE SPECIFIC FUNCTIONS

      /* Creates the necesary data object to store the style properties */
      function prepareStyleData(currentField, fieldType) {
        var shorthandProperties = $styleAdvancedSettings.find('.' + STYLE_SHORTHAND_CLASS + ' input');

        currentField.data()[xr2formsCommon.vars.DATA_STYLE] = new Object();
        var style = currentField.data(xr2formsCommon.vars.DATA_STYLE);
        for (var i = 0; i < shorthandProperties.length; i++) {
          var name = $(shorthandProperties[i]).attr('name');
          style[name] = undefined;
        }

        // set the font-size when needed
        if (fieldType !== 'radio' && fieldType !== 'checkbox' && fieldType !== 'canvas') {
          style['font-size'] = new Object();
          style['font-size'][xr2formsCommon.vars.DATA_STYLE_VALUE] = currentField.find('input, select, label, a').css('font-size');
        }
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

      /* Clears the style properties from a field */
      function clearStyleProperty(currentField, fieldType) {
        if (fieldType === 'checkbox' || fieldType === 'radio') {
          var opacity = currentField.css('opacity');
          var width = currentField.css('width');
          var height = currentField.css('height');
          var left = currentField.css('left');
          var top = currentField.css('top');

          currentField.removeAttr('style');
          currentField.css('opacity', opacity);
          currentField.css('width', width);
          currentField.css('height', height);
          currentField.css('left', left);
          currentField.css('top', top);
        } else {
          currentField.find('input, select, canvas, label, a').removeAttr('style');
        }
      }

      //#endregion



      //#region FIELD ALIGNMENT & CLONING FUNCTIONS

      // Aligns all selected fields with the highest one
      function alignFieldsTop() {
        var selectedFields = $container.find('.' + SELECTED_FIELD_CLASS);
        alignment.alignTop(selectedFields);
      }
      // Aligns all selected fields with the lowest one
      function alignFieldsBottom() {
        var selectedFields = $container.find('.' + SELECTED_FIELD_CLASS);
        alignment.alignBottom(selectedFields);
      }
      // Aligns all selected fields with the leftmost one
      function alignFieldsLeft() {
        var selectedFields = $container.find('.' + SELECTED_FIELD_CLASS);
        alignment.alignLeft(selectedFields);
      }
      // Aligns all selected fields with the rightmost one
      function alignFieldsRight() {
        var selectedFields = $container.find('.' + SELECTED_FIELD_CLASS);
        alignment.alignRight(selectedFields);
      }

      // Duplicates the selected field
      function cloneField() {
        var selectedFields = $container.find('.' + SELECTED_FIELD_CLASS);
        if (selectedFields.length == 1) {
          cloning.cloneField(selectedFields);
        }
      }

      //#endregion



      //#region JS EDITOR FUNCTIONS

      function showJsEditorForValidation(e) {
        // get the function property
        var property = xr2formsCommon.vars.VAL_FUNCTION + e.data.valSetting.attr('id').slice(VAL_SETTING_PREFIX.length);
        var propertyValue = e.data.currentField.data(property);

        $jsEditor.dialog({
          resizable: false,
          modal: true,
          width: 700,
          title: 'Edit your function',
          buttons: {
            Ok: function () {
              // save the new value, and set the textarea value
              var value = $jsEditor.data('editor').getValue();
              e.data.valSetting.find('textarea[data-property="' + property + '"]').val(value).trigger('change');
              $(this).dialog("close");
            }
          }
        });

        // set the editor value
        if (propertyValue !== undefined) {
          $jsEditor.data('editor').setValue(propertyValue);
        } else {
          $jsEditor.data('editor').setValue("function (element, value) {\n  if (value === '1') {\n     return true;\n  }\n  return false;\n}");
        }
      }

      function showJsEditorForDependency(e) {
        var value = e.data.action.functionCode;

        $jsEditor.dialog({
          resizable: false,
          modal: true,
          width: 700,
          title: 'Edit your function',
          buttons: {
            Ok: function () {
              var editedValue = $jsEditor.data('editor').getValue();
              e.data.actSection.find('div[data-action-type="function"] textarea').val(editedValue).trigger('change');
              $(this).dialog("close");
            }
          }
        });

        if (value !== undefined) {
          $jsEditor.data('editor').setValue(value);
        } else {
          $jsEditor.data('editor').setValue("function () {\n  var res = 'value';\n  return res;\n}");
        }
      }

      //#endregion



      //#region METADATA FUNCTIONS

      /** Removes all the unnecessary markup generated by the different used plugins **/
      function removeFieldMarkups(field, cleanStyle) {
        /// <summary>Removes all the unnecessary markup generated by the different used plugins.</summary>
        /// <param name="field" type="Object">The field container to remove the markup.</param>
        /// <param name="cleanStyle" type="bool">Indicates if style markup should be removed.</param>

        var $this = $(field),
          type = $fieldsCollection[$this.attr('id')];

        // remove misc jquery ui classes, inline styles, etc
        $this.find(FIELD_ACTIONS + ', ' + RESIZABLE_HANDLE).remove();
        $this.removeClass(RESIZABLE_CLASS).removeClass(DRAGGABLE_CLASS).removeAttr(ARIA_DISABLED_ATTR);

        // for radio and checkbox 
        if ($.inArray(type, ['checkbox', 'radio']) != -1) {
          // remove extra draggable for inner options
          $this.find(xr2formsCommon.vars.CHECK_RADIO_OPTIONS).removeClass(DRAGGABLE_CLASS);
          // remove extra markup created by uniform plugin
          removeUniformMarkup($this, type);
        }

        // remove extra markup for date created by jQueryUI datepicker
        if (type == 'date')
          $this.find(xr2formsCommon.vars.DATEPICKER_INPUT).removeClass(DATEPICKER_CLASS);

        if (cleanStyle) {
          clearStyleProperty($this, type);
        }
      }

      /** Remove the extra markup added by the uniform() plugin **/
      function removeUniformMarkup(field, type) {

        if (type == 'select') {
          field.find('span:first-child').remove();
          field.find('select').unwrap();
        }
        else if ($.inArray(type, ['checkbox', 'radio']) != -1) {
          field.find('input').unwrap().unwrap();
        }
        else {
          field.find('span.filename, span.action').remove();
          field.find('input').unwrap();
        }
      }

      /** Returns a string representation of the JSON object that is built containing
       the metadata for each of the form fields, following the server side representation **/
      function getMetadata(cleanMarkup) {
        /// <summary>Returns a string representation of the JSON object that is built containing
        /// the metadata for each of the form fields, following the server side representation.</summary>
        /// <param name="cleanMarkup" type="bool">Indicates if style markup should be removed.</param>
        /// <returns type="string"></returns>

        if (cleanMarkup !== undefined) {

          // check and exit if in preview mode
          if (inPreviewMode()) {
            designerStatus.SwitchToDesign();
          }

          var metadata = new Array();

          // loop through each of the field containers
          $formDesigner.find(xr2formsCommon.vars.FIELD_CONTAINER).each(function () {

            // generate the field data object
            var fieldMetadata = getFieldMetadata($(this), cleanMarkup);

            // add the new metadata object into the collection
            metadata.push(fieldMetadata);
          });

          // transform the metadata for saving on the DB
          xr2formsCommon.transformMetadataToSend(metadata);  // common.js

          // return the string representation of the JSON object
          return metadata;
          //return JSON.stringify(metadata);
        }

        return undefined;
      }

      /** Returns the metadata for all the fields. Used for syncronization **/
      function getFieldsMetadata() {
        return getMetadata(true);
      }

      /** Returns an Object representation of the field, with it's metadata **/
      function getFieldMetadata(field, cleanMarkup) {
        /// <summary>Returns an Object representation of the field, with it's metadata.</summary>
        /// <param name="field" type="Object">The field container to obtain the metadata.</param>
        /// <param name="cleanMarkup" type="bool">Indicates if style markup should be removed.</param>
        /// <returns type="Object"></returns>

        var $field = $(field);
        if ($field.length > 0 && cleanMarkup !== undefined) {

          //#region Previous cleanup

          // reset text, pass, email, number and datepicker values
          $field.find(xr2formsCommon.vars.TEXT_INPUT + ', ' + xr2formsCommon.vars.PASSWORD_INPUT + ', ' + xr2formsCommon.vars.EMAIL_INPUT + ', ' + xr2formsCommon.vars.NUMBER_INPUT + ', ' + xr2formsCommon.vars.DATEPICKER_INPUT).val('');
          // reset radio buttons and checkboxes
          $field.find(xr2formsCommon.vars.RADIO_INPUT + ', ' + xr2formsCommon.vars.CHECKBOX_INPUT).each(function () {
            $(this)[0].checked = false;
            $(this).parent().removeClass('checked');
          });

          // deselect any field and close properties
          deselectFields();

          // make the field size explicit
          $field.css('width', $field.css('width'));
          $field.css('height', $field.css('height'));
          //#endregion

          // make a clone to remove unnecessary markup and obtain the HTML
          var $clone = $field.clone();
          removeFieldMarkups($clone, cleanMarkup);

          var fieldHTML = xr2formsCommon.outerHTML($($clone)[0]),  // common.js
            fieldData = new Object(),
            dataObject = $field.data();

          // some of the metadata attributes are computed properties
          fieldData[xr2formsCommon.vars.DATA_FIELD_ID] = $field.attr('id');
          fieldData[xr2formsCommon.vars.DATA_FIELD_TYPE] = $fieldsCollection[$field.attr('id')];
          fieldData[DATA_POSITION_TOP] = $field.css('top').replace('px', '');
          fieldData[DATA_POSITION_LEFT] = $field.css('left').replace('px', '');
          fieldData[DATA_FIELD_WIDTH] = $field.css('width').replace('px', '');
          fieldData[DATA_FIELD_HEIGHT] = $field.css('height').replace('px', '');
          fieldData[xr2formsCommon.vars.DATA_HTML] = fieldHTML;

          // loop through each of the metadata properties
          $.each(xr2formsCommon.vars.fieldDataProperties, function (index, key) {  // common.js
            // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
            var camelCaseKey = jQuery.camelCase(key),
              dataValue = dataObject[camelCaseKey];

            // save the ones that were specified on the field's data object
            if (dataValue !== undefined && dataValue !== null) {

              // transform the initial value keys to its internal ID representation
              if (camelCaseKey === 'initialvalue') {
                for (var mergeKey in mergeFieldDefinitionsDictionary) {
                  var regex = new RegExp("\\[" + mergeFieldDefinitionsDictionary[mergeKey].key + "\\]", "ig");
                  dataValue = dataValue.replace(regex, '[' + mergeKey + ']');
                }
              }

              fieldData[camelCaseKey] = getDeepCopy(dataValue);
            }
          });

          // transform and save the specified custom validations for the field
          fieldData[xr2formsCommon.vars.DATA_CUSTOM_VALIDATION_DATA] = processCustomValidationMetadataToSend(dataObject);
          // transform and save the specified dependencies for the field
          fieldData[xr2formsCommon.vars.DATA_DEPENDENCY_DATA] = processDependencyMetadataToSend(dataObject);

          return fieldData;
        }
        return undefined;
      }

      /** Process and transforms the custom validation metadata into a JSON string object **/
      function processCustomValidationMetadataToSend(dataObject) {
        /// <summary>Process and transforms the custom validation metadata into a JSON string object.</summary>
        /// <param name="dataObject" type="Object">The data object with the metadata to process.</param>
        /// <returns type="string"></returns>

        var valCount = dataObject[jQuery.camelCase(xr2formsCommon.vars.DATA_VALIDATION_COUNT)],
          valData = new Array();

        if (valCount !== undefined) {
          // loop through each of the custom validations
          for (var i = 1; i <= valCount; i++) {
            var validationData = new Object();

            // save each of the validation properties when specified
            for (var key in xr2formsCommon.vars.customValidationMetadataDictionary) {
              var value = dataObject[jQuery.camelCase(xr2formsCommon.vars.customValidationMetadataDictionary[key] + i)];
              if (value !== undefined && value !== null) {
                validationData[key] = value;
              }
            }

            // add the new validation data
            valData.push(validationData);
          }
        }

        // return the string representation of the JSON object
        return JSON.stringify(valData);
      }

      /** Process and transforms the dependency metadata into a JSON string object **/
      function processDependencyMetadataToSend(dataObject) {
        var depCount = dataObject[jQuery.camelCase(xr2formsCommon.vars.DATA_DEPENDENCY_COUNT)],
          depData = new Array();

        if (depCount !== undefined) {

          // loop through each of the defined dependencies
          for (var i = 1; i <= depCount; i++) {
            var dependency = dataObject[xr2formsCommon.vars.DATA_DEPENDENCY_DATA][i];
            var dependencyData = new Object();

            dependencyData.mode = dependency.mode;
            dependencyData.conditionOperator = dependency.GetRootCondition().operator;
            dependencyData.conditions = new Array();
            dependencyData.actions = new Array();

            // iterate over the conditions
            var conditions = dependency.GetRootCondition().GetConditions();
            for (var j = 0; j < conditions.length; j++) {
              dependencyData.conditions.push(conditions[j]);
            }

            // iterate over the actions
            var actions = dependency.GetActions();
            for (var k = 0; k < actions.length; k++) {
              dependencyData.actions.push(actions[k]);
            }

            // add the new dependency data
            depData.push(dependencyData);
          }
        }

        // return the string representation of the JSON object
        return JSON.stringify(depData);
      }


      /** Receives a string representation of a JSON object, that contains
       the fields metadata and loads this information on the fields data object **/
      function setFieldsMetadata(metadata) {
        /// <summary>Receives a string representation of a JSON object, that contains
        /// the fields metadata and loads this information on the fields data object.</summary>
        /// <param name="metadata" type="JSON">The JSON representation of the fields metadata.</param>

        // parse the fields data
        //metadata = jQuery.parseJSON(metadata);
        xr2formsCommon.transformMetadataToFieldsData(metadata);  //common.js

        // exit preview mode if it is enabled
        if (inPreviewMode()) {
          designerStatus.TogglePreviewMode();
        }

        // clean the xr2designer's fields section
        $formDesigner.html('');

        // reset the fields collection and counter
        $fieldsCollection = {};
        $fieldsCounter = 0;

        // loop through each of the metadata elements - each corresponds to a different field
        for (var field = 0; field < metadata.length; field++) {

          // set the metadata
          setFieldMetadata(metadata[field]);
        }
      }

      /** Based on the metadata given as a parameter, adds a new field and loads it data accordingly **/
      function setFieldMetadata(fieldMetadata) {
        /// <summary>Based on the metadata given as a parameter, adds a new field and loads it data accordingly.</summary>
        /// <param name="fieldMetadata" type="Object">The metadata of the field.</param>
        /// <returns type="Object">The newly created field</returns>

        // deselect any field and close the properties
        deselectFields();

        var fieldId = fieldMetadata[xr2formsCommon.vars.DATA_FIELD_ID],
          currentField;

        // insert the fields html code
        $formDesigner.append(fieldMetadata[xr2formsCommon.vars.DATA_HTML]);
        currentField = $formDesigner.find('#' + fieldId);

        // add the new field to the field collection object
        $fieldsCollection[fieldId] = fieldMetadata[xr2formsCommon.vars.DATA_FIELD_TYPE];
        // increase the fields counter
        $fieldsCounter++;

        // make all the metadata available on the field
        $.each(xr2formsCommon.vars.fieldDataProperties, function (index, key) {
          // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
          var camelCaseKey = jQuery.camelCase(key),
            dataValue = fieldMetadata[camelCaseKey];

          if (dataValue !== null && dataValue !== undefined) {

            // transform the initial value internal IDs to its key representation
            if (camelCaseKey === 'initialvalue') {
              for (var mergeKey in mergeFieldDefinitionsDictionary) {
                var regex = new RegExp("\\[" + mergeKey + "\\]", "ig");
                dataValue = dataValue.replace(regex, '[' + mergeFieldDefinitionsDictionary[mergeKey].key + ']');
              }
            }

            currentField.data(key, dataValue);
          }
        });
        // make the custom validation data available on the field
        xr2formsCommon.processCustomValidationMetadataToFields(fieldMetadata, currentField);  // common.js
        // make the dependency data available on the field
        xr2formsCommon.processDependencyMetadataToFields(fieldMetadata, currentField);  // common.js

        // add the actions section - delete option
        var info = {
          id: fieldId.slice(0, 32),  // GUID length = 32
          actionsType: 'field'
        };
        $(FIELD_ACTIONS_TEMPLATE).tmpl(info).appendTo(currentField);

        // apply uniform styles when needed
        currentField.find(xr2formsCommon.vars.CHECKBOX_RADIO_INPUTS).uniform();

        // apply datepicker when needed
        currentField.find(xr2formsCommon.vars.DATEPICKER_INPUT).datepicker({
          dateFormat: xr2formsCommon.vars.DATE_FORMAT,        // the format for parsed and displayed dates
          changeMonth: true,              // allows the user to change the month from a drop-down list
          changeYear: true,               // allows the user to change the year from a drop-down list
          showButtonPanel: true,          // whether to show the button panel
          showOtherMonths: true,          // display dates in other months at the start or end of the current month
          selectOtherMonths: true,        // allows to select days in other months shown before or after the current month
          yearRange: '-150:+10'           // range of years DISPLAYED, relative to today's year - doesn't restrict the selection
        });

        // make the field resizable
        makeFieldResizable(currentField);

        // make the fields draggables
        currentField.draggable({ containment: $workArea });

        // make the checkboxes and radio buttons draggables inside their container
        currentField.find(xr2formsCommon.vars.CHECK_RADIO_OPTIONS).draggable({
          containment: 'parent', stop: function (event, ui) {
            var fieldContainer = ui.helper.parent();
            resetResizableMinHeightAndWidth(fieldContainer);
          }
        });

        // apply the styles saved on the metadata
        applyFieldStyles(currentField, fieldMetadata[xr2formsCommon.vars.DATA_FIELD_TYPE]);

        // return the new field
        return currentField;
      }

      //#endregion


      //#region PREVIEW PROCESSING FUNCTIONS

      /** Copy all the fields to the preview section and removes the unnecessary markup **/
      function setupPreviewFormCode() {
        // copy form fields to previewSection
        $previewSection.html($formDesigner.html());

        // remove unnecessary markup
        $previewSection.find(xr2formsCommon.vars.FIELD_CONTAINER).each(function () {
          removeFieldMarkups(this, true);
        });

        // clean up the xr2designer section
        $formDesigner.html('');
      }

      /** Setup all validation rules and settings needed for the page instance, such as values, styles and plugins **/
      function setPreviewPageSettings(pageSection) {

        // parse the fields metadata
        //var metadata = jQuery.parseJSON(fieldsMetadata);
        var metadata = fieldsMetadata;
        xr2formsCommon.transformMetadataToFieldsData(metadata);  // common.js

        // copy data information when needed
        for (var i = 0; i < metadata.length; i++) {
          var fieldId = metadata[i]['FieldId'];
          var fieldContainer = pageSection.find('#' + fieldId);
          xr2formsCommon.vars.fieldsDataStructure[fieldId] = {};
          xr2formsCommon.vars.fieldsDataStructure[fieldId].container = fieldContainer;
          xr2formsCommon.vars.fieldsDataStructure[fieldId].type = metadata[i][xr2formsCommon.vars.DATA_FIELD_TYPE];
          xr2formsCommon.vars.fieldsDataStructure[fieldId].innerFields = fieldContainer.find(xr2formsCommon.vars.INNER_FIELDS);
          xr2formsCommon.setHtmlMetadata(metadata[i], fieldContainer);  // common.js
        }

        // load select fields values from server, when using 'premade fixed' source option
        xr2formsCommon.loadPremadeValuesForSelectFields(pageSection); // common.js

        // setup more common settings - styles, tooltips, dates, signatures
        xr2formsCommon.setPageCommonSettings(pageSection); // common.js

        // setup initial values
        var mergeFieldValuesDictionary = new Object();
        for (var key in mergeFieldDefinitionsDictionary) {
          if (mergeFieldDefinitionsDictionary[key].testValue !== undefined)
            mergeFieldValuesDictionary[key] = mergeFieldDefinitionsDictionary[key].testValue;
        }
        xr2formsCommon.prepareInitialValues(pageSection, mergeFieldValuesDictionary);     // common.js
        xr2formsCommon.setInitialValues(pageSection);  // common.js
        setMergeFieldValues(pageSection);

        // enable dependency validation settings
        xr2formsCommon.setPageDependencies(pageSection);  // common.js

        // enable checkbox to run the validation when a change event is raised
        xr2formsCommon.setCheckboxChangeEventHandler(pageSection, $errorSection, fieldValidationSuccess);  // common.js

        // setup all the validations required to the current page
        xr2formsCommon.setPageValidationSettings(pageSection, pageSubmitCustomAction, fieldValidationSuccess);  // common.js

        // setup the custom field validations
        xr2formsCommon.registerCustomValidations(pageSection);  // common.js
      }


      function setMergeFieldValues(pageSection) {
        var fieldContainers = pageSection.find(xr2formsCommon.vars.FIELD_CONTAINER);

        fieldContainers.find(xr2formsCommon.vars.TEXT_PASS_EMAIL_NUMBER_SELECT_INPUTS).each(function () {
          var mergeFieldId = $(this).attr(xr2formsCommon.vars.DATA_MERGE_FIELD_ID);
          if (mergeFieldId !== undefined && mergeFieldId !== '') {
            $(this).val(mergeFieldDefinitionsDictionary[mergeFieldId].testValue);
          }
        });
        fieldContainers.find(xr2formsCommon.vars.LABEL_LINK_INPUTS).each(function () {
          var mergeFieldId = $(this).attr(xr2formsCommon.vars.DATA_MERGE_FIELD_ID);
          if (mergeFieldId !== undefined && mergeFieldId !== '') {
            $(this).html(mergeFieldDefinitionsDictionary[mergeFieldId].testValue);
          }
        });
        fieldContainers.find(xr2formsCommon.vars.DATEPICKER_INPUT).each(function () {
          var mergeFieldId = $(this).attr(xr2formsCommon.vars.DATA_MERGE_FIELD_ID);
          if (mergeFieldId !== undefined && mergeFieldId !== '') {
            var strDate = mergeFieldDefinitionsDictionary[mergeFieldId].testValue.replace(/\-/ig, '/').split('T')[0].split('.')[0];
            var initialDate = Date.parse(strDate);
            if (!isNaN(initialDate)) {
              $(this).datepicker("setDate", new Date(initialDate));
            }
          }
        });
        fieldContainers.find(xr2formsCommon.vars.RADIO_INPUT).each(function () {
          var mergeFieldId = $(this).attr(xr2formsCommon.vars.DATA_MERGE_FIELD_ID);
          if (mergeFieldId !== undefined && mergeFieldId !== '' && mergeFieldDefinitionsDictionary[mergeFieldId].testValue === $(this).val()) {
            $(this).attr('checked', 'checked');
            $(this).parent().addClass('checked');
          }
        });
        fieldContainers.find(xr2formsCommon.vars.CHECKBOX_INPUT).each(function () {
          var mergeFieldId = $(this).attr(xr2formsCommon.vars.DATA_MERGE_FIELD_ID);
          if (mergeFieldId !== undefined && mergeFieldId !== '') {
            var initialValues = mergeFieldDefinitionsDictionary[mergeFieldId].testValue.split(',');
            for (var i = 0; i < initialValues.length; i++) {
              if (initialValues[i] === $(this).val()) {
                $(this).attr('checked', 'checked');
                $(this).parent().addClass('checked');
              }
            }
          }
        });
      }

      /** Handles the onSuccess event raised by the validator **/
      function fieldValidationSuccess(e, els) {
        // checks for the next error to indicate to the user
        xr2formsCommon.checkNextError($previewSection, $errorSection, fieldValidationSuccess); // common.js
      }

      /** Custom action to perform when the form is submitted and all validations are passed **/
      function pageSubmitCustomAction(form) {
        // let user know via notification
        notificationService.ShowNotification(VALIDATION_SUCCESS_NOTIFICATION);
      }

      //#endregion

      //#region VALIDATION FUNCTIONS

      function isFormValid() {
        var isValid = validateFieldsDependencies();
        return isValid;
      }

      function getFieldsWithInvalidDep() {
        var result = [];

        // iterate over the fields
        $formDesigner.find(xr2formsCommon.vars.FIELD_CONTAINER).each(function () {
          var isValid = true;

          // iterate over the dependencies
          var depCount = $(this).data(xr2formsCommon.vars.DATA_DEPENDENCY_COUNT);
          for (var i = 1; i <= depCount && isValid; i++) {
            var dep = $(this).data(xr2formsCommon.vars.DATA_DEPENDENCY_DATA)[i];

            //iterate over the conditions
            var conditions = dep.GetRootCondition().GetConditions();
            for (var j = 0; j < conditions.length && isValid; j++) {
              var cond = conditions[j];

              if (cond.fieldId !== undefined) {
                // check that the field exist
                if ($fieldsCollection[cond.fieldId] == undefined) {
                  isValid = false;
                }
              }
            }
          }

          if (!isValid) {
            result.push($(this).attr('id'));
          }
        });

        return result;
      }

      function validateFieldsDependencies() {
        var invalidFields = getFieldsWithInvalidDep();

        if (invalidFields.length > 0) {
          var msj = 'The following fields have dependencies that need to be revised: ';
          for (var i = 0; i < invalidFields.length; i++) {
            msj += invalidFields[i] + ', ';
          }
          xr2formsCommon.showAlert(msj, 450);
          return false;
        }

        return true;
      }

      //#endregion



      //#region INITIALIZATION FUNCTONS

      /** Loads all necessary html views from the server via ajax, and initialize the xr2designer **/
      function init() {

        // load the xr2designer page on the container
        var designerPromise = $.get(opts.baseUrl + DESIGNER_TEMPLATE_URL);
        var mainPropertiesPromise = $.get(opts.baseUrl + MAINPROPERTIES_TEMPLATE_URL);
        var validationPropertiesPromise = $.get(opts.baseUrl + VALIDATIONPROPERTIES_TEMPLATE_URL);
        var cssPropertiesPromise = $.get(opts.baseUrl + CSSPROPERTIES_TEMPLATE_URL);
        var toolboxPromise = $.get(opts.baseUrl + TOOLBOX_TEMPLATE_URL);
        var modalDialogsPromise = $.get(opts.baseUrl + MODALDIALOGS_TEMPLATE_URL);
        var jQueryTemplatesPromise = $.get(opts.baseUrl + JQUERY_TEMPLATES_URL);

        // wait for all ajax calls to end
        $.when(designerPromise, mainPropertiesPromise, validationPropertiesPromise, cssPropertiesPromise, toolboxPromise, modalDialogsPromise, jQueryTemplatesPromise)
          .done(function (designerTemplate, mainPropertiesTemplate, validationPropertiesTemplate, cssPropertiesTemplate, toolboxTemplate, modalDialogsTemplate, jQueryTemplates) {

            $container.addClass('xr2designer-container').html(designerTemplate[0]);
            $container.find('#main-settings').html(mainPropertiesTemplate[0]);
            $container.find('#validation-settings').html(validationPropertiesTemplate[0]);
            $container.find('#style-settings').html(cssPropertiesTemplate[0]);
            $container.find('#toolbox').html(toolboxTemplate[0]);
            $container.find('#modalDialogs').html(modalDialogsTemplate[0]);
            $container.find('#jQueryTemplates').html(jQueryTemplates[0]);

            // run the initial setup
            initialSetup();

            // bind the model
            ko.applyBindings(koViewModel, $container[0]);

            // fire an event when the xr2designer is loaded
            $container.trigger($.Event("xr2designer:loaded"));
          })

          // in case any of the calls fails
          .fail(function () {
            $container.html("An error occurred and the xr2designer could not be loaded");
            $container.trigger($.Event("xr2designer:failedLoad"));
          });
      }

      function initialSetup() {
        // pseudo stop if this is old IE
        if ($.support.leadingWhitespace === false)
          xr2formsCommon.showAlert('This app only works in modern browsers.');

        // display loading indicator
        loading(true);

        // global variables initialization
        initializeGlobalVariables();

        // make field settings became tabs
        initializePropertySettingsTabs();

        // hide the field settings section - will be displayed when a field is added/selected
        designerUIControl.HideProperties();

        // setup datepicker plugin for any date field on the settings sections
        $container.find(xr2formsCommon.vars.DATEPICKER_INPUT).datepicker({
          dateFormat: xr2formsCommon.vars.DATE_FORMAT,
          changeMonth: true,
          changeYear: true,
          showButtonPanel: true,
          showOtherMonths: true,
          selectOtherMonths: true,
          yearRange: '-150:+10'
        });

        // setup the javascript editor
        $jsEditor.data('editor', CodeMirror.fromTextArea($jsEditor.find('textarea')[0]));

        // bind all event handlers
        bindEvents();

        // setup the fields palette's drag and drop functionality
        setupPaletteDragFields();

        // setup general validation settings
        xr2formsCommon.setupValidation();

        // register custom validation effect to jquery validation plug-in
        designerUIControl.RegisterValidationEffect();

        // hide loading indicator
        loading(false);
      }

      /** Initializes the global variables **/
      function initializeGlobalVariables() {
        $fieldSettings = $container.find('#fieldProperties');
        $mainSettings = $fieldSettings.find('#main-settings');
        $mainSettingsMessage = $mainSettings.find("#mainSettingsMessage");
        $validationSettings = $fieldSettings.find('#validation-settings');
        $validationMessage = $validationSettings.find("#validationMessage");
        $customValidationMessage = $validationSettings.find("#customValidationMessage");
        $dependencySettings = $fieldSettings.find('#dependency-settings');
        $dependencyMessage = $dependencySettings.find("#dependencyMessage");
        $styleSettings = $fieldSettings.find('#style-settings');
        $styleBasicSettings = $styleSettings.find('#style-basic');
        $styleAdvancedSettings = $styleSettings.find('#style-advanced');
        $styleMessage = $styleSettings.find('#styleMessage');
        $inputSettings = $fieldSettings.find('#input-settings');
        $formTemplates = $('#form-elements-tmpl');
        $inputSettingsTmpl = $container.find('#input-settings-tmpl');
        $customValTemplate = $container.find('#validation-tmpl');
        $customValSection = $container.find('#custom-val-section');
        $dependencyTemplate = $container.find('#dependency-tmpl');
        $depConditionTemplate = $container.find('#dep-condition-tmpl');
        $depActionTemplate = $container.find('#dep-action-tmpl');
        $dependencySection = $container.find('#dependency-section');
        $workArea = $container.find('#work-area');
        $formBuilder = $container.find('#form-builder');
        $formDesigner = $container.find('#form-preview');
        $previewSection = $container.find('#preview-section');
        $formImage = $container.find("#form-image");
        $toggleBasicButton = $container.find('#toggleModeBasic');
        $toggleAdvancedButton = $container.find('#toggleModeAdvanced');
        $addInitialValueDialog = $container.find('#add-initial-value-action');
        $selectMergeFieldTypeDialog = $container.find('#select-merge-field-type');
        $initialValueSetting = $container.find('#main-initialvalue');
        $outFieldSelectNames = $container.find('#main-outFieldId select');
        $rangedateMinInput = $container.find('#min-date-manual');
        $rangedateMaxInput = $container.find('#max-date-manual');
        $errorSection = $container.find(xr2formsCommon.vars.ERROR_SECTION);
        $confirmDialog = $container.find('#confirm-action');
        $notification = $container.find('#notification');
        $documentSection = $container.find('#preview-section');
        $patternSelect = $container.find('#pattern-select');
        $jsEditor = $container.find('#jsEditor');
      }

      /** Makes the property settings became tabs **/
      function initializePropertySettingsTabs() {
        // Make the section property sections resizable - jscroll plugin 
        designerUIControl.MakeSettingsResizable();

        // make the style sections of the advance mode collapsible
        designerUIControl.MakeSectionsCollapsible($styleAdvancedSettings);
        designerUIControl.CollapseSections($styleAdvancedSettings);
      }

      /** Binds all event handlers **/
      function bindEvents() {

        // in case the user tries to submit the xr2designer form
        $formDesigner.submit(function () {
          // notify the user to use the preview mode to test the form
          notificationService.ShowNotification(INDESIGN_SUBMIT_NOTIFICATION);
          return false;
        });

        // bind the delete field buttons - this buttons are added for every new field
        $container.on('click', '.' + DELETE_FIELD_CLASS, function(){
          var field = $(this).parents(xr2formsCommon.vars.FIELD_CONTAINER);
          confirmAction(function () { removeField(field); }, DELETE_FIELD_ACTION_TITLE);
        });

        // field settings add and remove options buttons
        $container.find('#' + ADD_OPTION_ID).click(function () {
          addFieldOption();
        });
        $container.on('click', '.' + REMOVE_OPTION_CLASS, function () {
          removeFieldOption($(this));
        });

        // field selection on click
        $container.on('click', xr2formsCommon.vars.FIELD_CONTAINER, function (e) {
          if (!inPreviewMode()) {
            upperElementClick = true;     // the click event if fired in the parent div also
            // check whether the user is selecting multiple fields
            if (e.shiftKey) {
              selectMultipleFields(this);
            } else {
              selectField(this);
            }
          }
        });

        // field deselecting when clicked somewhere else on the document
        $workArea.on('click', function () {
          // check whether the user click on a field before, or if its clicking on an empty area
          if (upperElementClick) {
            upperElementClick = false;
          } else {
            deselectFields();
          }
        });

        // Add new custom validation
        $container.find('#' + ADD_CUSTOM_VAL_ID).click(function () {
          addNewCustomValidation();
        });

        // Delete a custom validation
        $container.on('click', '.' + DELETE_CUSTOM_VAL_CLASS, function () {
          var valSetting = $(this).parents('.' + SETTING_SECTION_CLASS);
          confirmAction(function () { removeCustomValidation(valSetting); }, REMOVE_CUSTOM_VALIDATION_TITLE);
        });

        // Add new dependency
        $container.find('#' + ADD_DEPENDENCY_ID).click(function () {
          addNewDependency();
        });

        // Delete a dependency
        $container.on('click', '.' + DELETE_DEPENDENCY_CLASS, function () {
          var depNumber = $(this).attr('data-depnumber');
          confirmAction(function () { removeDependency(depNumber); }, REMOVE_DEPENDENCY_TITLE);
        });

        // Add a new merge field
        $container.find('#' + ADD_MERGE_FIELD_ID).click(function () {
          showMergeFieldDialog();
        });
      }

      /** Setup the palette and document page to allow the new fields to be added using drag and drop **/
      function setupPaletteDragFields() {
        // Let the palette controls be draggable
        $container.find("#controls li").draggable({
          cancel: "a.ui-icon", // clicking an icon won't initiate dragging
          containment: $container, // constrains dragging to within the bounds of the specified element
          distance: 20,   // distance in pixels, after mousedown, the mouse must move before dragging should start
          helper: "clone",    // allows for a helper element to be used for dragging display
          revert: "invalid", // when not dropped, the item will revert back to its initial position
          zIndex: 100
        });

        // let the document area be droppable, accepting the palette controls
        $workArea.droppable({
          accept: $container.find("#controls li"),    // controls which draggable elements are accepted by the droppable.
          activeClass: "droppableActive", // if specified, the class will be added to the droppable while an acceptable draggable is being dragged
          drop: function (event, ui) {    // triggered when an accepted draggable is dropped on the droppable
            var positionLeft = parseInt(ui.offset.left) - parseInt($workArea.offset().left) - 25;
            var positionTop = parseInt(ui.offset.top) - parseInt($workArea.offset().top);
            var id = ui.draggable.attr('id');
            addField(id, positionLeft, positionTop);
          }
        });
      }

      //#endregion


      //#region Knockout ViewModel 
      var koViewModel = {
        loading: loading,
        inPreviewMode: inPreviewMode,
        inAdvancedMode: inAdvancedMode,


        tooglePreview: designerStatus.TogglePreviewMode,
        testSubmit: submitPage,
        switchToBasicMode: designerStatus.SwitchToBasicMode,
        switchToAdvancedMode: designerStatus.SwitchToAdvancedMode,

        alignFieldsTop: alignFieldsTop,
        alignFieldsBottom: alignFieldsBottom,
        alignFieldsLeft: alignFieldsLeft,
        alignFieldsRight: alignFieldsRight,
        cloneField: cloneField,
      };


      //#region TEMPORAL AUXILIAR FUNCTIONS
      function submitPage() {
        $previewSection.submit();
      }
      //#endregion

      //#endregion

      // initialize the plugin
      init();

      //#region Public available methods
      return {
        getFieldsMetadata: getFieldsMetadata,
        setFieldsMetadata: setFieldsMetadata,
        setFormImage: setFormImage,
        resetImage: resetFormImage,
        clearForm: resetForm,
        addStringMergeField: addStringMergeField,
        addDateMergeField: addDateMergeField,
        addDecimalMergeField: addDecimalMergeField,
        addSelectMergeField: addSelectMergeField,
        addComboValueKeyValuePair: addComboValueKeyValuePair,
      };
      //#endregion  
    };


    designer.default_options = defaultOptions;
    return designer;
  })();
})(window, jQuery);
