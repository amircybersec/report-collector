# Report Collector

This repo contains code and artifacts to setup a report collector system for collecting and storing Network Error Logs sent in JSON format. I will also demonestrate a end-to-end report collection using Outline connectivity tester client, however, the proposed methods can be used with any system that wants to log and report network errors in JSON format (such as . Other formats must be converted to JSON on the client side. 

I am going to propose several mechanisms for report collecting and compare pros/cons of each approach. A resilient report collecting system must satisfy as many as following properties:

- Easy to setup
- No/light client dependencies 
- Distributed and resilient
- Scalable

 ## Methods 1: Google Apps Scripts

In the first method, I show how to use Google Spreadsheets with App scripts to collect reports. I will first walk you through the setup proccess and then discuss teh pros and cons of this approach. 

1. Create a new [Google Sheet](https://docs.google.com/spreadsheets) where you want to store the incoming data.
2. Click on `Extensions > Apps Script` to open the script editor.
3. Delete any existing code in the editor, and paste in the content of script located at `app_script/script.js`
4. Save your script.
5. Now, to publish your script as a web app, click on `Publish > Deploy` as web app....
6. In the Who has access to the app: dropdown, select Anyone. This means that anyone can make a POST request to your web app.
7. Click on Deploy.

Copy the URL provided as it will be the endpoint for the POST request.

Screenshots below demonestrate the process visually:

![deploy](https://github.com/amircybersec/report-collector/assets/117060873/674f79bf-865d-48ed-9e1a-a8c7cda634c3)

![web-app](https://github.com/amircybersec/report-collector/assets/117060873/ef65a56b-3496-4fb4-80ac-7213e8dc98ef)


Now, when you make a POST request to the provided URL with JSON data in the body, the data will be appended to the Google Sheet:

```
curl -X POST -H "Content-Type: application/json" -d '{"resolver":"8.8.8.8:53","proto":"tcp","time":"2023-10-05T04:34:12Z","duration_ms":5003,"error":{"op":"dial","posix_error":"ETIMEDOUT","msg":"i/o timeout"}}' YOUR_WEB_APP_URL?apiToken=YOUR_SECRET_API_TOKEN
```
In the above request, I am using a sample JSON report from Outline connectivity tester. However, the payload can be any JSON object.  Make sure to replace `YOUR_WEB_APP_URL` with the URL you got when you deployed the web app. If you have defined an API token in your script, make sure you also include it in the URL (`?apiToken=YOUR_SECRET_API_TOKEN`) 

After making the POST reqyest, you can see that a row gets added to your Google Spreadsheet. The header values (first row) are extracted from JSON keys. Additionally, the Apps script flatens the JSON object and dynamically adds new keys into the header.   

![spreadsheet](https://github.com/amircybersec/report-collector/assets/117060873/eea88180-8fda-4d07-b3c8-7c42013d31a9)


### Notes

#### Pros: 
- The Apps Script setup process is very straightforward and does not require any technical knowledge using the provided script here. Those who are interested in spinning up their private report collector can do it in a matter minutes. 

- Using this service is also free (subject to usage limitations explained below)

- Since Apps scripts relies on Google Infrasctuctre, I would assume it will be able to handle burst requests, though I have not verified the speed.

#### Cons:

- The API calls are subject to quotas and limitations on number of daily API calls. This depends on the type of account (personal/workspace). More details on this can be found [here](https://developers.google.com/apps-script/guides/services/quotas).

- Google services may not be accessible in certain countries (such as China) and requests to the script.google.com URL probably get blocked there. As a work around, the URL can be placed behind a reachable CDN or proxy. Since the job of report collector is to collecting network error logs and blocking reports, report collector service itself must be more resilient and not easily blocked. In future solutions, I aim to enhance resiliency of report collectors against blocking.

#### Security:
```
var API_TOKEN = "YOUR_SECRET_API_TOKEN";  // Replace with your desired token
```
