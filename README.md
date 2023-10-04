# Report Collector

This repo contains code and artifacts to setup a report collector system for collecting and storing Network Error Logs sent in JSON format.

I am going to propose several mechanisms for report collecting and compare pros/cons of each approach. A resilient report collecting system must satisfy as many as following properties:

- Easy to setup
- Decoupled from clients
- Distributed and resilient
- Able to collect large number incoming of reports

 ## Methods 1

 In the first method, I show how to use Google Spreadsheets with App scripts to collect reports. This method has several advantages (and also disadvangtes). 

 

