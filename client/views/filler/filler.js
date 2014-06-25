/**
 * Created by ncampos on 6/23/14.
 */

var filler;


Template.fillerTemplate.rendered = function() {
  //initialize the xr2filler with some optional options
  //var options = allBindingsAccessor().fillerOptions || {};
  filler = xr2filler($('#content'), { baseUrl: Meteor.absoluteUrl() });
  window.filler = filler; // for testing

  // wait for the filler to be ready
  $('#content').on('xr2filler:loaded', function () {
    // load demo fields
    var auxData = $.parseJSON('[{"FieldId":"c63bbfbd48e28118a66a9828ed8e8f3a-container","FieldType":1,"PositionTop":"70","PositionLeft":"308","FieldWidth":"160","FieldHeight":"29","Html":"<div id=\\"c63bbfbd48e28118a66a9828ed8e8f3a-container\\" class=\\"field\\" style=\\"opacity: 1; left: 308px; top: 70px; width: 160px; height: 29px;\\">    <input type=\\"text\\" name=\\"My field 1\\" id=\\"c63bbfbd48e28118a66a9828ed8e8f3a\\">       </div>","CustomValidationData":"[]","DependencyData":"[]","FieldName":"My field 1","Tooltip":"tooltip example","DisplayLabels":false,"ReadOnly":false,"IsGroup":false,"Required":true,"UseCurrentDate":false,"RangeDateMinUseCurrent":false,"RangeDateMaxUseCurrent":false,"Style":"{\\"border-color\\":{\\"value\\":\\"Black\\"},\\"font-size\\":{\\"value\\":\\"18px\\"},\\"font-family\\":{\\"value\\":\\"serif\\"},\\"text-align\\":{\\"value\\":\\"center\\"}}"},{"FieldId":"9d36b365281a99df31adf8745dcdaaf3-container","FieldType":7,"PositionTop":"197","PositionLeft":"195","FieldWidth":"48","FieldHeight":"89","Html":"<div id=\\"9d36b365281a99df31adf8745dcdaaf3-container\\" class=\\"field radio-group\\" style=\\"opacity: 1; width: 48px; height: 89px; left: 195px; top: 197px;\\">    <div class=\\"option clearfix ui-draggable\\" style=\\"position: relative;\\"><input type=\\"radio\\" name=\\"My field 2\\" id=\\"9d36b365281a99df31adf8745dcdaaf3-1\\" value=\\"Value 1\\" style=\\"opacity: 0;\\"><span class=\\"option-title\\"></span></div>    <div class=\\"option clearfix ui-draggable\\" style=\\"position: relative;\\"><input type=\\"radio\\" name=\\"My field 2\\" id=\\"9d36b365281a99df31adf8745dcdaaf3-2\\" value=\\"Value 2\\" style=\\"opacity: 0;\\"><span class=\\"option-title\\"></span></div>       <div class=\\"option clearfix ui-draggable\\" style=\\"position: relative;\\">    <input type=\\"radio\\" name=\\"My field 2\\" id=\\"9d36b365281a99df31adf8745dcdaaf3-3\\" value=\\"Value 3\\" style=\\"opacity: 0;\\"><span class=\\"option-title\\"></span><br>   </div></div>","CustomValidationData":"[]","DependencyData":"[]","FieldName":"My field 2","DisplayLabels":false,"ReadOnly":false,"IsGroup":false,"Required":true,"UseCurrentDate":false,"RangeDateMinUseCurrent":false,"RangeDateMaxUseCurrent":false,"Style":"{}"},{"FieldId":"453a80a44d71d2af72e68de41f6d4add-container","FieldType":8,"PositionTop":"203","PositionLeft":"363","FieldWidth":"46","FieldHeight":"58","Html":"<div id=\\"453a80a44d71d2af72e68de41f6d4add-container\\" class=\\"field checkbox-group\\" style=\\"opacity: 1; width: 46px; height: 58px; left: 363px; top: 203px;\\">    <div class=\\"option clearfix ui-draggable\\" style=\\"position: relative;\\"><input type=\\"checkbox\\" name=\\"My field 3\\" id=\\"453a80a44d71d2af72e68de41f6d4add-1\\" value=\\"Value 1\\" style=\\"opacity: 0;\\"><span class=\\"option-title\\"></span><br></div>    <div class=\\"option clearfix ui-draggable\\" style=\\"position: relative;\\"><input type=\\"checkbox\\" name=\\"My field 3\\" id=\\"453a80a44d71d2af72e68de41f6d4add-2\\" value=\\"Value 2\\" style=\\"opacity: 0;\\"><span class=\\"option-title\\"></span><br></div>       </div>","CustomValidationData":"[]","DependencyData":"[{\\"mode\\":\\"basic\\",\\"conditionOperator\\":\\"or\\",\\"conditions\\":[{\\"fieldId\\":\\"9d36b365281a99df31adf8745dcdaaf3-container\\",\\"comparer\\":\\"equals\\",\\"value\\":\\"9d36b365281a99df31adf8745dcdaaf3-2\\"}],\\"actions\\":[{\\"type\\":\\"basic\\",\\"selector\\":\\"453a80a44d71d2af72e68de41f6d4add-2\\",\\"basicName\\":\\"select\\",\\"property\\":\\"selected\\",\\"value\\":\\"selected\\",\\"evalOtherwise\\":\\"true\\",\\"otherwiseValue\\":\\"_XR2_EMPTY_VAL_\\"}]}]","FieldName":"My field 3","DisplayLabels":false,"ReadOnly":false,"IsGroup":false,"Required":false,"UseCurrentDate":false,"RangeDateMinUseCurrent":false,"RangeDateMaxUseCurrent":false,"DependencyCount":1,"Style":"{}"},{"FieldId":"b180d65fc47c12c1d8ea1be409df9e46-container","FieldType":1,"PositionTop":"160","PositionLeft":"585","FieldWidth":"160","FieldHeight":"28","Html":"<div id=\\"b180d65fc47c12c1d8ea1be409df9e46-container\\" class=\\"field\\" style=\\"opacity: 1; left: 585px; top: 160px; width: 160px; height: 28px;\\">    <input type=\\"text\\" name=\\"My field 4\\" id=\\"b180d65fc47c12c1d8ea1be409df9e46\\">       </div>","CustomValidationData":"[]","DependencyData":"[]","FieldName":"My field 4","DisplayLabels":false,"ReadOnly":false,"IsGroup":false,"Required":true,"Pattern":"([a-z A-Z])*","MinimumLength":"1","MaxLength":"10","UseCurrentDate":false,"RangeDateMinUseCurrent":false,"RangeDateMaxUseCurrent":false,"Style":"{\\"font-size\\":{\\"value\\":\\"15px\\"}}"}]');
    var auxValues = [{ PageFieldId: "c63bbfbd48e28118a66a9828ed8e8f3a-container", Value: "test value"}, { PageFieldId: "9d36b365281a99df31adf8745dcdaaf3-container", Value: '[{"Value":"Value 3"}]'}, { PageFieldId: "453a80a44d71d2af72e68de41f6d4add-container", Value: '[{"Value":"Value 1"},{"Value":"Value 2"}]'}];
    filler.setFieldsMetadata(auxData, auxValues); // the filler clears the form before setting the new fields

    // validate the page - if the page doesn't validate, the promise will fail
    filler.validatePage().done(function() {
        // obtain the page field values
        var pageValues = filler.getFieldValues();
      });
  });
};






