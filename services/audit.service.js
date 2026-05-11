const AuditLog = require('../models/auditLog.model');

async function logAction({ actor, actorType, action, category = 'system', metadata = {}, req = null }) {
  const log = {
    actor,
    actorType,
    action,
    category,
    metadata,
  };
  if (req) {
    log.ipAddress = req.ip;
    log.userAgent = req.get('User-Agent');
  }
  return AuditLog.create(log);
}

module.exports = { logAction };
