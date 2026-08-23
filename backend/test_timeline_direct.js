const deviceService = require('./src/services/deviceService');

async function testDirect() {
  try {
    const res = await deviceService.getDeviceTimeline(1);
    console.log('Success:', res);
  } catch (err) {
    console.error('Error in getDeviceTimeline:', err);
  }
  process.exit(0);
}

testDirect();
