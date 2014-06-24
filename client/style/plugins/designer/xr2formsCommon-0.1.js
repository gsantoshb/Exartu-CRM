/// <reference path="../jquery-1.9.1.js" />


(function (window, $) {
  window.xr2formsCommon = (function () {

    //#region DEPENDENCY OBJECTS DEFINITION

    /* Dependency object */
    function Dependency(mode) {

      // condition object
      var rootCondition = new Condition();
      // collection of actions
      var actions = [];

      // dependency mode - basic or advanced
      this.mode = (mode !== undefined && (mode === common.vars.DEPENDENCY_MODE_BASIC || mode === common.vars.DEPENDENCY_MODE_ADVANCED)) ? mode : common.vars.DEPENDENCY_MODE_BASIC;

      // returns the condition object
      this.GetRootCondition = function () {
        return rootCondition;
      };

      // returns the collection of actions
      this.GetActions = function () {
        return actions;
      };

      // adds a new action to the collection
      this.AddAction = function () {
        var action = new Action(common.vars.ACTION_TYPE_BASIC, common.vars.ACTION_SELECTOR_ALL);
        actions.push(action);
        return action;
      };

      // removes an action by index
      this.RemoveActionAt = function (index) {
        if (index !== undefined && index >= 0 && index < actions.length) {
          actions.splice(index, 1);
          return actions;
        }
      };
    }

    /* Condition */
    function Condition(operator) {

      // operator
      this.operator = (operator !== undefined && (operator === common.vars.OPERATOR_AND || operator === common.vars.OPERATOR_OR)) ? operator : common.vars.OPERATOR_OR;

      // conditions collection
      var conditions = [];

      // returns the array of conditions
      this.GetConditions = function () {
        return conditions;
      };

      // adds a new condition to the array
      this.AddCondition = function (fieldId, comparer, value) {
        var condition = new SimpleCondition(fieldId, comparer, value);
        conditions.push(condition);
        return condition;
      };

      // adds a new compound condition to the array
      this.AddCompoundCondition = function () {
        var condition = new Condition();
        conditions.push(condition);
        return condition;
      };

      // removes a condition by index
      this.RemoveConditionAt = function (index) {
        if (index !== undefined && index >= 0 && index < conditions.length) {
          conditions.splice(index, 1);
        }
        return conditions;
      };


      /* Simple Condition object */
      function SimpleCondition(fieldId, comparer, value) {
        this.fieldId = fieldId;
        this.comparer = comparer;
        this.value = value;
      }
    }

    /* Action object */
    function Action(type, selector, basicName, manualName, property, value, evalOtherwise, otherwiseValue, functionCode) {
      this.type = type;
      this.selector = selector;
      this.basicName = basicName;
      this.manualName = manualName;
      this.property = property;
      this.value = value;
      this.evalOtherwise = evalOtherwise !== undefined ? evalOtherwise : 'false';
      this.otherwiseValue = otherwiseValue;
      this.functionCode = functionCode;

      this.ClearValues = function () {
        this.basicName = undefined;
        this.manualName = undefined;
        this.property = undefined;
        this.value = undefined;
        this.evalOtherwise = 'false';
        this.otherwiseValue = undefined;
      };
    }

    /** Returns true if the dependency is correctly defined **/
    function IsDepCorrectlyDefined(dependency) {
      if (dependency instanceof Dependency) {
        var isCorrect = true;

        // iterate over the conditions
        var conditions = dependency.GetRootCondition().GetConditions();
        for (var i = 0; i < conditions.length && isCorrect; i++) {
          var cond = conditions[i];
          // check that the properties are defined
          if (cond.fieldId === undefined || cond.comparer === undefined
            || (cond.value === undefined && cond.comparer !== 'anyValue')
            // and that the depending field exist
            || common.vars.fieldsDataStructure[cond.fieldId] === undefined) {

            isCorrect = false;
          }
        }

        // iterate over the actions
        var actions = dependency.GetActions();
        for (var j = 0; j < actions.length && isCorrect; j++) {
          var act = actions[j];
          if (act.type === undefined || act.selector === undefined
            || act.property === undefined && act.type !== common.vars.ACTION_TYPE_FUNCTION
            || act.type === common.vars.ACTION_TYPE_FUNCTION && (act.functionCode === undefined || act.functionCode === '')
            || act.value === undefined && (act.property !== 'value' || act.property !== 'tooltip')) {
            //TODO: revisar que con las demas propiedades tengan que elegir un valor
            // agregar a los colores un Default

            isCorrect = false;
          }
        }

        return isCorrect;
      }

      return false;
    }


    //#endregion

    //#region Form representation functions

    /** Since we have different plugins and type of fields, this function returns the
     corresponding field's type based on the classes or the actual input type **/
    function getType(field) {
      var input;

      // sometimes we use this function on the field's container for simplicity
      // in those cases we have to select the inner input/select/label/canvas
      if (!field.is('canvas, input, select, option, textarea, label, a'))
        input = field.find('canvas, input:first, select, textarea, label, a').first();
      else input = field;

      //.ttw-range and .ttw-date are hacks b/c chrome is currently stripping the type attribute from these fields!
      if (input.is('.ttw-range'))
        return 'range';
      else if (input.is('.ttw-date'))
        return 'date';
      else if (input.is('input'))
        return input.html5type();
      else if (input.is('select, option'))
        return 'select';
      else if (input.is('textarea'))
        return 'textarea';
      else if (input.is('label'))
        return 'label';
      else if (input.is('canvas'))
        return 'canvas';
      else if (input.is('a'))
        return 'link';
      else
        return '';
    }

    /** This is a wrapper version of the outerHTML function.
     Some browsers don't support it, so we construct the element ourselves when needed **/
    function outerHTML(node) {
      // if IE, Chrome take the internal method otherwise build one
      return node.outerHTML || (
        function (n) {
          var div = document.createElement('div'), h;
          div.appendChild(n.cloneNode(true));
          h = div.innerHTML;
          div = null;
          return h;
        })(node);
    }

    /** Returns wheter the field is been displayed or hidden **/
    function isFieldHidden(fieldContainer) {
      var type = common.vars.fieldsDataStructure[fieldContainer.attr('id')].type;

      if (type === 'checkbox' || type === 'radio' || type === 'canvas') {
        return fieldContainer.css('display') === 'none';
      } else {
        return common.vars.fieldsDataStructure[fieldContainer.attr('id')].innerFields.first().css('display') === 'none';
      }
    }

    /** Given a Data object and a target field, sets the corresponding html attributes and data properties **/
    function setHtmlMetadata(dataObject, targetField) {
      targetField = $(targetField);
      $.each(common.vars.fieldDataProperties, function (index, key) {
        // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
        var dataValue = dataObject[jQuery.camelCase(key)];
        if (dataValue !== undefined && dataValue !== null) {
          var type = dataObject[common.vars.DATA_FIELD_TYPE];
          if (key === common.vars.DATA_GROUPING || key === common.vars.DATA_REQUIRED || key === common.vars.DATA_CURRENT_DATE || key === common.vars.DATA_MIN_DATE_CURRENT || key === common.vars.DATA_MAX_DATE_CURRENT) {
            if (dataValue === 'checked') {
              if (key === common.vars.DATA_REQUIRED) {
                // required attribute for checkbox group and radio group will go on the parent div since default html5 required behavior validates each individual field rather than the group
                // required attribute for signature also goes on the parent div for manual validation
                if (type === 'checkbox' || type === 'radio' || type === 'canvas')
                  targetField.addClass('required');
                else
                  targetField.find('input, select').attr('required', 'required');
              } else {
                targetField.find('input, select, label').attr(key, dataValue);
              }
            }
          }
          else if (key === common.vars.DATA_READ_ONLY) {
            if (dataValue === 'checked') {
              targetField.find('input').attr('readonly', 'readonly');
            }
          }
          else if (key === common.vars.DATA_MIN_SELECTED || key === common.vars.DATA_TOOLTIP) {
            targetField.attr(key, dataValue);
          }
          else if (key === common.vars.DATA_STYLE) {
            $.each(dataValue, function (key, value) {
              if (type === 'checkbox' || type === 'radio' || (type === 'canvas' && key === 'display')) {
                targetField.css(key, value[common.vars.DATA_STYLE_VALUE]);
              }
              else {
                // handle IE8 bug on transparent backgrounds
                if (isOldVersionIE && (key === 'background' || key === 'background-color') && value[common.vars.DATA_STYLE_VALUE].toLowerCase() === 'transparent') {
                  targetField.find('input, select, canvas, label, a').css('background-color', 'transparent').css('background-image', 'url(\'../Areas/DocCenter/images/transparent.gif\')');
                } else {
                  targetField.find('input, select, canvas, label, a').css(key, value[common.vars.DATA_STYLE_VALUE]);
                }
              }
            });
          }
          else {
            targetField.find('input, select, label, a').attr(key, dataValue);
          }
        }
      });

      /** Sets the corresponding custom validation metadata on the field's data object **/
      processCustomValidationMetadataToFields(dataObject, targetField);
      /** Sets the corresponding dependency metadata on the field's data object **/
      processDependencyMetadataToFields(dataObject, targetField);
    }

    /** Given a loaded dataObject and a field, process and save the
     corresponding custom validation metadata on the field's data object **/
    function processCustomValidationMetadataToFields(dataObject, currentField) {
      // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
      var valCount = dataObject[jQuery.camelCase(common.vars.DATA_VALIDATION_COUNT)],
        validationData = jQuery.parseJSON(dataObject[common.vars.DATA_CUSTOM_VALIDATION_DATA]);

      // loop through every custom validation, making it available on the field's data object
      if (valCount !== undefined) {
        for (var i = 1; i <= valCount; i++) {

          // loop through each validation property, saving it when there's a value on the dataObject
          for (var key in common.vars.customValidationMetadataDictionary) {
            var value = validationData[i - 1][key];
            if (value !== undefined && value !== null) {
              currentField.data()[jQuery.camelCase(common.vars.customValidationMetadataDictionary[key] + i)] = htmlDecode(value);
            }
          }

        }
        // make the validation count available on the field's data
        if (currentField.data() !== undefined && currentField.data() !== null)
          currentField.data()[jQuery.camelCase(common.vars.DATA_VALIDATION_COUNT)] = valCount;
      }
    }

    /** Given a loaded dataObject and a field, process and save the
     corresponding dependency metadata on the field's data object **/
    function processDependencyMetadataToFields(dataObject, currentField) {
      // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
      var depCount = dataObject[jQuery.camelCase(common.vars.DATA_DEPENDENCY_COUNT)],
        dependencyData = jQuery.parseJSON(dataObject[common.vars.DATA_DEPENDENCY_DATA]);

      // loop through every defined dependency, making it available on the field's data object
      if (depCount !== undefined) {

        // create the dependency object
        if (currentField.data(common.vars.DATA_DEPENDENCY_DATA) === undefined) {
          currentField.data(common.vars.DATA_DEPENDENCY_DATA, new Object());
        }

        // loop through each dependency
        for (var i = 0; i < depCount; i++) {

          var newDependency = new Dependency();
          newDependency.mode = dependencyData[i].mode;
          newDependency.GetRootCondition().operator = dependencyData[i].conditionOperator;

          // iterate over the conditions
          for (var j = 0; j < dependencyData[i].conditions.length; j++) {
            newDependency.GetRootCondition().AddCondition(
              dependencyData[i].conditions[j].fieldId,
              dependencyData[i].conditions[j].comparer,
              dependencyData[i].conditions[j].value);
          }

          // iterate over the actions
          for (var k = 0; k < dependencyData[i].actions.length; k++) {
            var action = newDependency.AddAction();
            action.type = dependencyData[i].actions[k].type;
            action.selector = dependencyData[i].actions[k].selector;
            action.basicName = dependencyData[i].actions[k].basicName;
            action.manualName = dependencyData[i].actions[k].manualName;
            action.property = dependencyData[i].actions[k].property;
            action.value = dependencyData[i].actions[k].value;
            action.evalOtherwise = dependencyData[i].actions[k].evalOtherwise;
            action.otherwiseValue = dependencyData[i].actions[k].otherwiseValue;
            action.functionCode = dependencyData[i].actions[k].functionCode;
          }

          // add the new dependency - i+1 bc is zero based on the array
          currentField.data(common.vars.DATA_DEPENDENCY_DATA)[i + 1] = newDependency;
        }

        // make the dependency count available on the field's data
        if (currentField.data() !== undefined && currentField.data() !== null)
          currentField.data()[jQuery.camelCase(common.vars.DATA_DEPENDENCY_COUNT)] = depCount;
      }
    }

    /** Load the values from the server for the select fields that
     were configured using the 'premade fixed' option as the source **/
    function loadPremadeValuesForSelectFields(pageSection) {
      $(pageSection).find(common.vars.PREMADE_SELECT_FIELDS).each(function () {
        var selectListControl = $(this),
          idToLoad = selectListControl.attr(common.vars.PREFIXED_SOURCE_ID_ATTR);

        // clear any previous value
        selectListControl.find('option').remove();

        // get the values from the server
        var data = [];
        $.ajax({
          url: getFullyQualifiedURL(common.vars.GET_COMBO_VALUES_URL + idToLoad),
          dataType: 'json',
          data: null,
          async: false,
          success: function (data) {
            // add each of the returned values as an option for the select field
            data = $.map(data, function (item, a) {
              return '<option value=\"' + item.Value + '\">' + item.Text + '</option>';
            });
            selectListControl.append(data.join(''));
          }
        });

      });
    }

    /**  Setup the more common settings - styles, tooltips, dates, signatures  **/
    function setPageCommonSettings(pageSection) {

      // apply uniform plugin to checkboxes and radio buttons
      pageSection.find(common.vars.CHECKBOX_RADIO_INPUTS).uniform().removeAttr('style');

      // setup tooltips plugin
      pageSection.find(common.vars.FIELD_CONTAINER + '[tooltip]').each(function () {
        var tooltipOpacity = common.vars.TOOLTIP_OPACITY;
        if (isFieldHidden($(this)))
          tooltipOpacity = 0.0;
        $(this).attr("title", $(this).attr('tooltip')).tooltip({ opacity: tooltipOpacity, effect: 'fade' });
      });

      // fill date field with current date or initial value, when required
      pageSection.find(common.vars.DATEPICKER_INPUT).each(function () {
        // get the minimum date, if any
        var minDate, maxDate;
        if ($(this).attr('rangedate-min-current') !== undefined && $(this).attr('rangedate-min-current') === 'checked') {
          minDate = new Date();
        } else {
          minDate = $(this).attr('rangedate-min') !== undefined && $(this).attr('rangedate-min') !== '' ? $.datepicker.parseDate(common.vars.DATE_FORMAT, $(this).attr('rangedate-min')) : '';
        }

        // get the maximum date, if any
        if ($(this).attr('rangedate-max-current') !== undefined && $(this).attr('rangedate-max-current') === 'checked') {
          maxDate = new Date();
        } else {
          maxDate = $(this).attr('rangedate-max') !== undefined && $(this).attr('rangedate-max') !== '' ? $.datepicker.parseDate(common.vars.DATE_FORMAT, $(this).attr('rangedate-max')) : '';
        }

        // setup date picker plugin
        $(this).datepicker({
          dateFormat: common.vars.DATE_FORMAT,
          changeMonth: true,
          changeYear: true,
          showButtonPanel: true,
          showOtherMonths: true,
          selectOtherMonths: true,
          yearRange: '-150:+10',
          minDate: minDate,
          maxDate: maxDate,
          onSelect: function (dateText, inst) {
            // raise a change event to notify the validation plugin
            $(this).trigger('change');
          }
        });

        // set the corresponding date, when the document was previously submitted
        if ($(this).attr('value') !== undefined && $(this).attr('value') !== '' && !isNaN(Date.parse($(this).attr('value')))) {
          $(this).datepicker("setDate", new Date(Date.parse($(this).attr('value'))));
        } else {
          // if the current-date option was set, use today date. Or use the initial value, if it was set
          if ($(this).attr('current-date') !== undefined && $(this).attr('current-date') === 'checked') {
            $(this).datepicker("setDate", new Date());
          }
        }

        // disabled the datepicker in those cases were the user selected the readonly option - also changed by dependencies
        if ($(this).attr('readonly') !== undefined && $(this).attr('readonly') !== '') {
          $(this).datepicker('disable').removeAttr('disabled');
        }
      });

      // add and empty first value for select fields, as a title
      // the value used is the one defined on the xr2designer
      pageSection.find('select').each(function () {
        var id = $(this).attr('id') + '-0';
        var emptyOption = '<option id=\"' + id + '\" value=\"\">' + $(this).attr('select-title') + '</option>';
        $(this).prepend(emptyOption).find('option:first').attr('selected', true);
      });

      // Make checkboxes read-only, by canceling the propagation
      pageSection.find(common.vars.CHECKBOX_INPUT + '[readonly]').attr('onclick', 'javascript: return false;');

      // Make checkboxes behave as a group when specified
      pageSection.find(common.vars.CHECKBOX_GROUPING_INPUT).click(function () {

        if ($(this).attr('readonly') === undefined) {
          var groupName = $(this).attr('name');
          var group = common.vars.CHECKBOX_GROUPING_INPUT + "[name='" + groupName + "']";
          var isThisCurrent = $(this).is(common.vars.CHECKED_INPUT);

          // first uncheck all checkboxes
          pageSection.find(group).attr("checked", false).parent().removeClass('checked');
          // then select the one clicked (this) if its not the current one
          if (isThisCurrent) {
            $(this).attr("checked", true).parent().addClass('checked');
          }

          // add all diferent containers to the changedFields to exec possible deps
          var $thisContainerId = $(this).parents(common.vars.FIELD_CONTAINER).attr('id');
          pageSection.find(group).parents(common.vars.FIELD_CONTAINER).each(function () {
            var id = $(this).attr('id');
            if (id !== $thisContainerId && common.vars.changedFields[id] === undefined) {
              common.vars.changedFields[id] = 1;
            }
          });

          // setup a timeout for when a grouping is splited into various fields
          setTimeout(execDepForChangedFields, 100);
        }
      });

      // Make radio selection to fire a change event on the non selected radios, to trigger the associated dependencies
      pageSection.find(common.vars.RADIO_INPUT).bind('change', function () {
        var groupName = $(this).attr('name');
        var group = common.vars.RADIO_INPUT + "[name='" + groupName + "']";

        // add all diferent containers to the changedFields to exec possible deps
        var $thisContainerId = $(this).parents(common.vars.FIELD_CONTAINER).attr('id');
        pageSection.find(group).parents(common.vars.FIELD_CONTAINER).each(function () {
          var id = $(this).attr('id');
          if (id !== $thisContainerId && common.vars.changedFields[id] === undefined) {
            common.vars.changedFields[id] = 1;
          }
        });

        // setup a timeout for when a grouping is splited into various fields
        setTimeout(execDepForChangedFields, 100);
      });

      // setup signature pad plugin
      pageSection.find(common.vars.FIELD_CONTAINER + '.' + common.vars.SIGNATURE_PAD_CLASS).each(function () {
        var padWidth = $(this).css('width').replace('px', ''),
          padHeight = $(this).css('height').replace('px', '');

        // the canvas width and height need to be as attributes
        $(this).find('canvas').attr('width', padWidth);
        $(this).find('canvas').attr('height', padHeight);

        // raise a change event when drawing, to notify the validation plugin
        $(this).find('canvas').click(function () {
          $(this).next('input').trigger('change');
        });

        // obtain the value before the plugin is applied, because is overridden
        var outputFieldValue = $(this).find(common.vars.SIGNATURE_INNER_INPUT).attr('value');
        // apply the signature pad plugin
        $(this).data(common.vars.DATA_SIGNATURE_PAD, $(this).signaturePad({
          defaultAction: 'drawIt',    // to use the draw function as default
          drawOnly: true,             // to only allow the draw function
          lineTop: -2,                // to hide line that the plugin draws on the canvas
          validateFields: false       // we use our own validation plugin and custom function on this
        }));

        // regenerate the signature when it was submitted
        if (outputFieldValue !== undefined && outputFieldValue !== '') {
          $(this).data(common.vars.DATA_SIGNATURE_PAD).regenerate(outputFieldValue);
        }
      });
    }

    /** Setup the initial values **/
    function prepareInitialValues(pageSection, mergeFieldValuesDictionary) {
      // replace initial values with the current example values
      var fieldContainers = pageSection.find(common.vars.FIELD_CONTAINER);
      for (var key in mergeFieldValuesDictionary) {
        var regex = new RegExp("\\[" + key + "\\]", "ig");
        fieldContainers.find('input, select, label, a').each(function () {
          if ($(this).attr(common.vars.INITIAL_VALUE_ATTR) !== undefined && $(this).attr(common.vars.INITIAL_VALUE_ATTR) !== '') {
            $(this).attr(common.vars.INITIAL_VALUE_ATTR, $(this).attr(common.vars.INITIAL_VALUE_ATTR).replace(regex, mergeFieldValuesDictionary[key]));
          }
        });
      }
    }

    /** Set the initial values **/
    function setInitialValues(pageSection) {
      var fieldContainers = pageSection.find(common.vars.FIELD_CONTAINER);
      fieldContainers.find(common.vars.TEXT_PASS_EMAIL_NUMBER_SELECT_INPUTS).each(function () {
        if ($(this).attr(common.vars.INITIAL_VALUE_ATTR) !== undefined && $(this).attr(common.vars.INITIAL_VALUE_ATTR) !== '') {
          $(this).val($(this).attr(common.vars.INITIAL_VALUE_ATTR));
        }
      });
      fieldContainers.find(common.vars.LABEL_LINK_INPUTS).each(function () {
        if ($(this).attr(common.vars.INITIAL_VALUE_ATTR) !== undefined && $(this).attr(common.vars.INITIAL_VALUE_ATTR) !== '') {
          $(this).html($(this).attr(common.vars.INITIAL_VALUE_ATTR));
        } else if ($(this).parent(common.vars.FIELD_CONTAINER).attr('data-mfType') !== undefined) {
          $(this).html($(this).attr(common.vars.INITIAL_VALUE_ATTR));
        }
      });
      fieldContainers.find(common.vars.DATEPICKER_INPUT).each(function () {
        if ($(this).attr(common.vars.INITIAL_VALUE_ATTR) !== undefined && $(this).attr(common.vars.INITIAL_VALUE_ATTR) !== '') {
          var strDate = $(this).attr(common.vars.INITIAL_VALUE_ATTR).replace(/\-/ig, '/').split('T')[0].split('.')[0];
          var initialDate = Date.parse(strDate);
          if (!isNaN(initialDate)) {
            $(this).datepicker("setDate", new Date(initialDate));
          }
        }
      });
      fieldContainers.find(common.vars.RADIO_INPUT).each(function () {
        if ($(this).attr(common.vars.INITIAL_VALUE_ATTR) !== undefined && $(this).attr(common.vars.INITIAL_VALUE_ATTR) !== '' && $(this).attr(common.vars.INITIAL_VALUE_ATTR) === $(this).val()) {
          $(this).attr('checked', 'checked');
          $(this).parent().addClass('checked');
        }
      });
      fieldContainers.find(common.vars.CHECKBOX_INPUT).each(function () {
        if ($(this).attr(common.vars.INITIAL_VALUE_ATTR) !== undefined && $(this).attr(common.vars.INITIAL_VALUE_ATTR) !== '') {
          var initialValues = $(this).attr(common.vars.INITIAL_VALUE_ATTR).split(',');
          for (var i = 0; i < initialValues.length; i++) {
            if (initialValues[i] === $(this).val()) {
              $(this).attr('checked', 'checked');
              $(this).parent().addClass('checked');
            }
          }
        }
      });
    }

    /** Enable dependency validation settings and run it once **/
    function setPageDependencies(pageSection) {

      // loop through each of the fields seting up the auxiliar dependency structures
      pageSection.find(common.vars.FIELD_CONTAINER).each(function () {
        var fieldContainerId = $(this).attr('id');
        // obtain the dependency count
        var depCount = $(this).data(common.vars.DATA_DEPENDENCY_COUNT);
        if (depCount === undefined) {
          depCount = 0;
        }

        for (var i = 1; i <= depCount; i++) {
          var dependency = $(this).data(common.vars.DATA_DEPENDENCY_DATA)[i];
          // if dependency is correctly defined
          if (IsDepCorrectlyDefined(dependency)) {

            // iterate over the conditions adding the depFields to the list of fields with dependencies
            var conditions = dependency.GetRootCondition().GetConditions();
            for (var j = 0; j < conditions.length; j++) {
              var cond = conditions[j],
                depFieldId = cond.fieldId;

              // add the depField to the list of fields with dependencies
              if (common.vars.fieldObservers[depFieldId] === undefined) {
                // create a new JS Object if it's not defined yet
                common.vars.fieldObservers[depFieldId] = new Object();
              }

              // add this field's container as a 'dependency observer' of the depField
              if (common.vars.fieldObservers[depFieldId][fieldContainerId] === undefined) {
                common.vars.fieldObservers[depFieldId][fieldContainerId] = new Object();
              }

              // add the dependency number for this depField as a key
              if (common.vars.fieldsDataStructure[depFieldId].type === 'checkbox' && $('#' + depFieldId).attr(common.vars.CHECKBOX_GROUPING_ATTR) === undefined) {

                if (common.vars.fieldObservers[depFieldId][fieldContainerId][i] === undefined) {
                  common.vars.fieldObservers[depFieldId][fieldContainerId][i] = new Object();
                }

                if (cond.comparer === common.vars.COMPARER_ANY_VALUE) {
                  common.vars.fieldObservers[depFieldId][fieldContainerId][i][j] = common.vars.COMPARER_ANY_VALUE;
                } else {
                  common.vars.fieldObservers[depFieldId][fieldContainerId][i][j] = cond.value;
                }

              } else {
                common.vars.fieldObservers[depFieldId][fieldContainerId][i] = 1;
              }

              // add the depField to trigger this field dependency
              common.vars.changedFields[depFieldId] = 1;
            }
          }
        }

      });

      // execute initial dependencies
      execDepForChangedFields();

      // setup field's change event handler to execute deps
      for (var fieldId in common.vars.fieldObservers) {
        if (common.vars.fieldsDataStructure[fieldId] !== undefined) {
          // find named field and bind 'change' event handler
          common.vars.fieldsDataStructure[fieldId].innerFields.filter('input, select, label, a').bind('change textchange', execDepOnFieldChange);
        }
      }
    }

    function execDepOnFieldChange() {
      // find the field's container ID
      var depFieldId = $(this).parents(common.vars.FIELD_CONTAINER).attr('id');
      // add it to the list of changed fields if is not allready there
      if (common.vars.changedFields[depFieldId] === undefined) {
        if (common.vars.fieldsDataStructure[depFieldId].type === 'checkbox' && $(this).attr(common.vars.CHECKBOX_GROUPING_ATTR) === undefined) {
          if (common.vars.changedFields[depFieldId] === undefined) {
            common.vars.changedFields[depFieldId] = new Object();
          }
          common.vars.changedFields[depFieldId][$(this).attr('id')] = 1;
        } else {
          common.vars.changedFields[depFieldId] = 1;
        }
        // delay the execution of the dependencies for checkboxes that insert the same group ID for every input
        setTimeout(execDepForChangedFields, 100);
      }
    }

    function execDepForChangedFields() {
      // Execute the dependencies while there is still fields on the list of changedFields
      while (Object.keys(common.vars.changedFields).length > 0) {
        for (fieldId in common.vars.changedFields) {
          var changedValue = common.vars.changedFields[fieldId];

          // remove it from the list
          delete common.vars.changedFields[fieldId];

          // check whether other fields depend on this one to execute the dep
          if (common.vars.fieldObservers[fieldId] !== undefined) {
            // loop through every observer
            for (var observerId in common.vars.fieldObservers[fieldId]) {

              // if it is a normal checkbox field (changedValue is an Object)
              if (changedValue !== 1) {
                // only execute the deps that depend on the selected/deselected value
                for (depNumber in common.vars.fieldObservers[fieldId][observerId]) {
                  var execute = false;

                  // iterate over all the changed options
                  for (var optionId in changedValue) {
                    // iterate over the dep conditions
                    for (var condition in common.vars.fieldObservers[fieldId][observerId][depNumber]) {
                      // check if the condition is based on the changed option or if its set as 'any'
                      if (common.vars.fieldObservers[fieldId][observerId][depNumber][condition] === common.vars.COMPARER_ANY_VALUE
                        || common.vars.fieldObservers[fieldId][observerId][depNumber][condition] === optionId) {


                        // TODO: when a checkbox is used with any_value, and it's unselected, should the function execute?
                        execute = true;
                      }
                    }
                  }
                  if (execute) {
                    // execute the dep
                    executeDependencyForField(fieldId, observerId, depNumber);
                  }
                }
              } else {
                for (var depNumber in common.vars.fieldObservers[fieldId][observerId]) {
                  // execute the dep
                  executeDependencyForField(fieldId, observerId, depNumber);
                }
              }

            }
          }

        }
      }
    }

    function executeDependencyForField(fieldId, observerId, depNumber) {

      // Define the execution function
      if (common.vars.fieldsDataStructure[observerId].container.data(common.vars.DATA_DEPENDENCY_DATA) !== undefined) {
        var dependency = common.vars.fieldsDataStructure[observerId].container.data(common.vars.DATA_DEPENDENCY_DATA)[depNumber];
        if (areDepConditionsMet(dependency.GetRootCondition())) {
          executeDependency(dependency, true, observerId);
        } else {
          executeDependency(dependency, false, observerId);
        }

        // Enable/disable the tooltip based on the display property of the field
        var targetField = common.vars.fieldsDataStructure[observerId].container;
        if (targetField.data()[common.vars.DATA_TOOLTIP] !== undefined) {
          if (isFieldHidden(targetField)) {
            targetField.data()[common.vars.DATA_TOOLTIP].getConf().opacity = 0.0;
          } else {
            targetField.data()[common.vars.DATA_TOOLTIP].getConf().opacity = common.vars.TOOLTIP_OPACITY;
          }
        }
      }
    }

    function areDepConditionsMet(rootCondition) {
      if (rootCondition instanceof Condition) {
        var conditions = rootCondition.GetConditions(),
          valid = false;

        if (rootCondition.operator === common.vars.OPERATOR_OR) {
          // iterate until one condition is true
          for (var i = 0; i < conditions.length && !valid; i++) {
            valid = evaluateDepCondition(conditions[i]);
          }
        } else if (rootCondition.operator === common.vars.OPERATOR_AND) {
          valid = true;
          // iterate until one condition is false
          for (var j = 0; j < conditions.length && valid; j++) {
            valid = evaluateDepCondition(conditions[j]);
          }
        }
        return valid;
      }
      return undefined;
    }

    function evaluateDepCondition(condition) {
      // find the field
      var depField = common.vars.fieldsDataStructure[condition.fieldId].container,
        depType = common.vars.fieldsDataStructure[condition.fieldId].type,
        innerField = common.vars.fieldsDataStructure[condition.fieldId].innerFields;

      // if 'any value' is the comparer
      if (condition.comparer === common.vars.COMPARER_ANY_VALUE) {
        // for checkbox/radio, look for a checked option
        if ($.inArray(depType, ['checkbox', 'radio']) != -1) {
          if (depField.find(common.vars.CHECKED_INPUT).length > 0)
            return true;
        } else {
          if (innerField.val() !== undefined && innerField.val() !== '')
            return true;
        }
      } else {

        // check if its a regular checkbox
        if (depType === 'checkbox' && depField.attr(common.vars.CHECKBOX_GROUPING_ATTR) === undefined) {
          // find the option specified
          var option = innerField.filter('[id="' + condition.value + '"]');
          if (option.length > 0) {
            // check that the condition is met
            if (condition.comparer === common.vars.COMPARER_IS_CHECKED) {
              return option.is(common.vars.CHECKED_INPUT);
            } else if (condition.comparer === common.vars.COMPARER_NOT_CHECKED) {
              return option.is(common.vars.NOT_CHECKED_INPUT);
            }
          }
        } else {

          // get the current value
          var currentValue = undefined;
          if ($.inArray(depType, ['checkbox', 'radio']) != -1) {
            if (depField.find(common.vars.CHECKED_INPUT).length > 0) {
              currentValue = depField.find(common.vars.CHECKED_INPUT).first().attr('id');
            } else {
              currentValue = '';
            }
          } else if (depType === 'select') {
            currentValue = innerField.val() !== '' ? innerField.find('option[value="' + innerField.val() + '"]').attr('id') : '';
          } else {
            currentValue = innerField.val();
          }

          //#region TESTING VALUE USING THE COMPARER
          var conditionDate, currentDate;
          if (condition.comparer === common.vars.COMPARER_EQUALS) {
            return currentValue === condition.value;
          } else if (condition.comparer === common.vars.COMPARER_NOT_EQUALS) {
            return currentValue !== condition.value;
          } else if (condition.comparer === common.vars.COMPARER_CONTAINS) {
            return currentValue.indexOf(condition.value) !== -1;
          } else if (condition.comparer === common.vars.COMPARER_NOT_CONTAINS) {
            return currentValue.indexOf(condition.value) === -1;
          } else if (condition.comparer === common.vars.COMPARER_GREATER_THAN) {
            if (depType === 'number') {
              return parseFloat(currentValue) > parseFloat(condition.value);
            } else if (depType === 'date') {
              conditionDate = Date.parse(condition.value);
              currentDate = Date.parse(currentValue);
              if (!isNaN(currentDate) && !isNaN(conditionDate) && currentDate > conditionDate) {
                return true;
              }
              return false;
            }
          } else if (condition.comparer === common.vars.COMPARER_LESS_THAN) {
            if (depType === 'number') {
              return parseFloat(currentValue) < parseFloat(condition.value);
            } else if (depType === 'date') {
              conditionDate = Date.parse(condition.value);
              currentDate = Date.parse(currentValue);
              if (!isNaN(currentDate) && !isNaN(conditionDate) && currentDate < conditionDate) {
                return true;
              }
              return false;
            }
          } else if (condition.comparer === common.vars.COMPARER_IS_CHECKED) {
            return currentValue === condition.value;
          } else if (condition.comparer === common.vars.COMPARER_NOT_CHECKED) {
            return currentValue !== condition.value;
          } else if (condition.comparer === common.vars.COMPARER_REG_EXPRESSION) {
            return currentValue.match(condition.value) !== undefined;
          }
          //#endregion
        }

      }
      return false;
    }

    function executeDependency(dependency, matched, fieldId) {
      if (dependency instanceof Dependency && matched !== undefined) {
        var fieldType = common.vars.fieldsDataStructure[fieldId].type;

        // iterate over the actions
        var depActions = dependency.GetActions();
        for (var i = 0; i < depActions.length; i++) {
          var action = depActions[i];

          //#region BASIC AND ADVANCED TYPE
          if ($.inArray(action.type, [common.vars.ACTION_TYPE_BASIC, common.vars.ACTION_TYPE_MANUAL]) !== -1) {
            // check that the action should be executed
            if (matched || action.evalOtherwise) {

              var property = action.property,
                value;

              if (matched) {
                // use the 'value' property
                value = action.value;
              } else {
                // use the 'otherwisevalue' property
                value = action.otherwiseValue;
              }

              //#region SELECTOR ALL
              if (action.selector === common.vars.ACTION_SELECTOR_ALL) {

                // find the inner field in the cases needed
                var targetField;
                if ($.inArray(fieldType, ['checkbox', 'radio', 'canvas']) === -1) {
                  targetField = common.vars.fieldsDataStructure[fieldId].innerFields.first();
                } else {
                  targetField = common.vars.fieldsDataStructure[fieldId].container;
                }

                //#region CSS TYPE PROPERTIES
                if (property.startsWith(common.vars.DEP_CSS_PROP_PREFIX)) {
                  // CSS type property
                  property = property.replace(common.vars.DEP_CSS_PROP_PREFIX, '');
                  if (value !== '' && value !== common.vars.EMPTY_VALUE) {
                    // handle IE8 bug on transparent backgrounds
                    if (isOldVersionIE && ($.inArray(property, ['background', 'background-color']) !== -1) && value.toLowerCase() === 'transparent') {
                      targetField.css('background-color', 'transparent').css('background-image', 'url(\'../Areas/DocCenter/images/transparent.gif\')');
                    }
                    else {
                      targetField.css(property, value);
                    }
                  } else {
                    if (isOldVersionIE) {
                      targetField.removeInlineStyle(property);
                    } else {
                      targetField.css(property, '');
                    }
                  }
                }
                //#endregion

                //#region INPUT TYPE PROPERTIES
                else {
                  // required attribute for checkbox group and radio group will go on the parent div since default html5 required behavior validates each individual field rather than the group
                  // required attribute for signature also goes on the parent div for manual validation
                  if (($.inArray(fieldType, ['checkbox', 'radio', 'canvas']) !== -1) && property === 'required') {
                    if (value === 'required') {
                      targetField.addClass('required');
                    } else {
                      targetField.removeClass('required');
                    }
                  }
                  else if (($.inArray(fieldType, ['checkbox', 'radio']) !== -1) && property === 'value') {
                    // set the corresponding value for checkboxes and radio buttons
                    if (value !== common.vars.EMPTY_VALUE) {
                      // raise a click event on the corresponding input
                      var selectedOption = common.vars.fieldsDataStructure[fieldId].innerFields.filter(common.vars.NOT_CHECKED_INPUT + '[id="' + value + '"]');
                      if (selectedOption.length > 0) {
                        selectedOption.trigger('click');
                      }
                    } else {
                      // deselect all the inputs
                      common.vars.fieldsDataStructure[fieldId].innerFields.filter(common.vars.CHECKED_INPUT).each(function () {
                        $(this).attr("checked", false).parent().removeClass('checked');
                        $(this).trigger('change');
                      });
                    }
                  }
                  else if (($.inArray(fieldType, ['checkbox', 'radio']) !== -1) && ($.inArray(property, ['readonly', 'disabled']) !== -1)) {
                    if (value !== common.vars.EMPTY_VALUE) {
                      common.vars.fieldsDataStructure[fieldId].innerFields.attr(property, value);
                      if (property === 'readonly') {
                        // Make checkboxes/radio buttons read-only, by canceling the propagation
                        common.vars.fieldsDataStructure[fieldId].innerFields.attr('onclick', 'javascript: setTimeout(function(){$.uniform.update();}, 1); return false;');
                      }
                    } else {
                      common.vars.fieldsDataStructure[fieldId].innerFields.removeAttr(property);
                      if (property === 'readonly') {
                        common.vars.fieldsDataStructure[fieldId].innerFields.removeAttr('onclick');
                      }
                    }
                  } else if (fieldType === 'select' && property === 'value') {
                    var optionValue = common.vars.fieldsDataStructure[fieldId].innerFields.find('option[id="' + value + '"]').attr('value');
                    targetField.val(optionValue);
                  }
                  else {
                    targetField.removeAttr(property);
                    if (value !== undefined && value !== '' && value !== common.vars.EMPTY_VALUE) {
                      targetField.attr(property, value);
                    }
                    // TODO: avoid recursive calls
                    if (true) {
                      common.vars.changedFields[fieldId] = 1;
                    }
                  }

                  // if the affected field is a date field, and the property is 'readonly'
                  if (fieldType === 'date' && property === 'readonly') {
                    // enable/disable the datepicker in those cases were readonly attribute was changed
                    if (targetField.attr('readonly') !== undefined && targetField.attr('readonly') !== '') {
                      targetField.datepicker('disable');
                    } else {
                      targetField.datepicker('enable');
                    }
                  }
                }
                //#endregion

              }
              //#endregion

              //#region SELECTOR VALUE
              else {
                var targetOption = common.vars.fieldsDataStructure[fieldId].innerFields.filter('[id="' + action.selector + '"]');
                if (targetOption.length > 0) {

                  // apply the specific html based on the property
                  if (property.startsWith(common.vars.DEP_CSS_PROP_PREFIX)) {
                    property = property.replace(common.vars.DEP_CSS_PROP_PREFIX, '');
                    targetOption.parent('span').css(property, value);
                  } else if (property === 'disabled') {
                    if (value !== common.vars.EMPTY_VALUE) {
                      targetOption.attr(property, value);
                      targetOption.attr('onclick', 'javascript: setTimeout(function(){$.uniform.update();}, 1); return false;');
                    } else {
                      targetOption.removeAttr(property);
                      targetOption.removeAttr('onclick');
                    }
                  } else if (property === 'selected') {
                    if (value !== common.vars.EMPTY_VALUE) {
                      if (!targetOption.is(common.vars.CHECKED_INPUT)) {
                        targetOption.trigger('click');
                      }
                    } else {
                      if (targetOption.is(common.vars.CHECKED_INPUT)) {
                        targetOption.attr("checked", false).parent().removeClass('checked');
                        targetOption.trigger('change');
                      }
                    }
                  }

                }
              }
              //#endregion
            }
          }
          //#endregion

          //#region FUNCTION TYPE
          else if (action.type === common.vars.ACTION_TYPE_FUNCTION && matched) {
            try {
              // evaluate the provided function using the following snippet
              // the depFunction should follow the JavaScript's function definition syntax
              window.result = undefined;
              jQuery.globalEval('var IO = ' + action.functionCode.replace(/\n/g, '') + '; window.result = IO();');

              // set the field value with the result
              if (window.result !== undefined) {
                if ($.inArray(fieldType, ['checkbox', 'radio']) !== -1) {

                  // set the corresponding value for checkboxes and radio buttons
                  if (window.result !== '') {
                    // raise a click event on the corresponding input
                    var selectedInput = common.vars.fieldsDataStructure[fieldId].innerFields.filter(common.vars.NOT_CHECKED_INPUT + '[value="' + window.result + '"]');
                    if (selectedInput.length > 0) {
                      selectedInput.trigger('click');
                    }
                  } else {
                    // deselect all the inputs
                    common.vars.fieldsDataStructure[fieldId].innerFields.filter(common.vars.CHECKED_INPUT).each(function () {
                      $(this).attr("checked", false).parent().removeClass('checked');
                      $(this).trigger('change');
                    });
                  }

                } else {
                  // TODO: avoid recursive calls
                  if (true) {
                    common.vars.changedFields[fieldId] = 1;
                  }

                  if (fieldType === 'select') {
                    var optionValue = common.vars.fieldsDataStructure[fieldId].innerFields.find('option[id="' + action.value + '"]').attr('value');
                    common.vars.fieldsDataStructure[fieldId].innerFields.val(optionValue);
                  } else if (fieldType === 'date') {
                    if (!isNaN(Date.parse(window.result))) {
                      common.vars.fieldsDataStructure[fieldId].innerFields.datepicker('setDate', window.result);
                    }
                  } else if ($.inArray(fieldType, ['label', 'link']) !== -1) {
                    common.vars.fieldsDataStructure[fieldId].innerFields.html(window.result);
                  } else {
                    common.vars.fieldsDataStructure[fieldId].innerFields.filter('input').val(window.result);
                  }
                }
              }

            } catch (error) {
              var fieldName = common.vars.fieldsDataStructure[fieldId].innerFields.filter('input, select, label, a').first().attr('name');
              var msj = "There was an error executing a dependency of type Function.<br />";
              msj += "Field's name: " + fieldName + ".<br />";
              msj += "Error message: " + error.message;

              showAlert(msj);
            }
          }
          //#endregion

        }
      }
    }

    //#endregion

    //#region Validation functions

    function setupValidation() {
      // set the Spanish localization for the common error messages
      $.tools.validator.localize("es", {
        '*': 'Por favor, revisar este campo',
        ':email': 'Esta dirección de email no es correcta',
        ':number': 'Este campo sólo acepta números',
        ':url': 'Esta dirección web (link) no es correcta',
        '[max]': 'La cantidad máxima para esta campo es $1',
        '[min]': 'La cantidad mínima para esta campo es $1',
        '[required]': 'Por favor, completar este campo'
      });

      // add custom validator for minimumlength attribute
      $.tools.validator.fn("[minimumlength]", function (input, value) {
        var min = input.attr("minimumlength");
        var isRequired = input.attr("required");
        // the validation should only fail when the field is required or when it's optional and the user entered some text
        if (isRequired !== undefined || value.length > 0) {
          return value.length >= min ? true :
          {
            en: "Please provide at least " + min + " character" + (min > 1 ? "s" : ""),
            es: "Proveea al menos " + min + " caracter" + (min > 1 ? "es" : "")
          };
        }
        return true;
      });

      // add custom validator for data-equals attribute (password checker)
      $.tools.validator.fn("[data-equals]", {
        en: "Value not equal with the $1 field",
        es: "El valor tiene que ser igual al del campo $1"
      }, function (input) {

        var name = input.attr('data-equals'),
          field = this.getInputs('password').filter("[name=" + name + "]");
        return input.val() === field.val() ? true : [name];
      });

      // add custom validator for signature pad fields
      $.tools.validator.fn("div.field.sigPad input", function (input, value) {
        var isRequired = input.parent().hasClass("required");
        if (isRequired) {
          return value.length > 0 ? true :
          {
            en: "Please sign the document",
            es: "Por favor firme el documento"
          };
        }
        return true;
      });
    }

    /** Enable checkbox to run the validation when a change event is raised **/
    function setCheckboxChangeEventHandler(pageSection, errorSection, fieldValidationSuccess) {
      pageSection.find(common.vars.CHECKBOX_INPUT).bind('change', function () {
        // clear any previous error messages and styles displayed
        clearCheckboxError($(this), pageSection, errorSection, fieldValidationSuccess);
        // remove the checked attribute when it corresponds
        if (!$(this).is(common.vars.CHECKED_INPUT)) {
          $(this).removeAttr('checked');
        }
      });
    }

    /** Setup all the validations required to the current page **/
    function setPageValidationSettings(pageSection, action, fieldValidationSuccess, actionOnFailure) {

      // unbind any old submit event handler
      pageSection.unbind('submit');

      // install a new instance of the validator
      pageSection.validator({
        lang: $('meta').lenght > 0 ? $('meta').attr('content').slice(0, 2) : 'en',        // this is loaded on the razor as a HTML helper
        effect: 'customErrors',                             // the custom effect error defined on each page
        container: common.vars.ERROR_SECTION,               // the section where the errors will appear
        inputEvent: 'change'                                // to trigger the validation immediately
      }).bind("onSuccess", fieldValidationSuccess);

      // control the submit event, run validation, and execute the passed action on success
      pageSection.submit(function (e) {

        // scroll to top of the page
        $('html, body').animate({ scrollTop: 0 }, 'slow');

        //run check/radio group validation
        var form = $(this);
        var checkRadioValidation = validateCheckRadio(form);

        // if normal validation is passed
        if (!e.isDefaultPrevented() && checkRadioValidation) {
          // perform the specified action, using the corresponding form
          action(form);
        } else if (actionOnFailure != undefined) {
          actionOnFailure(form);
        }

        return false;
      });
    }

    /** Setup the custom validations defined for the fields **/
    function registerCustomValidations(pageSection) {
      // loop through each of the fields deleting any previous validation
      pageSection.find(common.vars.FIELD_CONTAINER).each(function () {
        // obtain the validation count
        var valCount = $(this).data(common.vars.DATA_VALIDATION_COUNT);

        if (valCount !== undefined && valCount > 0) {
          // TODO: checkboxes y radio buttons - canvas
          var fieldIdMatcher = '#' + $(this).find('input, select').first().attr('id');
          $.tools.validator.deleteAllMatching(fieldIdMatcher);

          // setup the validation plugin to use the custom validation
          $.tools.validator.fn(fieldIdMatcher, handleCustomValidation);
        }
      });


      function handleCustomValidation(el, value) {
        // obtain the field container
        var container = $(el).parents(common.vars.FIELD_CONTAINER);

        // obtain the validation count
        var valCount = container.data(common.vars.DATA_VALIDATION_COUNT);

        var i = 1,
          isValid = true,
          errorMessage = '';

        while (isValid && i <= valCount) {
          // obtain the stored validation function
          var validationFunction = container.data(common.vars.VAL_FUNCTION + i);

          if (validationFunction !== undefined && validationFunction !== '') {
            // make the element and object available for the custom validation function
            jQuery.globalEval('var auxElement, auxValue;');
            window.auxElement = el;
            window.auxValue = value;
            jQuery.globalEval('var IO = ' + validationFunction.replace('\n', '') + '; var result = IO(window.auxElement, window.auxValue);');

            // check the results
            if (result === false) {
              isValid = false;
              errorMessage = container.data(common.vars.VAL_ERROR_MESSAGE + i);
            } else if (result.substring) { // check whether the result is a string message
              isValid = false;
              errorMessage = result;
            }
          }

          i++;
        }

        // check exit condition
        if (isValid)
          return true;

        return (errorMessage !== undefined ? errorMessage : "Please correct this value");
      }
    }

    /** Clear any checkbox errors when a change event is raised **/
    function clearCheckboxError(input, pageSection, errorSection, fieldValidationSuccess) {
      // check whether we are displaying the errors to the user
      if (errorSection.css('display') === 'block') {
        // remove the error class from the field's container
        input.parents(common.vars.FIELD_CONTAINER).removeClass(common.vars.ERROR_FIELD_CLASS);
        // run the validation again to update the displayed errors, if any
        checkNextError(pageSection, errorSection, fieldValidationSuccess);
      }
    }

    /** Checks for the next error to indicate to the user **/
    function checkNextError(pageSection, errorSection, fieldValidationSuccess) {
      // check whether we are displaying the errors to the user
      if (errorSection.css('display') === 'block') {
        var validator = pageSection.data("validator");
        // unbind the onSuccess event to prevent entering into a loop
        pageSection.unbind("onSuccess");
        // run the validation functions
        validator.checkValidity();
        validateCheckRadio(pageSection);
        // rebind the onSuccess event handler
        pageSection.bind("onSuccess", fieldValidationSuccess);
      }
    }

    /** Validate checkbox and radio groups **/
    function validateCheckRadio(pageForm) {
      var err = {};

      // check whether required group fields have at least one option selected
      pageForm.find(common.vars.RADIO_GROUP_CONTAINER + ', ' + common.vars.CHECKBOX_GROUP_CONTAINER).each(function () {
        if ($(this).hasClass('required')) {
          var type = getType($(this));
          var name = $(this).find('input:first').attr('name');
          if (!pageForm.find('input[type="' + type + '"][name="' + name + '"]:checked').length)
            err[name] = 'Please complete this mandatory field.';
        }
      });

      // check whether checkbox groups have the minimum of options selected when specified
      pageForm.find(common.vars.CHECKBOX_GROUP_CONTAINER).each(function () {
        var min = $(this).attr('min-selected');
        if (min !== undefined && min !== '' && min !== '0') {
          var name = $(this).find('input:first').attr('name');
          if (pageForm.find(common.vars.CHECKBOX_INPUT + '[name="' + name + '"]:checked').length < min) {
            err[name] = 'Please select at least ' + min + ' option' + (min > 1 ? 's' : '');
          }
        }
      });

      // if there were any errors, invalidate the fields and display the messages using the custom effect
      if (!$.isEmptyObject(err)) {
        var validator = pageForm.data('validator');
        // set aux variable to true, to indicate we are passing checkbox/option errors to the validator custom effect
        common.vars.checkboxOptionVerification = true;
        validator.invalidate(err);
        common.vars.checkboxOptionVerification = false;
        return false;
      }
      else return true;
    }

    /** This functions handle the error messages expand/collapse actions **/
    function showAllErrors() {
      $(this).unbind('click');
      var wall = $(this).parent(common.vars.ERROR_SECTION);
      wall.find('p').css('display', 'block');
      wall.find('div').remove();
      wall.append("<div style=\"float: right; position: relative;top: -10px; color:darkred; cursor:pointer; \">" + "show less" + "&#9650;</div>");
      wall.find('div').bind('click', showLessErrors);
    }
    function showLessErrors() {
      $(this).unbind('click');
      var wall = $(this).parent(common.vars.ERROR_SECTION);
      var errorMessages = wall.find('p');
      errorMessages.css('display', 'none').eq(0).css('display', 'block');
      wall.find('div').remove();
      wall.append("<div style=\"float: right; position: relative;top: -10px; color:darkred; cursor:pointer; \">" + "show more" + "&#9660;</div>");
      wall.find('div').bind('click', showAllErrors);
    }

    //#endregion

    //#region metadata transformation functions

    /** Transform the metadata from the fields, to conform the format used in the model **/
    function transformMetadataToSend(metadata) {

      // loop through each of the field's containers
      for (var field = 0; field < metadata.length; field++) {
        var dataObject = metadata[field];

        // transform the field type into it's integer representation
        // the numbers correspond to the model's FieldType enumeration values
        switch (dataObject[common.vars.DATA_FIELD_TYPE]) {
          case "text":
            dataObject[common.vars.DATA_FIELD_TYPE] = 1;
            break;
          case "password":
            dataObject[common.vars.DATA_FIELD_TYPE] = 2;
            break;
          case "number":
            dataObject[common.vars.DATA_FIELD_TYPE] = 3;
            break;
          case "email":
            dataObject[common.vars.DATA_FIELD_TYPE] = 4;
            break;
          case "date":
            dataObject[common.vars.DATA_FIELD_TYPE] = 5;
            break;
          case "radio":
            dataObject[common.vars.DATA_FIELD_TYPE] = 7;
            break;
          case "checkbox":
            dataObject[common.vars.DATA_FIELD_TYPE] = 8;
            break;
          case "select":
            dataObject[common.vars.DATA_FIELD_TYPE] = 9;
            break;
          case "label":
            dataObject[common.vars.DATA_FIELD_TYPE] = 10;
            break;
          case "canvas":
            dataObject[common.vars.DATA_FIELD_TYPE] = 11;
            break;
          case "link":
            dataObject[common.vars.DATA_FIELD_TYPE] = 12;
            break;
        }

        // iterate over the metadata properties
        for (key in common.vars.fieldDataPropertiesDictionary) {
          // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
          var camelCaseKey = jQuery.camelCase(key),
            dataValue = dataObject[camelCaseKey];

          // transform data from checkbox options into Boolean values when needed
          if (key === common.vars.DATA_READ_ONLY || key === common.vars.DATA_GROUPING || key === common.vars.DATA_DISPLAY_LABELS || key === common.vars.DATA_REQUIRED || key === common.vars.DATA_CURRENT_DATE || key === common.vars.DATA_MIN_DATE_CURRENT || key === common.vars.DATA_MAX_DATE_CURRENT) {
            if (dataValue === 'checked') {
              dataValue = true;
            } else {
              dataValue = false;
            }
          }
          // transform data from style into string
          else if (key === common.vars.DATA_STYLE) {
            dataValue = JSON.stringify(dataValue);
          }

          if (dataValue !== undefined && dataValue !== null) {
            // add the new Key
            dataObject[common.vars.fieldDataPropertiesDictionary[key]] = dataValue;
          }

          // remove the old key-value pair
          delete dataObject[camelCaseKey];
        }

      }
    }

    /** Transform the metadata received from the server, to conform the format used in the model **/
    function transformMetadataToFieldsData(metadata) {
      for (var field = 0; field < metadata.length; field++) {
        var dataObject = metadata[field];

        // transform the field type into a string representation, from the model's FieldType enumeration
        // the string representations are the same as the strings returned from the getType function
        switch (dataObject[common.vars.DATA_FIELD_TYPE]) {
          case 1:
            dataObject[common.vars.DATA_FIELD_TYPE] = "text";
            break;
          case 2:
            dataObject[common.vars.DATA_FIELD_TYPE] = "password";
            break;
          case 3:
            dataObject[common.vars.DATA_FIELD_TYPE] = "number";
            break;
          case 4:
            dataObject[common.vars.DATA_FIELD_TYPE] = "email";
            break;
          case 5:
            dataObject[common.vars.DATA_FIELD_TYPE] = "date";
            break;
          case 7:
            dataObject[common.vars.DATA_FIELD_TYPE] = "radio";
            break;
          case 8:
            dataObject[common.vars.DATA_FIELD_TYPE] = "checkbox";
            break;
          case 9:
            dataObject[common.vars.DATA_FIELD_TYPE] = "select";
            break;
          case 10:
            dataObject[common.vars.DATA_FIELD_TYPE] = "label";
            break;
          case 11:
            dataObject[common.vars.DATA_FIELD_TYPE] = "canvas";
            break;
          case 12:
            dataObject[common.vars.DATA_FIELD_TYPE] = "link";
            break;
        }

        // iterate over the metadata properties
        for (key in common.vars.fieldDataPropertiesDictionary) {
          // jQuery.camelCase("some-string") returns "someString"  - jQuery.data() uses this notation
          var camelCaseKey = jQuery.camelCase(key),
            dataValue = dataObject[common.vars.fieldDataPropertiesDictionary[key]];

          // transform data from Boolean values into the checkbox representation when needed
          if (key === common.vars.DATA_READ_ONLY || key === common.vars.DATA_GROUPING || key === common.vars.DATA_DISPLAY_LABELS || key === common.vars.DATA_REQUIRED || key === common.vars.DATA_CURRENT_DATE || key === common.vars.DATA_MIN_DATE_CURRENT || key === common.vars.DATA_MAX_DATE_CURRENT) {
            if (dataValue === true) {
              dataValue = 'checked';
              // add the new Key
              dataObject[camelCaseKey] = dataValue;
            }
            // remove the old key
            delete dataObject[common.vars.fieldDataPropertiesDictionary[key]];
          }
          else if (dataValue !== null && dataValue !== undefined) {

            // transform style string into an JS Object
            if (key === common.vars.DATA_STYLE) {
              dataValue = JSON.parse(dataValue);
            }

            // add the new Key
            dataObject[camelCaseKey] = dataValue;

            // remove the old key-value pair
            delete dataObject[common.vars.fieldDataPropertiesDictionary[key]];
          }
        }

      }

    }

    //#endregion


    /** Modal alert dialogs **/
    function showAlert(alert, width) {
      if (width === undefined)
        width = 'auto';

      $('<div>' + alert + '</div>').dialog({
        resizable: false,
        title: 'Alert',
        modal: true,
        width: width,
        buttons: {
          Ok: function () {
            $(this).dialog("close");
          }
        }
      });
    }


    //#region Public available methods
    var common = {

      // dependency objects
      dependency: Dependency,
      condition: Condition,
      action: Action,
      isDepCorrectlyDefined: IsDepCorrectlyDefined,

      // form representation functions
      getType: getType,
      outerHTML: outerHTML,
      isFieldHidden: isFieldHidden,
      setHtmlMetadata: setHtmlMetadata,
      processCustomValidationMetadataToFields: processCustomValidationMetadataToFields,
      processDependencyMetadataToFields: processDependencyMetadataToFields,
      loadPremadeValuesForSelectFields: loadPremadeValuesForSelectFields,
      setPageCommonSettings: setPageCommonSettings,
      prepareInitialValues: prepareInitialValues,
      setInitialValues: setInitialValues,
      setPageDependencies: setPageDependencies,

      // validation functions
      setupValidation: setupValidation,
      setCheckboxChangeEventHandler: setCheckboxChangeEventHandler,
      setPageValidationSettings: setPageValidationSettings,
      registerCustomValidations: registerCustomValidations,
      checkNextError: checkNextError,

      // metadata transformation functions
      transformMetadataToSend: transformMetadataToSend,
      transformMetadataToFieldsData: transformMetadataToFieldsData,

      // ui functions
      showAlert: showAlert,
      showAllErrors: showAllErrors,
      showLessErrors: showLessErrors,

      // common shared variables
      vars: {
        /** Auxiliary global variables **/
        fieldDataProperties: ['name', 'tooltip', 'initialvalue', 'href', 'outFieldId', 'mergeFieldId', 'displayLabels', 'read-only', 'tabindex', 'grouping', 'select-title', 'selectfield-source', 'select-prefixed-source', 'required', 'pattern', 'minimumlength', 'maxlength', 'min', 'max', 'min-selected', 'data-equals', 'current-date', 'rangedate-min', 'rangedate-min-current', 'rangedate-max', 'rangedate-max-current', 'validation-count', 'dependency-count', 'style'],
        fieldDataPropertiesDictionary: { 'name': 'FieldName', 'tooltip': 'Tooltip', 'initialvalue': 'InitialValue', 'href': 'Href', 'outFieldId': 'OutFieldId', 'mergeFieldId': 'MergeFieldId', 'displayLabels': 'DisplayLabels', 'read-only': 'ReadOnly', 'tabindex': 'TabIndex', 'grouping': 'IsGroup', 'select-title': 'SelectTitle', 'selectfield-source': 'SelectFieldSource', 'select-prefixed-source': 'SelectPrefixedSource', 'required': 'Required', 'pattern': 'Pattern', 'minimumlength': 'MinimumLength', 'maxlength': 'MaxLength', 'min': 'Min', 'max': 'Max', 'min-selected': 'MinSelected', 'data-equals': 'DataEquals', 'current-date': 'UseCurrentDate', 'rangedate-min': 'RangeDateMin', 'rangedate-min-current': 'RangeDateMinUseCurrent', 'rangedate-max': 'RangeDateMax', 'rangedate-max-current': 'RangeDateMaxUseCurrent', 'validation-count': 'CustomValidationCount', 'dependency-count': 'DependencyCount', 'style': 'Style' },
        customValidationMetadataDictionary: { 'valErrorMessage': 'customValidationMessage-', 'valFunction': 'customValidationFunction-' },
        dependencyMetadataDictionary: { 'depName': 'name-dependency-', 'depValue': 'value-dependency-', 'depType': 'type-dependency-', 'depPremade': 'premade-type-', 'depProperty': 'property-target-', 'depPropertyValue': 'property-value-', 'depPropertyOtherwise': 'property-otherwise-', 'depEvalOtherwise': 'property-eval-otherwise-', 'depFunction': 'function-type-' },
        regularValidationErrors: false,
        checkboxOptionVerification: false,
        fieldsDataStructure: {},
        fieldObservers: new Object(),
        changedFields: new Object(),
        isOldIE: isOldVersionIE(),

        //#region UI related variables
        FIELD_CONTAINER: 'div.field',
        INNER_FIELDS: 'canvas, input, select, textarea, label, a',
        TEXT_INPUT: 'input[type=text]',
        PASSWORD_INPUT: 'input[type=password]',
        EMAIL_INPUT: 'input[type=email]',
        NUMBER_INPUT: 'input[type=number]',
        SELECT_INPUT: 'select',
        RADIO_INPUT: 'input[type=radio]',
        CHECKBOX_INPUT: 'input[type=checkbox]',
        DATEPICKER_INPUT: 'input[type=datepicker]',
        CHECKBOX_GROUPING_INPUT: 'input[type=checkbox][grouping=checked]',
        CHECKED_INPUT: 'input:checked',
        NOT_CHECKED_INPUT: 'input:not(:checked)',
        TEXT_PASS_EMAIL_NUMBER_INPUTS: 'input[type=text], input[type=password], input[type=email], input[type=number]',
        TEXT_PASS_EMAIL_NUMBER_SELECT_INPUTS: 'input[type=text], input[type=password], input[type=email], input[type=number], select',
        LABEL_LINK_INPUTS: 'label, a',
        CHECKBOX_RADIO_INPUTS: 'input[type=checkbox], input[type=radio]',
        RADIO_GROUP_CONTAINER: 'div.field.radio-group',
        CHECKBOX_GROUP_CONTAINER: 'div.field.checkbox-group',
        DEP_TYPE_PREMADE: 'premade',
        DEP_TYPE_MANUAL: 'manual',
        DEP_TYPE_FUNCTION: 'function',
        DEP_FIELD_ID: 'name-dependency-',
        DEP_VALUE: 'value-dependency-',
        DEP_TYPE: 'type-dependency-',
        DEP_PROPERTY: 'property-target-',
        DEP_FUNCTION: 'function-type-',
        DEP_PROPERTY_VALUE: 'property-value-',
        DEP_PROPERTY_OTHERWISE: 'property-otherwise-',
        DEP_EVALAUTE_OTHERWISE: 'property-eval-otherwise-',
        DEP_EVALUATE_EVAL: 'evaluate',
        DEP_EVALUATE_NOTHING: 'nothing',
        DEP_CSS_PROP_PREFIX: 'css-',
        VAL_ERROR_MESSAGE: 'customValidationMessage-',
        VAL_FUNCTION: 'customValidationFunction-',
        DATA_FIELD_ID: 'FieldId',
        DATA_HTML: 'Html',
        DATA_CUSTOM_VALIDATION_DATA: 'CustomValidationData',
        DATA_DEPENDENCY_DATA: 'DependencyData',
        DATA_DEPENDENCY_COUNT: 'dependency-count',
        DATA_FIELD_TYPE: 'FieldType',
        DATA_NAME: 'name',
        DATA_TOOLTIP: 'tooltip',
        DATA_HREF: 'href',
        DATA_INITIAL_VALUE: 'initialvalue',
        DATA_OUT_FIELD_ID: 'outFieldId',
        DATA_MERGE_FIELD_ID: 'mergeFieldId',
        DATA_READ_ONLY: 'read-only',
        DATA_DISPLAY_LABELS: 'displayLabels',
        DATA_GROUPING: 'grouping',
        DATA_REQUIRED: 'required',
        DATA_MIN_LENGTH: 'minimumlength',
        DATA_MAX_LENGTH: 'maxlength',
        DATA_MIN_DATE: 'rangedate-min',
        DATA_MAX_DATE: 'rangedate-max',
        DATA_MIN_NUMBER: 'min',
        DATA_MAX_NUMBER: 'max',
        DATA_MIN_SELECTED: 'min-selected',
        DATA_CURRENT_DATE: 'current-date',
        DATA_MIN_DATE_CURRENT: 'rangedate-min-current',
        DATA_MAX_DATE_CURRENT: 'rangedate-max-current',
        DATA_STYLE: 'style',
        DATA_STYLE_VALUE: 'value',
        DATA_VALIDATION_COUNT: 'validation-count',
        DATA_SELECT_TITLE: 'select-title',
        DATA_SELECT_SOURCE: 'selectfield-source',
        SELECT_SOURCE_MANUAL: 'premademanual',
        SELECT_SOURCE_FIXED: 'premadefixed',
        ERROR_FIELD_CLASS: 'errorField',
        ERROR_SECTION: '#formErrors',
        MAX_ERRORS: 20,
        INITIAL_VALUE_ATTR: 'initialvalue',
        CHECKBOX_GROUPING_ATTR: 'grouping',
        PREMADE_SELECT_FIELDS: 'select[selectfield-source="premadefixed"]',
        PREFIXED_SOURCE_ID_ATTR: 'select-prefixed-source',
        GET_COMBO_VALUES_URL: '../ComboValues/GetListViaJson?comboId=',
        DATE_FORMAT: 'mm/dd/yy',
        SIGNATURE_PAD_CLASS: 'sigPad',
        SIGNATURE_INNER_INPUT: 'input[type=hidden].output',
        DATA_SIGNATURE_PAD: 'signaturePad',
        TOOLTIP_OPACITY: 1.0,
        //#endregion

        //#region DEPENDENCY VARIABLES
        DEPENDENCY_MODE_BASIC: 'basic',
        DEPENDENCY_MODE_ADVANCED: 'advanced',
        OPERATOR_AND: 'and',
        OPERATOR_OR: 'or',
        COMPARER_EQUALS: 'equals',
        COMPARER_NOT_EQUALS: 'notEquals',
        COMPARER_CONTAINS: 'contains',
        COMPARER_NOT_CONTAINS: 'notContains',
        COMPARER_GREATER_THAN: 'greaterThan',
        COMPARER_LESS_THAN: 'lessThan',
        COMPARER_IS_CHECKED: 'checked',
        COMPARER_NOT_CHECKED: 'notChecked',
        COMPARER_ANY_VALUE: 'anyValue',
        COMPARER_REG_EXPRESSION: 'regex',
        ACTION_SELECTOR_ALL: 'all',
        ACTION_TYPE_BASIC: 'basic',
        ACTION_TYPE_MANUAL: 'manual',
        ACTION_TYPE_FUNCTION: 'function',
        EMPTY_VALUE: '_XR2_EMPTY_VAL_',
        //#endregion
      },
    };
    //#endregion
    return common;
  })();

})(window, jQuery);

