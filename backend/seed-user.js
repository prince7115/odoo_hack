const { MongoClient } = require('mongodb');

async function run() {
  const uri = 'mongodb://pradiprup37_db_user:veMYHR5caFXDgx12@ac-qyzictr-shard-00-00.cpqjpgf.mongodb.net:27017,ac-qyzictr-shard-00-01.cpqjpgf.mongodb.net:27017,ac-qyzictr-shard-00-02.cpqjpgf.mongodb.net:27017/assetflow_db?replicaSet=atlas-hzte99-shard-0&authSource=admin&tls=true&w=majority&retryWrites=true';
  const client = new MongoClient(uri);

  try {
    await client.connect();
    const db = client.db('assetflow_db');
    const employees = db.collection('employees');
    
    // Upsert the user's email as an ADMIN
    await employees.updateOne(
      { email: 'pradiprup37@gmail.com' },
      { 
        $set: { 
          email: 'pradiprup37@gmail.com',
          name: 'Pradip (Admin)',
          role: 'ADMIN',
          active: true,
          updatedAt: new Date()
        },
        $setOnInsert: {
          createdAt: new Date()
        }
      },
      { upsert: true }
    );
    console.log('Successfully created/updated admin account for pradiprup37@gmail.com');
  } finally {
    await client.close();
  }
}

run().catch(console.dir);
