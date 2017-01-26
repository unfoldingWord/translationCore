
{//this is a temporary fix
  api.Toast.info('Generating reports...', '', 3);
  const Report = require("../components/core/reports/ReportGenerator");
  api.emitEvent('ReportVisibility', { 'visibleReport': 'true' });
}
