import './widgets/Widgets';
import './draggable/Draggable';

(function () {
  'use strict';

  angular.module('pipDashboard', [
    'pipWidget', 
    'pipDragged', 
    'pipWidgetConfigDialog', 
    'pipAddDashboardComponentDialog',
    'pipDashboard.Templates',

    // External pip modules
    'pipLayout',
    'pipLocations',
    'pipDateTime',
    'pipCharts',
    'pipTranslate',
    'pipControls'
  ]);
  
})();

import './utility/WidgetTemplateUtility';
import './dialogs/widget_config/ConfigDialogController';
import './dialogs/add_component/AddComponentDialogController';
import './DashboardController';
import './DashboardComponent';
