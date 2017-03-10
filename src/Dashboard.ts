import './widgets/Widgets';
import './draggable/Draggable';

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

import './utility/WidgetTemplateUtility';
import './dialogs/widget_config/ConfigDialogController';
import './dialogs/add_component/AddComponentDialogController';
import './DashboardComponent';
