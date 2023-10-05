# Report Collector

This repo contains code and artifacts to setup a report collector system for collecting and storing Network Error Logs sent in JSON format. I will also demonestrate a end-to-end report collection using Outline connectivity tester client, however, the proposed methods can be used with any system that wants to log and report network errors in JSON format (such as . Other formats must be converted to JSON on the client side. 

I am going to propose several mechanisms for report collecting and compare pros/cons of each approach. A resilient report collecting system must satisfy as many as following properties:

- Easy to setup
- Decoupled from clients
- Distributed and resilient
- Able to collect large number incoming of reports

 ## Methods 1

 In the first method, I show how to use Google Spreadsheets with App scripts to collect reports. This method has several advantages (and also disadvangtes). 

 

