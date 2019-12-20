const optimizelySDK = require('@optimizely/optimizely-sdk'),
  defaultLogger = require('@optimizely/optimizely-sdk/lib/plugins/logger'),
  rp = require('request-promise');

let optimizelyClientInstance;
let initOptimizely = async (projectID) => {

  // Options to get the datafile via CDN
  let options = {
    uri: `https://cdn.optimizely.com/json/17147660659.json`,
    json: true
  }

  console.log('Initializing Optimizely Client');

  // Options to get the datafile via REST api
  // let options = {
  //     uri: `https://www.optimizelyapis.com/experiment/v1/projects/${projectID}/json`,
  //   headers: {
  //       'Authorization': 'Bearer ' + process.env.OPTIMIZELY_TOKEN
  //   },
  //   json: true
  // };

  // Returns promise to make GET request to Optimizely API
  return rp(options)
    .then((datafile) => {
      console.log('Here\s the datafile: ', datafile);
      optimizelyClientInstance = optimizelySDK.createInstance(
        {
          datafile: datafile, // Datafile returned from request
          logger: defaultLogger.createLogger({ logLevel: 1 }) // Default logger provided by SDK
        }
      )
    })
    .catch((err) => {
      console.log('There was an error: ', err);
    })
  
};

const OptimizelyDemoHandler = async () => {
  let userId = '12345';
  const html1 = '<h1>Test 1</h1>',
    html2 = '<h1>Test 2</h2>',
    html3 = '<h1>Test 3</h2>';


  if (!optimizelyClientInstance) {
    await initOptimizely('17147660659');
  }
  var variation = optimizelyClientInstance.activate('Lambda', userId);
  if (variation === 'variation_1') {
    // execute code for variation_1
    optimizelyClientInstance.track('viewPage1', userId);
    return html1;
  } else if (variation === 'variation_2') {
    // execute code for variation_2
    optimizelyClientInstance.track('viewPage2', userId);
    return html2;
  } else {
    // execute default code
    return html3;
  }


}
exports.handler = function (event, context, callback) {
  var start = new Date();
  OptimizelyDemoHandler().then(function(data){
    console.log(data, 'data');
    var end = new Date() - start
    console.info('Execution time: %dms', end);
    callback(null, {
      statusCode: 200,
      body: data
    });
  });
};
