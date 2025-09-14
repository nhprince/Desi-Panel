// Development stubs for email provisioning (mailboxes and forwarders)
// In production, integrate with Postfix/Dovecot (e.g., update virtual_mailbox_maps, virtual_alias_maps),
// create maildirs, and reload services.

async function provisionMailbox(domainName, localPart, quotaMb) {
  console.log(`[EMAIL STUB] provision mailbox ${localPart}@${domainName} quota=${quotaMb}MB`)
}

async function setMailboxPassword(domainName, localPart, password) {
  console.log(`[EMAIL STUB] set password for ${localPart}@${domainName}`)
}

async function setMailboxStatus(domainName, localPart, status) {
  console.log(`[EMAIL STUB] set status for ${localPart}@${domainName} => ${status}`)
}

async function deleteMailbox(domainName, localPart) {
  console.log(`[EMAIL STUB] delete mailbox ${localPart}@${domainName}`)
}

async function createForwarder(sourceEmail, destinationEmail) {
  console.log(`[EMAIL STUB] create forwarder ${sourceEmail} -> ${destinationEmail}`)
}

async function deleteForwarder(sourceEmail, destinationEmail) {
  console.log(`[EMAIL STUB] delete forwarder ${sourceEmail} -> ${destinationEmail}`)
}

module.exports = {
  provisionMailbox,
  setMailboxPassword,
  setMailboxStatus,
  deleteMailbox,
  createForwarder,
  deleteForwarder,
}
