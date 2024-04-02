# Network Error Log Collection

This document aims to discuss high-level software requirements for collecting and consuming network error logs captured on a client. 

## Problem statement

When a VPN app (or any other generic client that makes network calls) cannot access the remote destination server over the internet, it is difficult to understand the cause of failure. 

Modern web browsers implement NEL (network error logging) that can collect and send reports to a remote collector. 

However this is specifically designed for standard web traffic and not accessible to use in other standalone client applications (such as mobile apps). 

## Separation of concerns 

An end-to-end report collection system encampasses several components, including:

1. Client side component

The client application can log and capture a set of error logs that reflect various types of connection failure or success. The client needs to pick a data format that encapsulates this information. Ideally apps can conform to existing data formats or be allowed to define their own formats. 

As an example, NEL uses a JSON data format that adheres to this spec. 

2. Collector server 

The collector server receives this data and stores it for later consumption. The server should expose an API to the client; some level of protection is required to prevent links from being spammed with junk data such as issuing API tokens to the clients or using a long secret URL. Storage limits can be enforced with auto purge to keep the log size constants for each URL. 

It must also be resilient, easy to set up, and use as I will discuss below in more details. 

3. Consumption of reports; Analysis and visualization

The last step is to analyze and make sense of the report to gain insight into the underlying root causes and find a work-around for example if a blocking is taking place. Consumption of the log data requires that the report data adheres to some known format (either user defined or standard format). This way information can be easily extracted from the data and analyzed. 


## Target audience and UX

This system can be used by the following target groups:

### 1. Developers & users of VPN and networking apps:
Developers can incorporate this functionality into their apps to offer a facility to collect logs and send them to a remote connector. 

The developers may also allow their app users to specify a custom collector address to which logs are submitted to. The address can be incorporated into the server access key as a parameter as well. 

For example, I implemented this concept in the [Outline connectivity tester app](https://github.com/Jigsaw-Code/outline-sdk/pull/170), [Blazer proxy app](https://github.com/amircybersec/FyneProxy) as well as [Outline connectivity CLI](https://github.com/Jigsaw-Code/outline-sdk/tree/main/x/examples/test-connectivity). In all of these applications, the end-user can input a URL to indicate the address of the remote collector server.

Also, I implemented a [report package](https://github.com/Jigsaw-Code/outline-sdk/tree/main/x/report) in Go that collects a report and submits it to a remote destimation. The idea is to just `import` a package in the client app and call a function to collect and submit a report.



### 2. Service providers (service managers)
Network error logging from client vantage points can assist service providers in troubleshooting and addressing potential blocking issues and improve their service offering. In theory, they could use the reports to adaptively adjust the transport to bypass blocking. 

Service providers may prefer to setup and utilize their own private collectors, and potentially setup a redirect to relay reports to a public after some post-processing to redact PID and other sensetive information.

Depending on the client support, the address of the collector can be embedded into access key URL shared with the end-user.

### 3. Internet Freedom Community 
The community at large can benefit from reports and analysis based on such reports and aggregate of results to gain insights into common blocking techniques and their impacts. 

Public collectors can play an important role here. Private collectors could potentially opt-in to share their findings with a public collector. 

There are privacy considerations here and any PID or credentials must be redacted in such reports and client & server IP addresses must be mapped to ASNs and not included in reports.
 
## System attributes

A winning system design should satisfy the following high-level requirements as much as possible:

- Resilient (accessible and hard to block)
- Easy to integrate into any client application
- Easy to set up a collector to begin collecting logs

**Resilience**: Blocking report collector destinations is by nature more challenging since (1) the traffic does not have characteristics of a tunneling traffic; It’s legit HTTPS (2) the amount of data is small, it can be stored and sent whenever a connection is made (could be through a VPN or not). However, it helps if collectors are decentralized. Centralized aggregators can potentially pull logs from various collectors, analyze, and visualize the results. Collector servers can also be proxied behind cloudflare or other CDNs to increase resilience. 

**Easy to integrate into Apps**:
The clients should be able to collect and send the reports in a few lines of code. It should be easy to do that in any programming language and use common design patterns. For example, I have opted to use JSON to encapsulate the log information and send it via a simple HTTP POST request. Other options such as mTLS gRPC are possible but could impose unnecessary frictions in terms of integration and use. 

**Easy to setup a collector**:
Ideally anyone should be able to spin off their own report collector server with a few clicks. 

For example, I have [demonstrated](https://github.com/amircybersec/report-collector) use of Google App Scripts to set up a report collector that uses Google spreadsheet to collect data, possibly analyze and visualize with spreadsheet formulas. Service providers such as OONI can play a crucial role in offering their infrastructure to help accomplish this objective. 

## What information should the log contain:

At the base level, posix socket error codes and messages can provide insights into TCP/UDP level issues. Transport and application specific error messages can capture errors related to DNS, HTTP(S), TLS. 

[Section 6](https://www.w3.org/TR/network-error-logging/#predefined-network-error-types) of NEL specification provide a list of application level and socket level errors: 

The client can possibly run custom connectivity experimments and include their results.

## Additional thoughts
I have looked into various approaches to set up a remote report collector. Below is a quick summary of my findings:

1. [OpenTelemetry](https://opentelemetry.io/)

- Pros
    - Open source and widely adopted for metrics and trace collection
    - sophisticated and comes with lots of bells and whistles
    - Available open source collector servers such as [Jaeger](https://www.jaegertracing.io/)
- Cons
    - Require adherence to OTLP protocol
    - Bloats the client and can be an overkill
    - Designed for distributed tracing from multiple microservices 

2. Sentry
- Pros
    - Easy to set up
    - Good client support
- Cons
    - Vendor specific 
    - Require payment after certain limits are passed
    - Centralized and susceptible to blocking

Other possible options:
- Cloud functions (Google, AWS, Digital Ocean)
- Influxdb Cloud
- Grafana Cloud
