const dns = require('dns');
const resolver = new dns.Resolver();
resolver.setServers(['8.8.8.8', '8.8.4.4']);

// Get TXT record which contains the replicaSet name
resolver.resolveTxt('cluster0.cpqjpgf.mongodb.net', (err, records) => {
  if (err) {
    console.error('TXT error:', err.message);
  } else {
    console.log('TXT records:');
    records.forEach(r => console.log(' ', r.join('')));
  }
});
