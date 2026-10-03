const { MongoMemoryServer } = require('mongodb-memory-server');

async function main() {
  try {
    const mongoServer = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'hostelease',
      },
    });
    console.log(`[MongoMemoryServer] Running on port 27017 at URI: ${mongoServer.getUri()}`);
  } catch (err) {
    console.error('[MongoMemoryServer] Error starting server:', err);
    process.exit(1);
  }
}

main();
