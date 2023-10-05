# Report Collector

This repo contains code and artifacts to setup a report collector system for collecting and storing Network Error Logs sent in JSON format. I will also demonestrate a end-to-end report collection using Outline connectivity tester client, however, the proposed methods can be used with any system that wants to log and report network errors in JSON format (such as . Other formats must be converted to JSON on the client side. 

I am going to propose several mechanisms for report collecting and compare pros/cons of each approach. A resilient report collecting system must satisfy as many as following properties:

- Easy to setup
- No/light client dependencies 
- Distributed and resilient
- Scalable

 ## Methods 1

In the first method, I show how to use Google Spreadsheets with App scripts to collect reports. I will first walk you through the setup proccess and then discuss teh pros and cons of this approach. 

1. Create a new Google Sheet where you want to store the incoming data.
2. Click on Extensions > Apps Script to open the script editor.
3. Delete any existing code in the editor, and paste in the following script:
4. Save your script.
5. Now, to publish your script as a web app, click on Publish > Deploy as web app....
6. In the Who has access to the app: dropdown, select Anyone. This means that anyone can make a POST request to your web app.
7. Click on Deploy.

Copy the URL provided as it will be the endpoint for the POST request.

Now, when you make a POST request to the provided URL with JSON data in the body, the data will be appended to the Google Sheet:

```
curl -X POST -H "Content-Type: application/json" -d '{"column1": "value1", "column2": "value2"}' YOUR_WEB_APP_URL
```

Make sure to replace `YOUR_WEB_APP_URL` with the URL you got when you deployed the web app.

### Security

```
var API_TOKEN = "YOUR_SECRET_API_TOKEN";  // Replace with your desired token

function doPost(e) {
...
  // Check for the correct API token
  if (!e.parameter.apiToken || e.parameter.apiToken !== API_TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({
      'result': 'error',
      'message': 'Invalid API Token'
    })).setMimeType(ContentService.MimeType.JSON);
  }
```