function htmlEncode(value) {
  if (value) {
    return jQuery('<div />').text(value).html();
  } else {
    return '';
  }
}
function htmlDecode(value) {
  if (value) {
    return $('<div />').html(value).text();
  } else {
    return '';
  }
}

function isOldVersionIE() {
  return ($.browser.msie && parseInt($.browser.version, 10) < 9);
}

/** Defines the function startsWith for the String type, which returns true if
 the string starts with the sub-string passed as a parameter and false otherwise **/
(function() {
  if (typeof String.prototype.startsWith != 'function') {
    String.prototype.startsWith = function (str) {
      return this.slice(0, str.length) == str;
    };
  }
})();

/* Returns an array of a given object's own enumerable properties,ht in the same order as that provided by a for-in loop (the difference being that a for-in loop enumerates properties in the prototype chain as well). */
(function () {
  /* To add compatible Object.keys support in older environments that do not natively support it, copy the following snippet: */
  if (!Object.keys) {
    Object.keys = (function () {
      var hasOwnProperty = Object.prototype.hasOwnProperty,
        hasDontEnumBug = !({ toString: null }).propertyIsEnumerable('toString'),
        dontEnums = [
          'toString',
          'toLocaleString',
          'valueOf',
          'hasOwnProperty',
          'isPrototypeOf',
          'propertyIsEnumerable',
          'constructor'
        ],
        dontEnumsLength = dontEnums.length;
      return function (obj) {
        if (typeof obj !== 'object' && typeof obj !== 'function' || obj === null) throw new TypeError('Object.keys called on non-object');
        var result = [];
        for (var prop in obj) {
          if (hasOwnProperty.call(obj, prop)) result.push(prop);
        }

        if (hasDontEnumBug) {
          for (var i = 0; i < dontEnumsLength; i++) {
            if (hasOwnProperty.call(obj, dontEnums[i])) result.push(dontEnums[i]);
          }
        }
        return result;
      };
    })();
  };
})();

/* jQuery plugin to remove inline styles from a given element  */
(function ($) {
  $.fn.removeInlineStyle = function (style) {
    var search = new RegExp(style + '[^;]+;?', 'g');

    return this.each(function () {
      $(this).attr('style', function (i, style) {
        return style.replace(search, '');
      });
    });
  };
})(jQuery);