import './widgets/index';
import './draggable/index';
console.log('here');
angular.module('pipDashboard', [
  'pipWidget',
  'pipDragged',
  'pipDashboardDialogs',
  'pipDashboard.Templates',

  // External pip modules
  'pipLayout',
  'pipLocations',
  'pipDateTime',
  'pipCharts',
  'pipTranslate',
  'pipControls',
  'pipButtons'
]);

import './utility/WidgetTemplateUtility';
import './dialogs/index';
import './Dashboard';
